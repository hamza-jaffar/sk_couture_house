import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type LegacyColumnDef,
  type LegacyReactTable,
  useLegacyTable,
} from "@tanstack/react-table/legacy"
import { flexRender } from "@tanstack/react-table"
import type {
  ColumnFiltersState,
  ColumnVisibilityState,
  PaginationState,
  RowSelectionState,
  SortingState,
} from "@tanstack/table-core"
import { SearchIcon, XIcon, InboxIcon } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

import { DataTablePagination } from "./data-table-pagination"
import { DataTableViewOptions } from "./data-table-view-options"

export type DataTableColumnDef<TData extends Record<string, any>, TValue = unknown> = LegacyColumnDef<TData, TValue>

export interface DataTableProps<TData extends Record<string, any>, TValue = unknown> {
  columns: DataTableColumnDef<TData, TValue>[]
  data: TData[]
  /** Key to filter against with the search input (e.g. 'name' or 'email'). If omitted, search input is hidden unless enableGlobalSearch is true. */
  searchKey?: string
  searchPlaceholder?: string
  /** Enables global filtering across all searchable columns */
  enableGlobalSearch?: boolean
  /** Shows column toggle menu */
  enableColumnVisibility?: boolean
  /** Shows pagination bar */
  enablePagination?: boolean
  /** Page size options for pagination */
  pageSizeOptions?: number[]
  /** Default initial page size */
  initialPageSize?: number
  /** Shows loading skeleton */
  isLoading?: boolean
  /** Optional custom toolbar actions (e.g. "Create Role" button) */
  toolbarActions?: (table: LegacyReactTable<TData>) => React.ReactNode
  /** Optional custom filters placed next to search */
  toolbarFilters?: (table: LegacyReactTable<TData>) => React.ReactNode
  /** Optional selected rows batch action bar */
  batchActions?: (table: LegacyReactTable<TData>, selectedRows: TData[]) => React.ReactNode
  /** Custom empty state message */
  emptyTitle?: string
  emptyDescription?: string
  /** Click handler for rows */
  onRowClick?: (row: TData) => void
  /** Outer container class */
  className?: string
  /** Enable alternating row colors */
  striped?: boolean
  /** Stable row identity for selection when records are paginated by the server */
  getRowId?: (originalRow: TData) => string
  /** Clear selections when the server-side result set changes */
  selectionResetKey?: string

