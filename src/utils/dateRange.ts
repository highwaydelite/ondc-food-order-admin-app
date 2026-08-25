import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

/**
 * The backend no longer widens `startDate`/`endDate` to day boundaries — it uses
 * whatever instant we send, exactly, as `createdAt >= startDate` / `createdAt <= endDate`.
 * Day boundaries are therefore owned by this file, and they are always the
 * boundaries of an IST business day regardless of the admin's browser timezone.
 */
export const BUSINESS_TIMEZONE = "Asia/Kolkata";
export const BUSINESS_DAY_FORMAT = "YYYY-MM-DD";

const DAY_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Filter state stores plain IST business days (`YYYY-MM-DD`). Older/persisted
 * state may hold a full ISO instant instead, so normalise both shapes here.
 */
export const toBusinessDay = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  if (DAY_ONLY.test(value)) return value;

  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    console.warn(`[dateRange] Dropping unparseable date value: ${value}`);
    return undefined;
  }
  return parsed.tz(BUSINESS_TIMEZONE).format(BUSINESS_DAY_FORMAT);
};

export const businessDayToDayjs = (value?: string | null): Dayjs | null => {
  const day = toBusinessDay(value);
  if (!day) return null;
  const parsed = dayjs(day, BUSINESS_DAY_FORMAT, true);
  return parsed.isValid() ? parsed : null;
};

/** 24 Aug 2026 (IST) -> "2026-08-23T18:30:00.000Z" */
export const istStartOfDayISO = (value?: string | null): string | undefined => {
  const day = toBusinessDay(value);
  if (!day) return undefined;
  return dayjs.tz(day, BUSINESS_TIMEZONE).startOf("day").utc().toISOString();
};

/** 24 Aug 2026 (IST) -> "2026-08-24T18:29:59.999Z" (inclusive upper bound) */
export const istEndOfDayISO = (value?: string | null): string | undefined => {
  const day = toBusinessDay(value);
  if (!day) return undefined;
  return dayjs.tz(day, BUSINESS_TIMEZONE).endOf("day").utc().toISOString();
};

export type BusinessDayRange = { startDate?: string; endDate?: string };

/**
 * Single source of truth for the `startDate`/`endDate` query params. Both the
 * orders list and the CSV export call this so the export always matches the table.
 */
export const buildDateRangeParams = (
  range?: BusinessDayRange | null
): { startDate?: string; endDate?: string } => ({
  startDate: istStartOfDayISO(range?.startDate),
  endDate: istEndOfDayISO(range?.endDate),
});

export { dayjs };
