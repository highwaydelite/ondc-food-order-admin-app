import { useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { columns } from "./issueColumns";
import { IssuesFilterModal } from "./IssuesFilterModal";
import { getAllIssues } from "@/utils/igm.api";
import TableLoaderSkeleton from "@/components/TableLoaderSkeleton";
import { ApiErrorState } from "@/components/ApiErrorState";
import { retryUnlessClientError } from "@/utils/queryRetry";
import type { Issue } from "@/utils/types";

const Issues = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [filters, setFilters] = useState<any>({
    issueStatus: "",
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["Issues", pagination.pageIndex, pagination.pageSize, filters],
    queryFn: () =>
      getAllIssues({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        ...filters,
      }),
    placeholderData: keepPreviousData,
    retry: retryUnlessClientError,
  });

  if (isLoading) return <TableLoaderSkeleton />;
  // GET /ret11/issues now requires the ADMIN role — a non-admin token gets a 403.
  if (isError)
    return (
      <ApiErrorState
        error={error}
        fallback="Cannot fetch issues"
        onRetry={() => refetch()}
      />
    );

  const orders: Issue[] = data?.data?.issues ?? [];
  console.log(orders);

  const total = data?.data?.total ?? 0;
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
          total={total}
          pagination={pagination}
          setPagination={setPagination}
        />
      </div>
    </div>
  );
};

export default Issues;
