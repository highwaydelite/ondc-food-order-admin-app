import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { columns } from "./issueColumns";
import { IssuesFilterModal } from "./IssuesFilterModal";
import { getAllIssues } from "@/utils/igm.api";
import TableLoaderSkeleton from "@/components/TableLoaderSkeleton";
import type { Issue } from "@/utils/types";

const Issues = () => {
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
      getAllIssues({
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
          data={orders}
          pageCount={total}
          pagination={pagination}
          setPagination={setPagination}
        />
      </div>
    </div>
  );
};

export default Issues;
