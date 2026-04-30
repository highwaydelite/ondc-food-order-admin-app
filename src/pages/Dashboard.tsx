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

interface Filters {
  paymentStatus: string;
  orderStatus: string;
  issueStatus: string;
  settleStatus: string;
  createdAt: { startDate?: string; endDate?: string };
  searchType: "userMobile" | "paymentOrderId";
  searchValue: string;
}

const Dashboard: React.FC = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [filters, setFilters] = useState<Filters>({
    paymentStatus: "",
    orderStatus: "",
    issueStatus: "",
    settleStatus: "",
    createdAt: { startDate: undefined, endDate: undefined },
    searchType: "userMobile",
    searchValue: "",
  });
  const [searchValue, setsearchValue] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders", pagination.pageIndex, pagination.pageSize, filters],
    queryFn: () =>
      getOrders({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
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
      }),
    placeholderData: keepPreviousData,
  });

  if (isLoading) return <TableLoaderSkeleton />;
  if (isError)
    return (
      <div className="text-red-500">
        Something Went Wrong. Cannot fetch orders
      </div>
    );

  console.log("Orders:", data.data.orders);

  const transformedOrders = data?.data.orders.map((order: any) => ({
    orderId: order.id,
    paymentOrderId: order.paymentOrderId,
    providerName: order.providerName,
    userName: order.billing.name,
    userPhone: order.billing.phone,
    amount: order.quote.value,
    createdAt: order.createdAt,
    paymentStatus: order.paymentOrderStatus,
    paymentStatusAt: order.paymentOrderStatusAt,
    orderStatus: order.state,
    orderStatusAt: order.stateUpdatedAt,
    issueStatus: order.issueStatus,
    issueStatusAt: order.issueStatusAt,
    settleStatus: order.payment.settleStatus,
    settleStatusAt: order.payment.settleUpdatedAt,
    transferStatus: order.rpRouteTransfer?.status || "NA",
    transferStatusAt: order?.rpRouteTransfer?.statusUpdatedAt,
    transferSettleStatus: order.rpRouteTransfer?.settlementStatus || "NA",
  }));

  const handleApplyFilters = (newFilters: Partial<Filters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      createdAt: newFilters.createdAt || {
        startDate: undefined,
        endDate: undefined,
      },
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      orderStatus: "",
      paymentStatus: "",
      issueStatus: "",
      settleStatus: "",
      createdAt: { startDate: undefined, endDate: undefined },
      searchType: "userMobile",
      searchValue: "",
    });
  };

  const handleSearch = () => {
    // if (!searchValue.trim()) return;

    setFilters({
      ...filters,
      searchValue: searchValue.trim(),
    });
  };

  return (
    <div className="bg-white rounded-xl">
      <div className="p-4">
        <div className="flex justify-end mb-4 flex-wrap">
          <div className="flex flex-row gap-4 flex-wrap">
            <div className="flex items-center max-w-md rounded-md border overflow-hidden">
              <select
                value={filters.searchType}
                onChange={(e) => {
                  setsearchValue("");
                  setFilters({
                    ...filters,
                    searchType: e.target.value as
                      | "userMobile"
                      | "paymentOrderId",
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
                placeholder={`Search by ${
                  filters.searchType === "userMobile"
                    ? "User Mobile"
                    : "Payment Order ID"
                }`}
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
          pageCount={data?.data.total}
          pagination={pagination}
          setPagination={setPagination}
        />
      </div>
    </div>
  );
};

export default Dashboard;
