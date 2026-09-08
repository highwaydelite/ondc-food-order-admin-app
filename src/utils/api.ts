import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import { getKeyCloakToken, redirectToLogin, refreshToken } from "../config";
import {
  ApiError,
  AuthConfigurationError,
  apiErrorFromAxios,
  apiErrorFromResponse,
  isCancelledError,
} from "./apiError";
import type { OrderFilterState } from "./adminEnums";
import {
  buildOrderFilterParams,
  normalizePagination,
  toSearchParams,
} from "./orderQueryParams";
import { istEndOfDayISO, istStartOfDayISO } from "./dateRange";

export const API_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;

/**
 * Every `/orders/admin/*` endpoint now requires a Keycloak bearer token carrying the
 * ADMIN client role, so the token has to be fresh on every call — including the CSV
 * export, which is fetched rather than opened in a new tab.
 */
export const getAccessToken = async (): Promise<string | null> =>
  getKeyCloakToken();

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(apiErrorFromAxios(error))
);

type RetriableConfig = AxiosRequestConfig & { _retriedAfterRefresh?: boolean };

/**
 * Authorization is enforced entirely by the backend; the frontend only reacts to it.
 *
 * 401 -> run the refresh flow and replay the request once. If a freshly refreshed
 *        token is rejected too, stop: refreshing again would loop, so surface a
 *        configuration error instead.
 * 403 -> surfaced as an error state and never retried. Not expected for admin users.
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // A superseded/aborted request is not an API failure — pass it through untouched.
    if (isCancelledError(error)) return Promise.reject(error);

    const status = error?.response?.status;
    const config = error?.config as RetriableConfig | undefined;

    if (status === 401 && config) {
      if (config._retriedAfterRefresh) {
        return Promise.reject(new AuthConfigurationError());
      }

      config._retriedAfterRefresh = true;
      const user = await refreshToken();

      if (user?.access_token && !user.expired) {
        config.headers = {
          ...(config.headers ?? {}),
          Authorization: `Bearer ${user.access_token}`,
        };
        return axiosInstance.request(config);
      }

      // The refresh flow itself failed — the session really is gone.
      await redirectToLogin();
    }

    if (status === 403) {
      console.error(
        `[api] 403 Forbidden on ${config?.method?.toUpperCase() ?? "GET"} ${
          config?.url ?? ""
        } — the backend rejected this token's permissions.`
      );
    }

    return Promise.reject(apiErrorFromAxios(error));
  }
);

export type OrdersListParams = {
  page: number;
  limit: number;
} & Partial<OrderFilterState>;

/**
 * `page` and `limit` are mandatory now (integers >= 1) — omitting them, or sending 0
 * or an empty string, is a 400. There is no "fetch everything" mode any more; use
 * the CSV export for bulk data.
 */
export async function getOrders(
  params: OrdersListParams,
  /** react-query's per-query signal, so a superseded search is aborted in flight. */
  signal?: AbortSignal
) {
  const { page, limit } = normalizePagination(params.page, params.limit);
  const query = {
    page,
    limit,
    ...buildOrderFilterParams(params),
  };

  try {
    const response = await axiosInstance.get(`/orders/admin/orders/`, {
      params: query,
      signal,
    });
    return response.data;
  } catch (error) {
    if (isCancelledError(error)) throw error;
    throw apiErrorFromAxios(error);
  }
}

