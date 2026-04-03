export type CategoryType =
  | "CULTURE_HERITAGE"
  | "LEISURE"
  | "SPORTING_OUTDOOR"
  | "TOURS_SIGHTSEEING"
  | "FOOD_DINING"
  | "SPECIALITY_EVENTS"
  | "ENTERTAINMENT";

export interface SearchFilter {
  cityCode: string;
  time: {
    range: {
      start: string; // ISO 8601 format date string
      end: string;
    };
    // timestamp?: string; // optional if you plan to use it later
  };
  category: CategoryType;
  incremental: boolean;
}

export type OrderResponse = {
  id: string;
  state: "Accepted" | string;
  paymentOrderStatus: "SUCCESS" | "FAILED" | string;
  providerId: string;
  providerName: string;
  providerImage: string | null;

  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;

  items: OrderItem[];
  quote: Quote;
  fulfillments: Fulfillment[];
  billing: Billing;
  payment: Payment;

  orderCancelFulfillments: OrderCancelFulfillment[];
  settlementOrders: SettlementOrder[];
  reconOrder: {
    amount: number;
    dueDate: string | null;
    reconAccord: boolean;
    transactionId: string;
    updatedAt: string;
    reconSettlements: {
      amount: number;
      commission: number;
      diffAmount: number;
      diffCommission: number;
      diffTcs: number;
      diffTds: number;
      diffWithHoldingAmount: number;
      paymentId: string;
      settlementId: string;
      status: string;
      tcs: number;
      tds: number;
      withHoldingAmount: number;
    }[];
  };
  issueStatus: "NONE" | "OPEN" | "ESCALATED_TO_SELLER" | "CLOSED";
  issueStatusUpdatedAt: string;
  issues: Issue[];
};

/* -------------------- Items -------------------- */

export type OrderItem = {
  itemName: string;
  quantity: number;
  itemType: string | null;
  parentItemId: string | null;
};

/* -------------------- Quote -------------------- */

export type Quote = {
  value: string;
  breakup: QuoteBreakup[];
};

export type QuoteBreakup = {
  title: string;
  itemId: string;
  titleType: "item" | "delivery" | "misc" | string;
  quantity: number | null;
  currency: string;
  value: string;
  parentItemId: string | null;
};

/* -------------------- Fulfillment -------------------- */

export type Fulfillment = {
  fulfillmentId: string;
  type: "Delivery" | "Pickup" | string;
  state: string;

  endName: string;
  endCity: string;
  endState: string;
  endAreaCode: string;
  endLocality: string;
  endBuilding: string;
  endGps: string;

  contactName: string;
  contactPhone: string;
  contactEmail: string | null;

  orderFulfillmentStateHistories: {
    state: string;
    stateUpdatedAt: string;
  }[];
};

/* -------------------- Billing -------------------- */

export type Billing = {
  name: string;
  email: string;
  phone: string;

  addressName: string;
  building: string;
  locality: string;
  city: string;
  state: string;
  country: string;
  areaCode: string;
};

/* -------------------- Payment -------------------- */

export type Payment = {
  transactionId: string;
  amount: string;
  status: "PAID" | "FAILED" | string;
  type: "ON_ORDER" | string;
  collectedBy: "BAP" | "BPP" | string;

  finderFeeType: "percent" | "amount" | string;
  finderFeeAmount: string;

  settlementBasis: string;
  settlementWindow: string;

  buyerAmount: string;
  sellerAmount: string;

  tcs: string;
  tds: string;

  refundAmount: string | null;
  settlementDueDate: string | null;

  settleStatus: "PENDING" | "SUCCESS" | "FAILED" | string;
  settleUpdatedAt: string | null;

  settlements: Settlement[];
};

export type Settlement = {
  counterparty: string;
  phase: string;
  type: "neft" | "rtgs" | "imps" | "upi" | string;

  beneficiaryName: string;
  upiAddress: string | null;

  bankAccountNo: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
};

/* -------------------- Order Cancellation -------------------- */

export type OrderCancelFulfillment = {
  id: string;
  type: "Return" | string;
  state: "Return_Requested" | string;
  quoteValue: string;

  orderCancelQuoteTrails: {
    type: string;
    ref_id: string;
    value: string;
  }[];
  orderCancelTagGroups: {
    code: string;
    items: {
      key: string;
      value: string;
    }[];
  }[];
};

export type OrderCancelFulfillmentTag = {
  orderCancelFulfillmentTagKey: number;
  id: string;
  orderCancelFullfillmentKey: number;

  code: "return_request" | string;
  key:
    | "id"
    | "item_id"
    | "item_quantity"
    | "reason_id"
    | "reason_desc"
    | "images"
    | string;

  value: string;
  createdAt: string;
};

export type SettlementOrder = {
  settlement: {
    id: string;
    transactionId: string;
    messageId: string;
    status: string;
    statusUpdatedAt: string;
    receiverAppId: string;
  };
  sellerAmount: string;
  buyerAmount: string;
  totalAmount: string;
  sellerStatus: string;
  referenceNo: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  selfStatus: "INITIATED";
  selfReferenceNo: string | null;
  selfErrorCode: string | null;
  selfErrorMessage: string | null;
  updatedAt: string;
};

export type IssueActionCode =
  | "OPEN"
  | "CLOSED"
  | "PROCESSING"
  | "RESOLVED"
  | "INFO_REQUESTED"
  | "INFO_PROCESSING"
  | "INFO_PROVIDED"
  | "INFO_NOT_AVAILABLE"
  | "RESOLUTION_PROPOSED"
  | "RESOLUTION_FORWARDED"
  | "RESOLUTION_PROCESSING"
  | "RESOLUTION_CASCADED"
  | "RESOLUTION_ACCEPTED"
  | "RESOLUTION_REJECTED"
  | "ESCALATED"
  | "CASCADED";

export type IssueAction = {
  id: string;
  descriptorCode: IssueActionCode;
  shortDesc: string;
  images: string[];
  media: string[];
  refId: string;
  refType: string;
  actionBy: string;
  actorName: string;
  updatedAt: string;
};

export type IssueActorType =
  | "INTERFACING_NP"
  | "COUNTERPARTY_NP"
  | "CASCADED_NP"
  | "PROVIDER"
  | "AGENT"
  | "CONSUMER"
  | "INTERFACING_NP_GRO"
  | "COUNTERPARTY_NP_GRO"
  | "CASCADED_NP_GRO";

export type IssueActor = {
  id: string;
  type: IssueActorType;
  orgName: string;
  name: string;
  phone: string;
  email: string;
};

export type Resolution = {
  id: string;
  refId: string;
  refType: string;
  code: string;
  shortDesc: string;
  proposedBy: string;
  updatedAt: string;
  tags: JSON;
};

export type issueStatus = "OPEN" | "CLOSED" | "PROCESSING" | "RESOLVED";
export type Issue = {
  category: string;
  complainantId: string | null;
  createdAt: string;
  customerEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
  fulfillmentId: string | null;
  id: string;
  images: string[];
  issueActions: IssueAction[];
  issueActors: IssueActor[];
  itemId: string | null;
  level: string;
  longDesc: string | null;
  providerId: string | null;
  resolutions: Resolution[];
  shortDesc: string | null;
  sourceId: string | null;
  status: issueStatus;
  subCategory: string | null;
  transactionId: string | null;
  updatedAt: string;
};

export type ResolutionDescCode =
  | "NOW_VISIBLE"
  | "NO_ACTION"
  | "RECONCILED"
  | "NOT_RECONCILED";
