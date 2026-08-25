import { isApiError } from "./apiError";

/**
 * react-query retry predicate for admin endpoints. 401 is already handled by the axios
 * interceptor (refresh-then-retry, then login), and 403/400 are deterministic — retrying
 * either just repeats the same failure.
 */
export const retryUnlessClientError = (failureCount: number, error: unknown) =>
  isApiError(error) ? error.isRetryable && failureCount < 2 : failureCount < 2;