/** An unknown orderId comes back as 400 "Order not found" here, not 404. */
export async function getOrderById(orderId: string) {
  try {
    const response = await axiosInstance.get(
      `/orders/admin/order-details/${orderId}`
    );
    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}

/**
 * 18 columns. `Transfer Status` / `Transfer Status Updated At` /
 * `Transfer Settlement Status` were inserted at 15-17, pushing `Created At` to 18.
 * Only used as an integrity check on the streamed response — nothing here parses the
 * CSV positionally.
 */
export const CSV_EXPORT_HEADER =
  "Order ID,Payment Order ID,Restaurant Name,User Name,User Phone,Amount,Order Status,Order Status Updated At,Payment Status,Payment Status Updated At,Issue Status,Issue Status Updated At,Settlement Status,Settlement Status Updated At,Transfer Status,Transfer Status Updated At,Transfer Settlement Status,Created At";

/**
 * Streamed CSV (not XLSX any more). It needs the Authorization header, so it cannot be
 * a `window.open` / `<a href>` download — the header would not be sent and the browser
 * would save the 401 JSON body as a file.
 *
 * There is no Content-Length on the response, so progress cannot be reported; callers
 * should show an indeterminate spinner.
 */
export async function exportOrdersCsv(
  filters: Partial<OrderFilterState> | null | undefined,
  { retriedAfterRefresh = false }: { retriedAfterRefresh?: boolean } = {}
): Promise<Blob> {
  const token = await getAccessToken();
  if (!token) {
    await redirectToLogin();
    throw new ApiError("Unauthorized", 401);
  }

  const search = toSearchParams({ ...buildOrderFilterParams(filters) });
  const query = search.toString();
  const response = await fetch(
    `${API_BASE_URL}/orders/admin/export${query ? `?${query}` : ""}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  // Must run before the body is treated as a file, or a 401 gets saved as orders.csv.
  if (!response.ok) {
    const apiError = await apiErrorFromResponse(response);

    if (apiError.isUnauthorized) {
      // A freshly refreshed token was rejected too — refreshing again would loop.
      if (retriedAfterRefresh) throw new AuthConfigurationError();

      const user = await refreshToken();
      if (user?.access_token && !user.expired) {
        return exportOrdersCsv(filters, { retriedAfterRefresh: true });
      }
      await redirectToLogin();
    }
    throw apiError;
  }

  const blob = await response.blob();

  // The stream can die mid-flight after the 200 headers are already sent, which
  // yields a silently truncated file. A missing/mangled header row catches the worst case.
  if (blob.size === 0) {
    throw new ApiError(
      "The export came back empty. Please try again.",
      response.status
    );
  }

  const firstLine = (await blob.slice(0, CSV_EXPORT_HEADER.length + 4).text())
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)[0]
    .trim();
  if (firstLine !== CSV_EXPORT_HEADER) {
    throw new ApiError(
      "The export file looks incomplete. Please try again.",
      response.status
    );
  }

  return blob;
}

export async function getSettlements(params: {
  page: number;
  limit: number;
  settleStatus?: string;
  sellerStatus?: string;
  selfStatus?: string;
  type?: string;
  createdAt?: { startDate: string; endDate: string };
  updatedAt?: { startDate: string; endDate: string };
  amount?: { min: string; max: string };
  transactionId?: string;
  messageId?: string;
  bppId?: string;
  receiverAppId?: string;
  cityCode?: string;
  reconAccord?: string;
}) {
  try {
    const { page, limit } = normalizePagination(params.page, params.limit);

    // Build query parameters object
    const queryParams: any = { page, limit };

    // Add status filters if they exist
    if (params.settleStatus) queryParams.settleStatus = params.settleStatus;
    if (params.sellerStatus) queryParams.sellerStatus = params.sellerStatus;
    if (params.selfStatus) queryParams.selfStatus = params.selfStatus;
    if (params.type) queryParams.type = params.type;

    // Date filters are stored as IST business days and widened to the exact
    // instants that bound that day, using the same helpers as the orders list.
    const createdStart = istStartOfDayISO(params.createdAt?.startDate);
    const createdEnd = istEndOfDayISO(params.createdAt?.endDate);
    const updatedStart = istStartOfDayISO(params.updatedAt?.startDate);
    const updatedEnd = istEndOfDayISO(params.updatedAt?.endDate);

    if (createdStart) queryParams.createdStartDate = createdStart;
    if (createdEnd) queryParams.createdEndDate = createdEnd;
    if (updatedStart) queryParams.updatedStartDate = updatedStart;
    if (updatedEnd) queryParams.updatedEndDate = updatedEnd;

    // Add amount filters if they exist
    if (params.amount?.min)
      queryParams.minAmount = parseFloat(params.amount.min);
    if (params.amount?.max)
      queryParams.maxAmount = parseFloat(params.amount.max);

    // Add search filters if they exist
    if (params.transactionId) queryParams.transactionId = params.transactionId;
    if (params.messageId) queryParams.messageId = params.messageId;
    if (params.bppId) queryParams.bppId = params.bppId;
    if (params.receiverAppId) queryParams.receiverAppId = params.receiverAppId;
    if (params.cityCode) queryParams.cityCode = params.cityCode;

    // Add recon accord filter if it exists
    if (params.reconAccord)
      queryParams.reconAccord = params.reconAccord === "true";

    const response = await axiosInstance.get(`/settlement/all`, {
      params: queryParams,
    });

    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}

/* ------------------------------------------------------------------------- *
 * Manual (offline) seller settlements.
 *
 * The payout itself happens outside the system — a person makes a bank transfer and
 * then records the UTR here. There is no automated payout, no partial settle and no
 * un-settle, so every write below is final.
 *
 * Amounts are inconsistently typed across these endpoints: `pendingAmount` and the
 * settle response's `totalAmount` are JSON numbers, while `sellerAmount` and the
 * stored `totalAmount` are strings ("249.5"). Callers must coerce — `formatAmount`
 * and `toAmount` in utils/formatDate both take either.
 * ------------------------------------------------------------------------- */

/** Seller-wise pending amounts. Only orders delivered before today are counted. */
export async function getPendingSellerSettlements() {
  try {
    const response = await axiosInstance.get(`/seller-settlements/pending`);
    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}

/** The orders making up one seller's pending amount — informational only. */
export async function getPendingSellerOrders(sellerId: string) {
  try {
    const response = await axiosInstance.get(
      `/seller-settlements/pending/${sellerId}/orders`
    );
    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}

/**
 * Records a payout that has already been made offline. Settles ALL of that seller's
 * currently-pending orders under one UTR — the server re-resolves the order list, so
 * there is nothing to send but the reference.
 *
 * 400 "No pending settlement for this seller" means someone else settled it first;
 * the caller's pending list is stale and must be refetched.
 */
export async function settleSeller(data: {
  sellerId: string;
  utrNumber: string;
}) {
  try {
    const response = await axiosInstance.post(
      `/seller-settlements/${data.sellerId}/settle`,
      { utrNumber: data.utrNumber }
    );
    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}

/**
 * Completed settlements, newest first. The payload is double-nested: the rows are at
 * `data.data.data` with the pagination metadata alongside them at `data.data.total`.
 */
export async function getSellerSettlements(params: {
  page: number;
  limit: number;
}) {
  try {
    const { page, limit } = normalizePagination(params.page, params.limit);
    const response = await axiosInstance.get(`/seller-settlements`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}

/** The orders that were included in one completed settlement. 404 if unknown. */
export async function getSellerSettlementOrders(settlementId: string) {
  try {
    const response = await axiosInstance.get(
      `/seller-settlements/${settlementId}/orders`
    );
    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}

export async function selfSettle(data: { amount: number }) {
  try {
    const requestData = {
      type: "MISC",
      bap_id: "ondc.preprod.rzervit.com",
      bap_uri: "https://ondc.preprod.rzervit.com/trv14",
      city: "std:080",
      order: [
        {
          self: {
            amount: {
              currency: "INR",
              value: data.amount.toString(),
            },
          },
        },
      ],
    };
    const response = await axiosInstance.post("/settle", requestData);
    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}

export async function sendRecon(data: {
  orderId: String;
  transactionId: String;
}) {
  try {
    const response = await axiosInstance.post("/send_recon", data);
    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}

export async function getSettlementById(settlementId: string) {
  try {
    const response = await axiosInstance.get(`/settlement/${settlementId}`);
    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}

export async function updateAmount(data: {
  orderId: string;
  totalAmount: number;
  sellerAmount: number;
  tcs: number;
  tds: number;
  buyerAmount: number;
}) {
  try {
    const response = await axiosInstance.patch("/update_amount", data);
    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}

export async function approveCorrection(orderId: string) {
  try {
    const response = await axiosInstance.post(`/approve_correction`, {
      orderId,
    });
    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}

export async function report(data: {
  city: String;
  transaction_id: string;
  message_id: String;
}) {
  try {
    const response = await axiosInstance.post("/report", {
      city: data.city,
      transaction_id: data.transaction_id,
      message_id: data.message_id,
    });
    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}

export async function registerIssue(data: {
  city: String;
  transaction_id: string;
  message_id: String;
}) {
  try {
    const response = await axiosInstance.post("/report", {
      city: data.city,
      transaction_id: data.transaction_id,
      message_id: data.message_id,
    });
    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}
