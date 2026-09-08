import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import { CheckCircle2 } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import TableLoaderSkeleton from "@/components/TableLoaderSkeleton";
import { ApiErrorState } from "@/components/ApiErrorState";
import { SettleSellerModal } from "@/components/settlements/SettleSellerModal";
import { retryUnlessClientError } from "@/utils/queryRetry";
import { getPendingSellerSettlements } from "@/utils/api";
import { formatAmount, toAmount } from "@/utils/formatDate";
import {
  pendingSellerColumns,
  type PendingSellerSettlement,
} from "./sellerSettlementColumns";

const SKELETON_HEADERS = ["Seller", "Orders", "Pending Amount", "Actions"];

/**
 * What each seller is owed for delivered orders. The set only contains orders
 * delivered before today, so it is stable through the working day — a refetch after
 * settling is enough, no polling.
 */
const PendingSettlements = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [settleFor, setSettleFor] = useState<PendingSellerSettlement | null>(
    null
  );

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["seller-settlements", "pending"],
    queryFn: getPendingSellerSettlements,
    retry: retryUnlessClientError,
  });

  // "View orders" is a link inside the column; only Settle needs a handler.
  const columns = useMemo(
    () => pendingSellerColumns({ onSettle: setSettleFor }),
    []
  );

  if (isLoading)
    return <TableLoaderSkeleton headers={SKELETON_HEADERS} rows={5} />;
  if (isError)
    return (
      <ApiErrorState
        error={error}
        fallback="Cannot fetch pending settlements"
        onRetry={() => refetch()}
      />
    );

  const sellers: PendingSellerSettlement[] = data?.data ?? [];

  // `pendingAmount` is a JSON number here but a string elsewhere — coerce before summing.
  const grandTotal = sellers.reduce(
    (sum, seller) => sum + toAmount(seller.pendingAmount),
    0
  );
  const orderTotal = sellers.reduce(
    (sum, seller) => sum + (Number(seller.orderCount) || 0),
    0
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-gray-50 px-4 py-3">
        <div>
          <p className="text-xs text-gray-500">Total pending payout</p>
          <p className="text-xl font-semibold text-black">
            {formatAmount(grandTotal)}
          </p>
        </div>
        <p className="text-xs text-gray-500">
          {sellers.length} {sellers.length === 1 ? "seller" : "sellers"} ·{" "}
          {orderTotal} {orderTotal === 1 ? "order" : "orders"} awaiting payout
        </p>
      </div>

      {sellers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white py-20 text-center">
          <CheckCircle2 className="h-10 w-10 text-gray-300" />
          <h3 className="text-base font-semibold text-gray-700">
            No pending settlements
          </h3>
          <p className="max-w-md text-sm text-gray-500">
            Only orders delivered before today appear here — anything delivered
            today shows up tomorrow.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={sellers}
          total={sellers.length}
          pagination={pagination}
          setPagination={setPagination}
          // The endpoint returns every pending seller at once, so the table slices it.
          manualPagination={false}
        />
      )}

      {settleFor && (
        <SettleSellerModal
          seller={settleFor}
          onClose={() => setSettleFor(null)}
        />
      )}
    </div>
  );
};

export default PendingSettlements;
