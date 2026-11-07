import type { LegacyReactTable } from "@tanstack/react-table/legacy"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps<TData extends Record<string, any>> {
  table: LegacyReactTable<TData>
  pageSizeOptions?: number[]
  totalRows?: number
}

export function DataTablePagination<TData extends Record<string, any>>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
  totalRows: controlledTotalRows,
}: DataTablePaginationProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel?.()?.rows?.length
    ?? table.getSelectedRowModel?.()?.rows?.length
    ?? 0
  const totalRows = controlledTotalRows ?? table.getFilteredRowModel?.()?.rows?.length ?? 0
  const pageIndex = table.getState().pagination?.pageIndex ?? 0
  const pageSize = table.getState().pagination?.pageSize ?? 10
  const pageCount = table.getPageCount()

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-3 py-3.5">
      {/* Selected rows info */}
      <div className="text-muted-foreground flex-1 text-sm">
        {selectedRows > 0 ? (
          <span>
            {selectedRows} of {totalRows} row(s) selected.
          </span>
        ) : (
          <span>
            Total {totalRows} {totalRows === 1 ? "entry" : "entries"}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8">
        {/* Rows per page selector */}
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium whitespace-nowrap">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={`${pageSize}`} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page counter */}
        <div className="flex w-[100px] items-center justify-center text-sm font-medium whitespace-nowrap">
          Page {pageCount > 0 ? pageIndex + 1 : 0} of {pageCount}
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center space-x-1.5">
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            aria-label="Go to first page"
          >
            <ChevronsLeftIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Go to previous page"
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="size-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Go to next page"
          >
            <ChevronRightIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden size-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            aria-label="Go to last page"
          >
            <ChevronsRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
