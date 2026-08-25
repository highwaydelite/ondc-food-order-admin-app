import { ShieldAlert } from "lucide-react";

interface ForbiddenProps {
  message?: string;
}

export const Forbidden: React.FC<ForbiddenProps> = ({ message }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-white py-20 text-center">
    <ShieldAlert className="h-10 w-10 text-red-500" />
    <h2 className="text-lg font-semibold text-red-600">
      You do not have permission to view this page
    </h2>
    <p className="max-w-md text-sm text-gray-500">
      {message}
    </p>
  </div>
);

export default Forbidden;
