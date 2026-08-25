import { buildDateRangeParams } from "./dateRange";
import type { OrderFilterState } from "./adminEnums";
import { sanitizeOrderFilters } from "./adminEnums";

export type OrderFilterParams = {
  paymentStatus?: string;
  orderStatus?: string;
  issueStatus?: string;
  settleStatus?: string;
  transferStatus?: string;
  startDate?: string;
  endDate?: string;
  userMobile?: string;
  paymentOrderId?: string;
};

/**
 * The one place order filters are turned into query params. Both the list and the
 * CSV export call this, so the CSV always matches the table — same sanitised enums,
 * same IST day boundaries. Empty values are dropped entirely: sending
 * `orderStatus=` is a 400, while omitting it means "All".
 */
export const buildOrderFilterParams = (
  filters: Partial<OrderFilterState> | null | undefined
): OrderFilterParams => {
  const safe = sanitizeOrderFilters(filters);
  const { startDate, endDate } = buildDateRangeParams(safe.createdAt);
  const searchValue = safe.searchValue.trim();

  return {
    paymentStatus: safe.paymentStatus || undefined,
    orderStatus: safe.orderStatus || undefined,
    issueStatus: safe.issueStatus || undefined,
    settleStatus: safe.settleStatus || undefined,
    transferStatus: safe.transferStatus || undefined,
    startDate,
    endDate,
    userMobile:
      safe.searchType === "userMobile" && searchValue ? searchValue : undefined,
    paymentOrderId:
      safe.searchType === "paymentOrderId" && searchValue
        ? searchValue
        : undefined,
  };
};

/** `page` and `limit` are mandatory integers >= 1 — never 0, "" or undefined. */
export const normalizePagination = (
  page: unknown,
  limit: unknown
): { page: number; limit: number } => {
  const toPositiveInt = (value: unknown, fallback: number) => {
    const parsed = Math.trunc(Number(value));
    return Number.isFinite(parsed) && parsed >= 1 ? parsed : fallback;
  };
  return { page: toPositiveInt(page, 1), limit: toPositiveInt(limit, 10) };
};

/** Serialises params, skipping anything undefined/empty. */
export const toSearchParams = (
  params: Record<string, string | number | undefined>
): URLSearchParams => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  return search;
};
