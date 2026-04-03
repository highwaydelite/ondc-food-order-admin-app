import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { IssuesFilterModal } from "./IssuesFilterModal";
import { getSellerIssues } from "@/utils/igm.api";
import TableLoaderSkeleton from "@/components/TableLoaderSkeleton";
import { columns } from "./sellerIssueColumns";
import type { Issue } from "@/utils/types";

const SellerIssues = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [filters, setFilters] = useState<any>({
    issueStatus: "",
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["Issues", pagination.pageIndex, pagination.pageSize, filters],
    queryFn: () =>
      getSellerIssues({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        ...filters,
      }),
    placeholderData: keepPreviousData,
  });

  if (isLoading) return <TableLoaderSkeleton />;
  if (isError) return <div>Error: {(error as Error).message}</div>;

  const orders: Issue[] = data.data.issues;
  console.log(orders);

  const transformedOrders = orders.map((order) => {
    const interfacingActor = order.issueActors?.find(
      (actor) => actor.type === "INTERFACING_NP"
    );
    return {
      ...order,
      name: interfacingActor?.name ?? "",
      phone: interfacingActor?.phone ?? "",
    };
  });
  const total = data.data.total;
  const handleApplyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      issueStatus: "",
    });
  };
  return (
    <div className="bg-white rounded-xl">
      <div className="p-4">
        <div className="flex justify-end mb-4">
          <IssuesFilterModal
            filters={filters}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />
        </div>
        <DataTable
          columns={columns}
          data={transformedOrders}
          pageCount={total}
          pagination={pagination}
          setPagination={setPagination}
        />
      </div>
    </div>
  );
};

export default SellerIssues;
