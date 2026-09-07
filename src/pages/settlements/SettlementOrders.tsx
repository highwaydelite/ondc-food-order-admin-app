import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import type { PaginationState } from "@tanstack/react-table";
import { ArrowLeft, PackageSearch } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import TableLoaderSkeleton from "@/components/TableLoaderSkeleton";
import { ApiErrorState } from "@/components/ApiErrorState";
import { DetailItem } from "@/components/dashboard/DetailItem";
import { retryUnlessClientError } from "@/utils/queryRetry";
import { getPendingSellerOrders, getSellerSettlementOrders } from "@/utils/api";
import { convertToIST, formatAmount, toAmount } from "@/utils/formatDate";
import {
  settlementOrderColumns,
  type SettlementOrderLine,
} from "./sellerSettlementColumns";

const ORDER_SKELETON_HEADERS = [
  "Order ID",
  "Transaction ID",
  "Provider",
  "Delivered On",
  "Amount",
];

/**
 * The orders behind one payout, for both directions of the section: a seller's
 * outstanding orders (`/settlements/pending/:sellerId`) and the orders that were
 * included in a recorded settlement (`/settlements/settled/:settlementId`). Both
 * endpoints return the same order shape, so one page serves both routes.
 *
 * Informational only — the server decides the final set at settle time, so there is
 * nothing to select or edit here.
 */
const SettlementOrders = () => {
  const { sellerId, settlementId } = useParams<{
    sellerId?: string;
    settlementId?: string;
  }>();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const isPending = !!sellerId;
  const backTo = isPending ? "/admin/settlements" : "/admin/settlements?tab=settled";

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: isPending
      ? ["seller-settlements", "pending-orders", sellerId]
      : ["seller-settlements", "orders", settlementId],
    queryFn: () =>
      isPending
        ? getPendingSellerOrders(sellerId!)
        : getSellerSettlementOrders(settlementId!),
    retry: retryUnlessClientError,
  });

  const backLink = (
    <Link
      to={backTo}
      className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to settlements
    </Link>
  );

  if (isLoading)
    return <TableLoaderSkeleton headers={ORDER_SKELETON_HEADERS} rows={5} />;
  if (isError)
    return (
      <div>
        {backLink}
        <ApiErrorState
          error={error}
          fallback={
            isPending
              ? "Cannot fetch the pending orders for this seller"
              : "Cannot fetch the orders in this settlement"
          }
          onRetry={() => refetch()}
        />
      </div>
    );

  const payload = data?.data;
  const orders: SettlementOrderLine[] = payload?.orders ?? [];
  // `sellerAmount` comes back as a string ("249.5") — coerce before summing.
  const total = orders.reduce(
    (sum, order) => sum + toAmount(order.sellerAmount),
    0
  );

  return (
    <div>
      {backLink}

      <div className="mb-4 rounded-xl bg-white p-4">
        <h2 className="text-lg font-semibold text-black">
          {isPending ? "Pending orders" : "Settlement orders"}
        </h2>
        <p className="mb-3 text-xs text-gray-500">
          {isPending
            ? "Delivered orders this seller is currently owed for."
            : "The orders that were paid out under this UTR."}
        </p>

        <div className="grid gap-2 rounded-lg border bg-gray-50 p-4 sm:grid-cols-2">
          <DetailItem label="Seller" value={payload?.sellerName || "-"} />
          {isPending ? (
            <DetailItem label="Pending amount" value={formatAmount(total)} />
          ) : (
            <>
              {/* Only the settled endpoint carries the payout record itself. */}
              <DetailItem
                label="Amount"
                value={formatAmount(payload?.totalAmount)}
              />
              <DetailItem
                label="UTR"
                value={
                  <span className="font-mono text-xs">
                    {payload?.utrNumber || "-"}
                  </span>
                }
              />
              <DetailItem
                label="Settled on"
                value={convertToIST(payload?.settledAt)}
              />
            </>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-white">
        <div className="p-4">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <PackageSearch className="h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">
                {isPending
                  ? "This seller has no orders awaiting payout."
                  : "No orders were recorded against this settlement."}
              </p>
            </div>
          ) : (
            <>
              <DataTable
                columns={settlementOrderColumns}
                data={orders}
                total={orders.length}
                pagination={pagination}
                setPagination={setPagination}
                // The whole order list comes back in one response, so the table
                // does the slicing itself.
                manualPagination={false}
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-gray-50 px-4 py-3">
                <span className="text-sm text-gray-600">
                  {orders.length} {orders.length === 1 ? "order" : "orders"}
                </span>
                <span className="text-sm font-semibold text-black">
                  Total {formatAmount(total)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettlementOrders;
