import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import { Receipt } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import TableLoaderSkeleton from "@/components/TableLoaderSkeleton";
import { ApiErrorState } from "@/components/ApiErrorState";
import { retryUnlessClientError } from "@/utils/queryRetry";
import { getSellerSettlements } from "@/utils/api";
import {
  settledSellerColumns,
  type SellerSettlementRecord,
} from "./sellerSettlementColumns";

const SKELETON_HEADERS = ["Settled On", "Seller", "Amount", "UTR", "Actions"];

/** History of recorded payouts, newest first. Nothing here can be edited or undone. */
const SettledSettlements = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      "seller-settlements",
      "list",
      pagination.pageIndex,
      pagination.pageSize,
    ],
    queryFn: () =>
      // page is 1-based on the server, the table is 0-based.
      getSellerSettlements({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      }),
    placeholderData: keepPreviousData,
    retry: retryUnlessClientError,
  });

  if (isLoading)
    return <TableLoaderSkeleton headers={SKELETON_HEADERS} rows={5} />;
  if (isError)
    return (
      <ApiErrorState
        error={error}
        fallback="Cannot fetch settlements"
        onRetry={() => refetch()}
      />
    );

  // This response is double-nested: the rows sit at `data.data.data`, with the
  // pagination metadata (total / totalPages / hasNextPage) alongside them.
  const page = data?.data;
  const settlements: SellerSettlementRecord[] = page?.data ?? [];
  // DataTable derives its page count from the row count, which matches `totalPages`
  // for the same `limit` and drives the same prev/next enabling as hasNextPage.
  const total = page?.total ?? settlements.length;

  if (settlements.length === 0)
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white py-20 text-center">
        <Receipt className="h-10 w-10 text-gray-300" />
        <h3 className="text-base font-semibold text-gray-700">
          No settlements recorded yet
        </h3>
        <p className="max-w-md text-sm text-gray-500">
          Payouts recorded against a UTR from the Pending tab appear here.
        </p>
      </div>
    );

  return (
    <DataTable
      columns={settledSellerColumns}
      data={settlements}
      total={total}
      pagination={pagination}
      setPagination={setPagination}
    />
  );
};

export default SettledSettlements;