  // ── Controlled / Server-Side Props ──
  /** Enables manual/server-side sorting */
  manualSorting?: boolean
  sorting?: SortingState
  onSortingChange?: (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => void

  /** Enables manual/server-side filtering (search) */
  manualFiltering?: boolean
  searchValue?: string
  onSearchChange?: (value: string) => void

  /** Enables manual/server-side pagination */
  manualPagination?: boolean
  pageCount?: number
  totalRows?: number
  pagination?: PaginationState
  onPaginationChange?: (updaterOrValue: PaginationState | ((old: PaginationState) => PaginationState)) => void
}

export function DataTable<TData extends Record<string, any>, TValue = unknown>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  enableGlobalSearch = false,
  enableColumnVisibility = true,
  enablePagination = true,
  pageSizeOptions,
  initialPageSize = 10,
  isLoading = false,
  toolbarActions,
  toolbarFilters,
  batchActions,
  emptyTitle = "No results found",
  emptyDescription = "There are no records to display at this time.",
  onRowClick,
  className,
  striped = false,
  getRowId,
  selectionResetKey,
  manualSorting = false,
  sorting,
  onSortingChange,
  manualFiltering = false,
  searchValue,
  onSearchChange,
  manualPagination = false,
  pageCount,
  totalRows,
  pagination,
  onPaginationChange,
}: DataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState<string>("")
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [internalPagination, setInternalPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  })

  const effectiveSorting = sorting ?? internalSorting
  const effectivePagination = pagination ?? internalPagination
  const effectiveOnSortingChange = onSortingChange ?? setInternalSorting
  const effectiveOnPaginationChange = onPaginationChange ?? setInternalPagination

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table = useLegacyTable<TData>({
    data,
    columns: columns as any,
    getRowId,
    manualSorting,
    manualFiltering,
    manualPagination,
    pageCount: manualPagination ? pageCount : undefined,
    rowCount: manualPagination ? totalRows : undefined,
    state: {
      sorting: effectiveSorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: effectivePagination,
      ...(enableGlobalSearch && !manualFiltering ? { globalFilter } : {}),
    },
    onSortingChange: effectiveOnSortingChange,
    onColumnFiltersChange: setColumnFilters,
    ...(enableGlobalSearch && !manualFiltering ? { onGlobalFilterChange: setGlobalFilter } : {}),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: effectiveOnPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    ...(!manualSorting ? { getSortedRowModel: getSortedRowModel() } : {}),
    ...(!manualFiltering ? { getFilteredRowModel: getFilteredRowModel() } : {}),
    ...(enablePagination && !manualPagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
  })

  React.useEffect(() => {
    table.resetRowSelection()
  }, [selectionResetKey])

  // Search value getter/setter depending on whether we use server-side or client-side mode
  const currentSearchValue = manualFiltering
    ? (searchValue ?? "")
    : searchKey
      ? (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
      : globalFilter

  const handleSearchChange = (value: string) => {
    if (manualFiltering) {
      onSearchChange?.(value)
    } else if (searchKey) {
      table.getColumn(searchKey)?.setFilterValue(value)
    } else if (enableGlobalSearch) {
      setGlobalFilter(value)
    }
  }

  const handleClearSearch = () => {
    handleSearchChange("")
  }

  // Selected data helper — use getSelectedRowModel for manual mode (no filter model)
  const selectedRows = (manualFiltering
    ? table.getSelectedRowModel()
    : table.getFilteredSelectedRowModel()
  ).rows.map((row) => row.original)

  const hasSearch = !!searchKey || enableGlobalSearch || manualFiltering
  const isFiltered = manualFiltering
    ? Boolean(searchValue)
    : columnFilters.length > 0 || (enableGlobalSearch && Boolean(globalFilter))

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left side: Search & filters */}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {hasSearch && (
            <div className="relative w-full sm:w-64 md:w-80">
              <SearchIcon className="text-muted-foreground absolute left-2.5 top-1/2 size-4 -translate-y-1/2 pointer-events-none" />
              <Input
                placeholder={searchPlaceholder}
                value={currentSearchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-9 pl-8 pr-8 text-sm"
              />
              {currentSearchValue && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-muted-foreground hover:text-foreground absolute right-2.5 top-1/2 -translate-y-1/2"
                  aria-label="Clear search"
                >
                  <XIcon className="size-3.5" />
                </button>
              )}
            </div>
          )}

          {toolbarFilters && toolbarFilters(table)}

          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (manualFiltering) {
                  onSearchChange?.("")
                } else {
                  table.resetColumnFilters()
                  if (enableGlobalSearch) setGlobalFilter("")
                }
              }}
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Reset
              <XIcon className="ml-1 size-3.5" />
            </Button>
          )}
        </div>

        {/* Right side: View Options & Custom Actions */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {toolbarActions && toolbarActions(table)}
          {enableColumnVisibility && <DataTableViewOptions table={table} />}
        </div>
      </div>

      {/* Selected rows batch banner */}
      {selectedRows.length > 0 && batchActions && (
        <div className="bg-primary/10 border-primary/20 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-2.5 text-sm animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs font-bold">
              {selectedRows.length}
            </span>
            <span>selected</span>
          </div>
          <div className="flex items-center gap-2">
            {batchActions(table, selectedRows)}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => table.resetRowSelection()}
              className="h-8 text-xs"
            >
              Deselect all
            </Button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="border-border/60 bg-card rounded-xl border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-b">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className="h-11 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading Skeleton Rows
                Array.from({ length: initialPageSize }).map((_, rowIndex) => (
                  <TableRow key={rowIndex} className="border-b">
                    {columns.map((_, colIndex) => (
                      <TableCell key={colIndex} className="px-4 py-3.5">
                        <Skeleton className="h-4 w-full max-w-30" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onRowClick && onRowClick(row.original)}
                    className={cn(
                      "border-b transition-colors",
                      striped && index % 2 === 1 && "bg-muted/20",
                      onRowClick && "cursor-pointer hover:bg-muted/50"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-4 py-3.5 text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                // Empty State
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-64 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2.5 py-8">
                      <div className="bg-muted flex size-12 items-center justify-center rounded-full text-muted-foreground">
                        <InboxIcon className="size-6" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-base">{emptyTitle}</p>
                        <p className="text-muted-foreground text-sm max-w-sm">
                          {isFiltered
                            ? "Try adjusting your search or filters to find what you are looking for."
                            : emptyDescription}
                        </p>
                      </div>
                      {isFiltered && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            table.resetColumnFilters()
                            if (enableGlobalSearch) setGlobalFilter("")
                          }}
                          className="mt-2 text-xs"
                        >
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {enablePagination && !isLoading && (
          <div className="border-t border-border/60 bg-muted/10">
            <DataTablePagination
              table={table}
              pageSizeOptions={pageSizeOptions}
              totalRows={totalRows}
            />
          </div>
        )}
      </div>
    </div>
  )
}
