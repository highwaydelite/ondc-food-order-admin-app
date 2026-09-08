import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { exportOrdersCsv } from "@/utils/api";
import { isApiError } from "@/utils/apiError";
import { BUSINESS_TIMEZONE, dayjs } from "@/utils/dateRange";
import type { OrderFilterState } from "@/utils/adminEnums";

interface ExportButtonProps {
  filters: Partial<OrderFilterState>;
}

export const ExportOrdersButton: React.FC<ExportButtonProps> = ({
  filters,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const blob = await exportOrdersCsv(filters);

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      link.download = `orders-${dayjs()
        .tz(BUSINESS_TIMEZONE)
        .format("YYYY-MM-DD")}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast.success("Orders exported");
    } catch (error) {
      console.error("Export failed", error);
      const message = isApiError(error)
        ? error.isForbidden
          ? "You do not have permission to export orders"
          : error.message
        : "Failed to export orders";
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      title="Export orders as CSV"
      aria-label="Export orders as CSV"
      className="flex items-center gap-2 h-10 px-4 rounded-md border bg-white hover:bg-muted transition disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span className="text-sm">{isExporting ? "Exporting…" : "CSV"}</span>
    </button>
  );
};
