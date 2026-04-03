import { Download } from "lucide-react";
import { exportOrders } from "@/utils/api";

interface ExportButtonProps {
  filters: any;
}

export const ExportOrdersButton: React.FC<ExportButtonProps> = ({
  filters,
}) => {
  const handleExport = async () => {
    try {
      const blob = await exportOrders({
        paymentStatus: filters.paymentStatus || undefined,
        orderStatus: filters.orderStatus || undefined,
        issueStatus: filters.issueStatus || undefined,
        settleStatus: filters.settleStatus || undefined,
        startDate: filters.createdAt?.startDate || undefined,
        endDate: filters.createdAt?.endDate || undefined,
        userMobile:
          filters.searchType === "userMobile" ? filters.searchValue : undefined,
        paymentOrderId:
          filters.searchType === "paymentOrderId"
            ? filters.searchValue
            : undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `orders_${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to export orders");
    }
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center h-10 px-4 rounded-md border bg-white hover:bg-muted transition"
    >
      <Download className="h-4 w-4" />
    </button>
  );
};
