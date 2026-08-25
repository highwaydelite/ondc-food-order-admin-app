import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import { getOrders } from "@/utils/api";
import TableLoaderSkeleton from "@/components/TableLoaderSkeleton";
import { FilterModal } from "@/components/dashboard/FilterModal";
import { DataTable } from "@/components/DataTable";
import { columns } from "@/components/dashboard/columns";
import { Search } from "lucide-react";
import { ExportOrdersButton } from "@/components/dashboard/ExportOrders";
import { ApiErrorState } from "@/components/ApiErrorState";
import { retryUnlessClientError } from "@/utils/queryRetry";
import {
  EMPTY_ORDER_FILTERS,
  sanitizeOrderFilters,
} from "@/utils/adminEnums";
import type { OrderFilterState } from "@/utils/adminEnums";

type Filters = OrderFilterState;

const Dashboard: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Sanitised on init so a stale default/preset can never send a removed enum value.
  const [filters, setFilters] = useState<Filters>(() =>
    sanitizeOrderFilters(EMPTY_ORDER_FILTERS)
  );
  const [searchValue, setsearchValue] = useState("");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["orders", pagination.pageIndex, pagination.pageSize, filters],
    queryFn: () =>
      // page is 1-based on the server, the table is 0-based; both are mandatory.
      getOrders({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        ...filters,
      }),
    placeholderData: keepPreviousData,
    // 401/403/400 are deterministic — retrying just repeats the same failure.
    retry: retryUnlessClientError,
  });

  const handleApplyFilters = (newFilters: Partial<Filters>) => {
    setFilters((prev) =>
      sanitizeOrderFilters({
        ...prev,
        ...newFilters,
        createdAt: newFilters.createdAt || {
          startDate: undefined,
          endDate: undefined,
        },
      })
    );
    // A narrower result set can have fewer pages than the page we are on.
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleClearFilters = () => {
    setFilters(sanitizeOrderFilters(EMPTY_ORDER_FILTERS));
    setsearchValue("");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleSearch = () => {
    setFilters((prev) =>
      sanitizeOrderFilters({ ...prev, searchValue: searchValue.trim() })
    );
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  if (isLoading) return <TableLoaderSkeleton />;
  if (isError)
    return (
      <ApiErrorState
        error={error}
        fallback="Something Went Wrong. Cannot fetch orders"
        onRetry={() => refetch()}
      />
    );

  // quote / payment / billing / rpRouteTransfer can each be null — guard every access.
  const transformedOrders = (data?.data?.orders ?? []).map((order: any) => ({
    orderId: order.id,
    paymentOrderId: order.paymentOrderId,
    providerName: order.providerName,
    userName: order.billing?.name ?? "-",
    userPhone: order.billing?.phone ?? "-",
    amount: order.quote?.value ?? order.payment?.amount ?? null,
    createdAt: order.createdAt,
    paymentStatus: order.paymentOrderStatus,
    paymentStatusAt: order.paymentOrderStatusAt,
    orderStatus: order.state,
    orderStatusAt: order.stateUpdatedAt,
    issueStatus: order.issueStatus,
    issueStatusAt: order.issueStatusAt,
    settleStatus: order.payment?.settleStatus ?? "NA",
    settleStatusAt: order.payment?.settleUpdatedAt ?? null,
    // "no transfer record" and "transfer exists but has no settlement status yet"
    // must read differently, so keep them as distinct states rather than one "NA".
    hasTransfer: Boolean(order.rpRouteTransfer),
    transferStatus: order.rpRouteTransfer?.status ?? null,
    transferStatusAt: order.rpRouteTransfer?.statusUpdatedAt ?? null,
    transferSettleStatus: order.rpRouteTransfer?.settlementStatus ?? null,
  }));

  const searchLabel =
    filters.searchType === "userMobile" ? "User Mobile" : "Payment Order ID";

  return (
    <div className="bg-white rounded-xl">
      <div className="p-4">
        <div className="flex justify-end mb-4 flex-wrap">
          <div className="flex flex-row gap-4 flex-wrap">
            <div className="flex flex-col">
              <div className="flex items-center max-w-md rounded-md border overflow-hidden">
                <select
                  value={filters.searchType}
                  onChange={(e) => {
                    setsearchValue("");
                    handleApplyFilters({
                      searchType: e.target.value as
                        | "userMobile"
                        | "paymentOrderId",
                      searchValue: "",
                      createdAt: filters.createdAt,
                    });
                  }}
                  className="h-10 px-3 text-sm border-r bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="userMobile">User Mobile</option>
                  <option value="paymentOrderId">Payment Order ID</option>
                </select>

                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setsearchValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder={`Exact ${searchLabel}`}
                  className="h-10 flex-1 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />

                <button
                  onClick={handleSearch}
                  disabled={!searchValue.trim()}
                  className="h-10 px-3 flex items-center justify-center bg-muted hover:bg-muted/80 transition"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
             
            </div>
            <ExportOrdersButton filters={filters} />
            <FilterModal
              filters={filters}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
            />
          </div>
        </div>
        <DataTable
          columns={columns}
          data={transformedOrders}
          total={data?.data?.total ?? 0}
          pagination={pagination}
          setPagination={setPagination}
        />
      </div>
    </div>
  );
};

export default Dashboard;
