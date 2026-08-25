import { ShieldAlert } from "lucide-react";

interface ForbiddenProps {
  message?: string;
}

/**
 * Error state for a 403 from the backend. Authorization lives entirely server-side, so
 * this is not an expected branch for an admin user — it means the backend rejected the
 * token's permissions and should be investigated. Never retried.
 */
export const Forbidden: React.FC<ForbiddenProps> = ({ message }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-white py-20 text-center">
    <ShieldAlert className="h-10 w-10 text-red-500" />
    <h2 className="text-lg font-semibold text-red-600">
      You do not have permission to view this page
    </h2>
    <p className="max-w-md text-sm text-gray-500">
      {message ||
        "The server rejected this request (403). If you are an admin user this is unexpected — please report it."}
    </p>
  </div>
);

export default Forbidden;
