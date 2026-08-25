import { AlertCircle } from "lucide-react";
import { isApiError } from "@/utils/apiError";
import { Forbidden } from "./Forbidden";

interface ApiErrorStateProps {
  error: unknown;
  /** Fallback copy when the error carries no message of its own. */
  fallback?: string;
  onRetry?: () => void;
}

/**
 * Renders whatever the admin API returned. 403 gets the dedicated no-permission
 * state; 400 shows the server's `message` (which enumerates the allowed enum values),
 * while its `errors` array is only logged.
 */
export const ApiErrorState: React.FC<ApiErrorStateProps> = ({
  error,
  fallback = "Something went wrong. Please try again.",
  onRetry,
}) => {
  if (isApiError(error) && error.isForbidden) {
    return <Forbidden />;
  }

  const message =
    (isApiError(error) && error.message) ||
    (error instanceof Error && error.message) ||
    fallback;

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-white py-20 text-center">
      <AlertCircle className="h-10 w-10 text-red-500" />
      <p className="max-w-lg text-sm font-medium text-red-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ApiErrorState;
