import axios from "axios";
import { userManager } from "../config";

const getToken = async () => {
  try {
    const user = await userManager.getUser();
    if (user && !user.expired) {
      return user.access_token;
    } else {
      console.log("User is not logged in or token has expired.");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export async function getOrders(params: {
  page: number;
  limit: number;
  paymentStatus?: string;
  orderStatus?: string;
  issueStatus?: string;
  settleStatus?: string;
  startDate?: string;
  endDate?: string;
  userMobile?: string;
  paymentOrderId?: string;
}) {
  try {
    const response = await axiosInstance.get(`/orders/admin/orders/`, {
      params: {
        page: params.page,
        limit: params.limit,
        paymentStatus: params.paymentStatus || undefined,
        orderStatus: params.orderStatus || undefined,
        issueStatus: params.issueStatus || undefined,
        settleStatus: params.settleStatus || undefined,
        startDate: params.startDate || undefined,
        endDate: params.endDate || undefined,
        userMobile: params.userMobile || undefined,
        paymentOrderId: params.paymentOrderId || undefined,
      },
    });
    return response.data;
  } catch (error: any) {
    throw { error: error?.response?.data || error.message };
  }
}

export async function getOrderById(orderId: string) {
  try {
    const response = await axiosInstance.get(
      `/orders/admin/order-details/${orderId}`
    );
    return response.data;
  } catch (error: any) {
    throw { error: error?.response?.data || error.message };
  }
}

export async function exportOrders(params: {
  paymentStatus?: string;
  orderStatus?: string;
  issueStatus?: string;
  settleStatus?: string;
  startDate?: string;
  endDate?: string;
  userMobile?: string;
  paymentOrderId?: string;
}) {
  const response = await axiosInstance.get("/orders/admin/export", {
    params,
    responseType: "blob",
  });

  return response.data;
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
    // Build query parameters object
    const queryParams: any = {
      page: params.page,
      limit: params.limit,
    };

    // Add status filters if they exist
    if (params.settleStatus) queryParams.settleStatus = params.settleStatus;
    if (params.sellerStatus) queryParams.sellerStatus = params.sellerStatus;
    if (params.selfStatus) queryParams.selfStatus = params.selfStatus;
    if (params.type) queryParams.type = params.type;

    // Add date filters if they exist
    if (params.createdAt?.startDate) {
      queryParams.createdStartDate = params.createdAt.startDate;
    }
    if (params.createdAt?.endDate) {
      queryParams.createdEndDate = params.createdAt.endDate;
    }
    if (params.updatedAt?.startDate) {
      queryParams.updatedStartDate = params.updatedAt.startDate;
    }
    if (params.updatedAt?.endDate) {
      queryParams.updatedEndDate = params.updatedAt.endDate;
    }

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
  } catch (error: any) {
    throw { error: error?.response?.data || error.message };
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
  } catch (error: any) {
    throw { error: error };
  }
}

export async function sendRecon(data: {
  orderId: String;
  transactionId: String;
}) {
  try {
    const response = await axiosInstance.post("/send_recon", data);
    return response.data;
  } catch (error: any) {
    throw { error: error };
  }
}

export async function getSettlementById(settlementId: string) {
  try {
    const response = await axiosInstance.get(`/settlement/${settlementId}`);
    return response.data;
  } catch (error: any) {
    throw { error: error?.response?.data || error.message };
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
  } catch (error: any) {
    throw { error: error };
  }
}

export async function approveCorrection(orderId: string) {
  try {
    const response = await axiosInstance.post(`/approve_correction`, {
      orderId,
    });
    return response.data;
  } catch (error: any) {
    throw { error: error?.response?.data || error.message };
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
  } catch (error: any) {
    throw { error: error };
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
  } catch (error: any) {
    throw { error: error };
  }
}
