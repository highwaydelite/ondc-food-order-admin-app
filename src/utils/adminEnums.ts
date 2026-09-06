/**
 * Filter enums accepted by `GET /ret11/orders/admin/orders` and
 * `GET /ret11/orders/admin/export`. The backend now validates these strictly and
 * case-sensitively — an unknown value is a 400, not a silently ignored param.
 */

export const PAYMENT_STATUSES = [
  "INITIATED",
  "PENDING",
  "SUCCESS",
  "FAILURE",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** Mixed case on purpose — must be sent exactly as written. */
export const ORDER_STATUSES = [
  "Created",
  "Pending",
  "Accepted",
  "Cancelled",
  "Completed",
  "In_progress",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ISSUE_STATUSES = [
  "NONE",
  "OPEN",
  "ESCALATED_TO_SELLER",
  "CLOSED",
] as const;
export type IssueStatusFilter = (typeof ISSUE_STATUSES)[number];

/**
 * The order settlement enum was corrected on the backend to match the underlying
 * column. FAILURE / PENDING / CORRECTION_REQUIRED / CORRECTION_APPROVED are new;
 * see REMOVED_ORDER_SETTLE_STATUSES for the values that now return 400.
 */
export const ORDER_SETTLE_STATUSES = [
  "INITIATED",
  "NOT_SETTLED",
  "SETTLED",
  "FAILURE",
  "PENDING",
  "CORRECTION_REQUIRED",
  "CORRECTION_APPROVED",
] as const;
export type OrderSettleStatus = (typeof ORDER_SETTLE_STATUSES)[number];

/** Kept only so stale persisted values can be recognised and dropped. */
export const REMOVED_ORDER_SETTLE_STATUSES = [
  "REINITIATED",
  "HAS_UNSETTLED",
  "REPORT_VERIFIED",
  "NACK",
  "NIL",
] as const;

/**
 * Razorpay Route transfer status (`rpRouteTransfer.status`). A DIFFERENT field and
 * enum from `settleStatus` above, which is the order's payment settlement.
 */
export const TRANSFER_STATUSES = [
  "CREATED",
  "PENDING",
  "PROCESSED",
  "FAILED",
  "REVERSED",
  "PARTIALLY_REVERSED",
] as const;
export type TransferStatus = (typeof TRANSFER_STATUSES)[number];

/**
 * `rpRouteTransfer.settlementStatus` — returned in responses (and nullable) but NOT
 * filterable. Typing only: do not build a filter control for it.
 */
export const TRANSFER_SETTLEMENT_STATUSES = [
  "PENDING",
  "ON_HOLD",
  "SETTLED",
] as const;
export type TransferSettlementStatus =
  (typeof TRANSFER_SETTLEMENT_STATUSES)[number];

export const ORDER_FILTER_OPTIONS = {
  paymentStatus: PAYMENT_STATUSES,
  orderStatus: ORDER_STATUSES,
  issueStatus: ISSUE_STATUSES,
  settleStatus: ORDER_SETTLE_STATUSES,
  transferStatus: TRANSFER_STATUSES,
} as const;

export type OrderFilterKey = keyof typeof ORDER_FILTER_OPTIONS;

/** Sentinel used by the Select components — never sent to the API. */
export const ALL_OPTION = "__ALL__";

export const ORDER_FILTER_LABELS: Record<OrderFilterKey, string> = {
  paymentStatus: "Payment Status",
  orderStatus: "Order Status",
  issueStatus: "Issue Status",
  settleStatus: "Settlement Status",
  transferStatus: "Transfer Status",
};

/**
 * Shown under each dropdown. `settleStatus` and `transferStatus` are easy to mix up,
 * so each one names the field it actually filters.
 */
export const ORDER_FILTER_HINTS: Partial<Record<OrderFilterKey, string>> = {
  settleStatus: "Order payment settlement",
  transferStatus: "Razorpay Route transfer",
};

/**
 * Drops any value that is not in the new allow-list. Guards every entry path into
 * a request — hard-coded defaults, saved presets, bookmarked URLs, storage — so a
 * removed value such as `NACK` can never reach the API and turn into a 400.
 */
export const sanitizeEnumValue = <K extends OrderFilterKey>(
  key: K,
  value: unknown
): string => {
  if (typeof value !== "string" || value === "" || value === ALL_OPTION) {
    return "";
  }
  const allowed = ORDER_FILTER_OPTIONS[key] as readonly string[];
  if (allowed.includes(value)) return value;

  console.warn(
    `[adminEnums] Dropping unsupported ${key} value "${value}". Allowed: ${allowed.join(
      ", "
    )}`
  );
  return "";
};

/**
 * Free-text search fields. All three are partial + case-insensitive on the server, so
 * the user's input is sent as typed: no upper/lower casing, and no escaping of `%` or
 * `_` (the backend escapes LIKE metacharacters itself — escaping here would double it).
 */
export const ORDER_SEARCH_FIELDS = [
  "orderId",
  "paymentOrderId",
  "userMobile",
] as const;
export type OrderSearchField = (typeof ORDER_SEARCH_FIELDS)[number];

export const ORDER_SEARCH_LABELS: Record<OrderSearchField, string> = {
  orderId: "Order ID",
  paymentOrderId: "Payment Order ID",
  userMobile: "Mobile",
};

export const ORDER_SEARCH_PLACEHOLDERS: Record<OrderSearchField, string> = {
  orderId: "Search order ID",
  paymentOrderId: "Search payment order ID",
  userMobile: "Search mobile number",
};

/**
 * A leading-wildcard match cannot use an index, so every keystroke is a full scan.
 * Debounce, and require enough characters to be selective — a single "9" matches
 * almost every phone number.
 */
export const SEARCH_DEBOUNCE_MS = 400;
export const MIN_SEARCH_LENGTH = 3;

export type OrderFilterState = {
  paymentStatus: string;
  orderStatus: string;
  issueStatus: string;
  settleStatus: string;
  transferStatus: string;
  createdAt: { startDate?: string; endDate?: string };
  orderId: string;
  paymentOrderId: string;
  userMobile: string;
};

export const EMPTY_ORDER_FILTERS: OrderFilterState = {
  paymentStatus: "",
  orderStatus: "",
  issueStatus: "",
  settleStatus: "",
  transferStatus: "",
  createdAt: { startDate: undefined, endDate: undefined },
  orderId: "",
  paymentOrderId: "",
  userMobile: "",
};

/** Use on every read of filter state that did not come straight from the dropdowns. */
export const sanitizeOrderFilters = (
  filters: Partial<OrderFilterState> | null | undefined
): OrderFilterState => ({
  ...EMPTY_ORDER_FILTERS,
  ...filters,
  paymentStatus: sanitizeEnumValue("paymentStatus", filters?.paymentStatus),
  orderStatus: sanitizeEnumValue("orderStatus", filters?.orderStatus),
  issueStatus: sanitizeEnumValue("issueStatus", filters?.issueStatus),
  settleStatus: sanitizeEnumValue("settleStatus", filters?.settleStatus),
  transferStatus: sanitizeEnumValue("transferStatus", filters?.transferStatus),
  createdAt: {
    startDate: filters?.createdAt?.startDate || undefined,
    endDate: filters?.createdAt?.endDate || undefined,
  },
  // Search terms pass through untouched — see ORDER_SEARCH_FIELDS.
  orderId: asSearchTerm(filters?.orderId),
  paymentOrderId: asSearchTerm(filters?.paymentOrderId),
  userMobile: asSearchTerm(filters?.userMobile),
});

const asSearchTerm = (value: unknown): string =>
  typeof value === "string" ? value : "";

export const humanizeEnumValue = (value: string): string =>
  value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
