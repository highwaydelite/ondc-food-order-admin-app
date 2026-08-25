import { BUSINESS_TIMEZONE, dayjs } from "./dateRange";

export const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleString();

/**
 * Renders a UTC ISO timestamp from the JSON APIs in IST.
 *
 * Note: CSV export timestamps are already shifted to IST and carry no timezone
 * suffix — do not pass those through here, they would be shifted a second time.
 */
export const convertToIST = (utcTime?: string | null): string => {
  if (!utcTime) return "-";

  const parsed = dayjs(utcTime);
  if (!parsed.isValid()) return "-";

  return parsed.tz(BUSINESS_TIMEZONE).format("DD MMM YYYY hh:mm A");
};

/**
 * `quote.value` / `payment.amount` come back as strings with varying precision
 * ("101.50" vs "100.5") — parse before formatting.
 */
export const formatAmount = (
  value?: string | number | null,
  currency = "INR"
): string => {
  if (value === null || value === undefined || value === "") return "-";

  const amount = typeof value === "number" ? value : Number.parseFloat(value);
  if (!Number.isFinite(amount)) return "-";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
