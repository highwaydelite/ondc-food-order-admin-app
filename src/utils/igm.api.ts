import { axiosInstance } from "./api";
import { apiErrorFromAxios } from "./apiError";
import { normalizePagination } from "./orderQueryParams";

export async function registerIssue(data: Object) {
  try {
    const response = await axiosInstance.post("/register-issue", data);
    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}

export async function issueEscalateToSeller(data: {
  orderId: string;
  issueId: string;
  name: string;
  phone: string;
  email: string;
}) {
  try {
    const response = await axiosInstance.post("/create-issue", data);
    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}

export async function replyIssue(data: {
  issueId: string;
  status: string;
  images?: string[];
  media?: string[];
  shortDesc: string;
  descriptorCode: string;
  actionBy: string;
  refId?: string;
  refType?: string;
}) {
  try {
    const response = await axiosInstance.post("/reply-issue", data);
    console.log("Reply Issue Response", response.data);
    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}

export async function getIssueStatus(data: { issueId: string }) {
  try {
    const response = await axiosInstance.post("/issue_status", data);
    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}

export async function closeIssue(data: Object) {
  try {
    const response = await axiosInstance.post("/reply-issue", data);
    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}

export async function getCustomerIssue(txnId: string) {
  try {
    const response = await axiosInstance.get(`/ride/view/${txnId}`);
    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}

/** Admin-only now (ADMIN client role). `page`/`limit` are always sent. */
export async function getAllIssues(params: {
  page: number;
  limit: number;
  issueStatus?: string;
}) {
  try {
    const { page, limit } = normalizePagination(params.page, params.limit);
    const response = await axiosInstance.get(`/issues/`, {
      params: {
        page,
        limit,
        issueStatus: params.issueStatus || undefined,
      },
    });
    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}

/** Admin-only now (ADMIN client role). `page`/`limit` are always sent. */
export async function getSellerIssues(params: {
  page: number;
  limit: number;
  issueStatus?: string;
}) {
  try {
    const { page, limit } = normalizePagination(params.page, params.limit);
    const response = await axiosInstance.get(`/seller-issues/`, {
      params: {
        page,
        limit,
        issueStatus: params.issueStatus || undefined,
      },
    });
    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}

export async function getSellerIssueById(params: { id: string }) {
  try {
    const response = await axiosInstance.get(`/seller-issue/${params.id}`);
    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}

export async function sendOnIssue(data: {
  issueId: string;
  status: string;
  images?: string[];
  media?: string[];
  shortDesc: string;
  descriptorCode: string;
  refId?: string;
  refType?: string;
  resolutionDescCode?: string;
  resolutionShortDesc?: string;
}) {
  try {
    const response = await axiosInstance.post("/send-on-issue", data);
    console.log("send on issue Response", response.data);
    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}

export async function raiseSettlementIssue(data: {
  orderId: string;
  category: string;
  subCategory: string;
  name: string;
  phone: string;
  email: string;
  fulfillmentId: string;
  providerId: string;
  shortDesc: string;
  longDesc: string;
  images?: string[];
}) {
  try {
    const response = await axiosInstance.post("/register-settle-issue", data);
    return response.data;
  } catch (error) {
    throw apiErrorFromAxios(error);
  }
}
