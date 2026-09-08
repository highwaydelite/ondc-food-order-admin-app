/**
 * Normalises the admin API's error bodies into a real Error so callers can rely on
 * `.message`, and so 401/403/400 can be told apart without digging into axios internals.
 *
 *   401 -> { "message": "Unauthorized", "statusCode": 401 }
 *   403 -> { "message": "Forbidden resource", "error": "Forbidden", "statusCode": 403 }
 *   400 -> { "statusCode": 400, "message": "...", "errors": [...] }
 *   500 (CSV export) -> text/plain "Error generating CSV export"
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly errors: string[];

  constructor(message: string, statusCode: number, errors: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;

    // Validation details are never shown to the user; log them for debugging.
    if (errors.length) {
      console.error(`[ApiError ${statusCode}] ${message}`, errors);
    }
  }

  get isUnauthorized() {
    return this.statusCode === 401;
  }

  get isForbidden() {
    return this.statusCode === 403;
  }

  /** 4xx responses are deterministic — retrying them just repeats the same failure. */
  get isRetryable() {
    return this.statusCode === 0 || this.statusCode >= 500;
  }
}

export const FRESH_TOKEN_REJECTED_MESSAGE =
  "You are signed in, but the server rejected a freshly refreshed token (401). " +
  "This is a configuration problem rather than an expired session — check the API " +
  "and Keycloak client settings.";

/**
 * Raised when a request still returns 401 after the refresh flow produced a valid new
 * token. Refreshing again would loop, so this is terminal and never retried.
 */
export class AuthConfigurationError extends ApiError {
  constructor(message: string = FRESH_TOKEN_REJECTED_MESSAGE) {
    super(message, 401);
    this.name = "AuthConfigurationError";
    console.error(`[AuthConfigurationError] ${message}`);
  }
}

const fallbackMessage = (statusCode: number) => {
  if (statusCode === 401) return "Unauthorized";
  if (statusCode === 403) return "Forbidden resource";
  if (statusCode === 400) return "Invalid request";
  return "Something went wrong";
};

export const isApiError = (error: unknown): error is ApiError =>
  error instanceof ApiError;

/**
 * An aborted request (a superseded search, an unmounted screen) is not a failure —
 * it must not be normalised into an ApiError, retried, or shown to the user.
 */
export const isCancelledError = (error: unknown): boolean => {
  const candidate = error as { code?: string; name?: string } | null;
  return (
    candidate?.code === "ERR_CANCELED" ||
    candidate?.name === "CanceledError" ||
    candidate?.name === "AbortError"
  );
};

export const isForbidden = (error: unknown): boolean =>
  isApiError(error) && error.isForbidden;

/** Builds an ApiError from an already-parsed JSON body (or a plain text body). */
export const apiErrorFromPayload = (
  statusCode: number,
  payload: unknown
): ApiError => {
  if (typeof payload === "string" && payload.trim()) {
    return new ApiError(payload.trim(), statusCode);
  }

  if (payload && typeof payload === "object") {
    const body = payload as {
      message?: unknown;
      errors?: unknown;
      error?: unknown;
    };
    const message =
      typeof body.message === "string" && body.message
        ? body.message
        : typeof body.error === "string" && body.error
        ? body.error
        : fallbackMessage(statusCode);
    const errors = Array.isArray(body.errors)
      ? body.errors.filter((entry): entry is string => typeof entry === "string")
      : [];
    return new ApiError(message, statusCode, errors);
  }

  return new ApiError(fallbackMessage(statusCode), statusCode);
};

type AxiosLikeError = {
  message?: string;
  response?: { status?: number; data?: unknown };
};

export const apiErrorFromAxios = (error: unknown): ApiError => {
  if (isApiError(error)) return error;

  const axiosError = (error ?? {}) as AxiosLikeError;
  const statusCode = axiosError.response?.status ?? 0;

  if (!statusCode) {
    return new ApiError(
      axiosError.message || "Network error. Please check your connection.",
      0
    );
  }
  return apiErrorFromPayload(statusCode, axiosError.response?.data);
};

/**
 * Reads an error body off a `fetch` Response. Needed for the CSV export, where the
 * body is a file on success but JSON (or text/plain on 500) on failure.
 */
export const apiErrorFromResponse = async (
  response: Response
): Promise<ApiError> => {
  let text = "";
  try {
    text = await response.text();
  } catch {
    return new ApiError(fallbackMessage(response.status), response.status);
  }

  try {
    return apiErrorFromPayload(response.status, JSON.parse(text));
  } catch {
    return apiErrorFromPayload(
      response.status,
      text || fallbackMessage(response.status)
    );
  }
};
