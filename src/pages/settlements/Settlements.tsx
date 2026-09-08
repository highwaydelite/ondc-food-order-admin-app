import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import type { Settlement } from "./settlementColumns";
import { columns } from "./settlementColumns";
import type { SettlementFilters } from "./SettlementsFilterModal";
import { SettlementsFilterModal } from "./SettlementsFilterModal";
import { SelfSettleModal } from "./selfSettleModal";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import TableLoaderSkeleton from "@/components/TableLoaderSkeleton";
import { ApiErrorState } from "@/components/ApiErrorState";
import { retryUnlessClientError } from "@/utils/queryRetry";
import { getSettlements } from "@/utils/api";

const Settlements = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [openSelfSettle, setOpenSelfSettle] = useState(false);

  // Updated filters with all the new filter options
  const [filters, setFilters] = useState<SettlementFilters>({
    settleStatus: "",
    sellerStatus: "",
    selfStatus: "",
    type: "",
    createdAt: { startDate: "", endDate: "" },
    // transactionId: "",
    // messageId: "",
    // bppId: "",
    // receiverAppId: "",
    // cityCode: "",
    // reconAccord: "",
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      "settlements",
      pagination.pageIndex,
      pagination.pageSize,
      filters,
    ],
    queryFn: () =>
      getSettlements({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        ...filters,
      }),
    placeholderData: keepPreviousData,
    retry: retryUnlessClientError,
  });

  if (isLoading) return <TableLoaderSkeleton />;
  // GET /ret11/settlement/all now requires the ADMIN role — a non-admin token gets a 403.
  if (isError)
    return (
      <ApiErrorState
        error={error}
        fallback="Cannot fetch settlements"
        onRetry={() => refetch()}
      />
    );

  const orders: Settlement[] = data?.data?.settlements ?? [];
  console.log(orders);

  const transformedOrders = orders;
  const total = data?.data?.total ?? 0;

  const handleApplyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      settleStatus: "",
      sellerStatus: "",
      selfStatus: "",
      type: "",
      createdAt: { startDate: "", endDate: "" },
      // transactionId: "",
      // messageId: "",
      // bppId: "",
      // receiverAppId: "",
      // cityCode: "",
      // reconAccord: "",
    });
  };

  return (
    <div className="bg-white rounded-xl">
      <div className="p-4">
        <div className="flex justify-end mb-4">
          <Button
            className="px-4 py-2 mr-5 flex justify-end text-black bg-yellow-400 hover:bg-yellow-500 rounded-lg"
            onClick={() => setOpenSelfSettle(true)}
          >
            Self Transfer
          </Button>
          <SettlementsFilterModal
            filters={filters}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />
        </div>
        <DataTable
          columns={columns}
          data={transformedOrders}
          total={total}
          pagination={pagination}
          setPagination={setPagination}
        />

        <SelfSettleModal
          open={openSelfSettle}
          onClose={() => setOpenSelfSettle(false)}
        />
      </div>
    </div>
  );
};

export default Settlements;
