'use client'

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type PaginationState,
  type Updater,
} from '@tanstack/react-table'

import {
    Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'

import { ArrowDown, ArrowUp } from 'lucide-react'


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: any[]
  pageCount: number
  pagination: PaginationState
  setPagination: (updater: Updater<PaginationState>) => void
  selectedIds: any
  setSelectedIds: (prev:any) => any
}

export function DataTable<TData>({
  columns,
  data,
  pageCount,
  pagination,
  setPagination,
  selectedIds,
  setSelectedIds,
}: DataTableProps<TData, any>) {
  /** Handle individual row selection */
  const handleCheckboxChange = (itemId: string) => {
    setSelectedIds((prevSelected:string[]) =>{

    
    return prevSelected.includes(itemId)? prevSelected.filter((id) => id !== itemId)
    : [...prevSelected, itemId] 
    }  
    )  
  }

  /** Handle bulk select/deselect */
  const handleSelectAll = () => {
    const allVisibleIds = data.map((item) => item.id)
    const allSelected = allVisibleIds.every((id) => selectedIds.includes(id))

    setSelectedIds(allSelected ? [] : allVisibleIds)
  }

  /** Check if all rows are selected */
  const allSelected = data.length > 0 && data.every((item) => selectedIds.includes(item?.id))

  /** Check if some rows are selected (for indeterminate state) */
  const someSelected = data.length > 0 && data.some((item) => selectedIds.includes(item?.id)) && !allSelected

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: { pagination },
    onPaginationChange: (updater) => setPagination(updater),
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  return (
    <div className="relative z-0 p-0">
      <div className="rounded-t-none rounded-b-xl">
        <Table className="w-full overflow-x-scroll">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-100 hover:bg-gray-100">
                {/* Bulk Select Checkbox */}
                <TableHead className="text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    ref={(el:any) => el && (el.indeterminate = someSelected)}
                  />
                </TableHead>

                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className="py-6 flex items-center cursor-pointer justify-center text-[13px] font-semibold text-black"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === 'asc' && <ArrowUp className="h-3 text-gray-500" />}
                        {header.column.getIsSorted() === 'desc' && <ArrowDown className="h-3 text-gray-500" />}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => {
                const itemId = row.original.orderId
                return (
                  <TableRow key={row.id} className={selectedIds.includes(itemId) ? 'bg-gray-100 ' : undefined}>
                    {/* Checkbox Column */}
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(itemId)}
                        onChange={() => handleCheckboxChange(itemId)}
                      />
                    </TableCell>
                    {/* Other Columns */}
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-center text-xs text-gray-900 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                  No records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
