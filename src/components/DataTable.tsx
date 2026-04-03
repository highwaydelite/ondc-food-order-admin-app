"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type PaginationState,
  type Updater,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDown, ArrowUp } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  pagination: PaginationState;
  setPagination: (updater: Updater<PaginationState>) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pagination,
  setPagination,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination,
    },
    onPaginationChange: (updater) => setPagination(updater),
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  return (
    <div className="relative z-0 p-0">
      {/* Table */}
      <div className="rounded-t-none rounded-b-xl">
        <Table className="w-full overflow-x-scroll">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-gray-100 hover:bg-gray-100"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className="py-2 flex items-center cursor-pointer justify-center text-[13px] font-semibold text-black"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() === "asc" && (
                          <ArrowUp className="h-3 text-gray-500" />
                        )}
                        {header.column.getIsSorted() === "desc" && (
                          <ArrowDown className="h-3 text-gray-500" />
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={row.getIsSelected() ? "bg-gray-100 " : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="text-center text-xs text-gray-900 py-4"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 2}
                  className="h-24 text-center"
                >
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 flex-wrap">
        <span className="text-sm text-gray-400">
          Showing data{" "}
          {Math.min(pagination.pageIndex * pagination.pageSize + 1, pageCount)}{" "}
          to{" "}
          {Math.min(
            (pagination.pageIndex + 1) * pagination.pageSize,
            pageCount
          )}{" "}
          of {pageCount} {""}
        </span>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="text-sm border rounded-sm p-1 bg-secondary"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>

          <button
            className="text-sm border rounded-sm p-1 w-8 h-8 bg-secondary"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </button>

          {Array.from({
            length: Math.ceil(pageCount / pagination.pageSize),
          }).map((_, index) => {
            const isCurrent = index === pagination.pageIndex;
            const isNearCurrent =
              index >= pagination.pageIndex - 1 &&
              index <= pagination.pageIndex + 1;

            return isNearCurrent ||
              index === 0 ||
              index === Math.ceil(pageCount / pagination.pageSize) - 1 ? (
              <button
                key={index}
                className={`text-sm border rounded-sm p-1 w-8 h-8 ${
                  isCurrent ? "bg-yellow-400" : "bg-gray-100"
                }`}
                onClick={() => table.setPageIndex(index)}
                disabled={isCurrent}
              >
                {index + 1}
              </button>
            ) : index === pagination.pageIndex - 2 ||
              index === pagination.pageIndex + 2 ? (
              <button
                key={index}
                className="text-sm border rounded-sm p-1 w-8 h-8 bg-gray-100"
                disabled
              >
                {"..."}
              </button>
            ) : null;
          })}

          {/* Next Page */}
          <button
            className="text-sm border rounded-sm p-1 w-8 h-8 bg-gray-100"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </button>
        </div>
      </div>
    </div>
  );
}
