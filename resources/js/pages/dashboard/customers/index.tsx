import {
    DataTable,
    DataTableColumnHeader,
    type DataTableColumnDef,
} from '@/components/data-table';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useCan } from '@/hooks/use-can';
import type { CustomerFilters, CustomerRow, PaginatedCustomers } from '@/types/customers';
import { Deferred, Head, router } from '@inertiajs/react';
import type { PaginationState, SortingState } from '@tanstack/table-core';
import { Eye, MoreHorizontal, ToggleLeft, ToggleRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Props = {
    customers?: PaginatedCustomers;
    filters: CustomerFilters;
};

export default function CustomerIndex({ customers, filters }: Props) {
    const can = useCan();
    const [search, setSearch] = useState(filters.search ?? '');
    const [isLoading, setIsLoading] = useState(false);

    const visitCustomers = useCallback(
        (newFilters: Partial<CustomerFilters>, resetPage = true) => {
            setIsLoading(true);
            const next = {
                ...filters,
                ...newFilters,
                ...(resetPage ? { page: 1 } : {}),
            };

            const query: Record<string, string | number> = {};
            if (next.search) query.search = next.search;
            if (next.status && next.status !== 'all') query.status = next.status;
            if (next.sort) query.sort = next.sort;
            if (next.direction) query.direction = next.direction;
            if (next.per_page) query.per_page = next.per_page;
            if (next.page && next.page > 1) query.page = next.page;

            router.get('/dashboard/customers', query, {
                preserveState: true,
                preserveScroll: true,
                only: ['customers', 'filters'],
                onFinish: () => setIsLoading(false),
            });
        },
        [filters],
    );

    useEffect(() => {
        if (search === (filters.search ?? '')) {
            return;
        }

        const timeout = window.setTimeout(() => visitCustomers({ search }), 300);

        return () => window.clearTimeout(timeout);
    }, [filters.search, search, visitCustomers]);

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400">
                Active
            </span>
        ) : (
            <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400">
                Inactive
            </span>
        );
    };

    const handleToggleStatus = (customer: CustomerRow) => {
        router.patch(
            `/dashboard/customers/${customer.id}/status`,
            { is_active: !customer.is_active },
            {
                preserveState: true,
                preserveScroll: true,
                only: ['customers', 'filters'],
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const columns = useMemo<DataTableColumnDef<CustomerRow>[]>(
        () => [
            {
                accessorKey: 'name',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Customer" />
                ),
                cell: ({ row }) => (
                    <div className="min-w-0">
                        <p className="font-medium text-foreground">{row.original.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                            {row.original.email}
                        </p>
                        {row.original.phone && (
                            <p className="text-[11px] text-muted-foreground">
                                {row.original.phone}
                            </p>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: 'is_active',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Status" />
                ),
                cell: ({ row }) => getStatusBadge(row.original.is_active),
                enableSorting: false,
            },
            {
                accessorKey: 'orders_count',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Orders" />
                ),
                cell: ({ row }) => (
                    <span className="text-muted-foreground">{row.original.orders_count}</span>
                ),
            },
            {
                accessorKey: 'total_spent',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Total Spent" />
                ),
                cell: ({ row }) => (
                    <span className="font-bold text-foreground">
                        Rs.{' '}
                        {row.original.total_spent.toLocaleString('en-PK', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                        })}
                    </span>
                ),
            },
            {
                accessorKey: 'created_at',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Member Since" />
                ),
                cell: ({ row }) => (
                    <span className="text-sm text-muted-foreground">
                        {row.original.created_at_human ?? row.original.created_at.slice(0, 10)}
                    </span>
                ),
            },
            {
                id: 'actions',
                enableHiding: false,
                cell: ({ row }) => {
                    const customer = row.original;

                    return (
                        <div className="flex justify-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Actions for ${customer.name}`}
                                        >
                                            <MoreHorizontal className="size-4" />
                                        </Button>
                                    }
                                />
                                <DropdownMenuContent align="end" className="w-44">
                                    <DropdownMenuItem
                                        onClick={() =>
                                            router.visit(`/dashboard/customers/${customer.id}`)
                                        }
                                    >
                                        <Eye className="mr-2 size-4" />
                                        View details
                                    </DropdownMenuItem>
                                    {can('customers.update') && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => handleToggleStatus(customer)}
                                            >
                                                {customer.is_active ? (
                                                    <>
                                                        <ToggleLeft className="mr-2 size-4" />
                                                        Deactivate
                                                    </>
                                                ) : (
                                                    <>
                                                        <ToggleRight className="mr-2 size-4" />
                                                        Activate
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                },
            },
        ],
        [can],
    );

    const statusItems = [
        { value: 'all', label: 'All Statuses' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
    ];

    const sorting: SortingState = [
        { id: filters.sort ?? 'created_at', desc: filters.direction === 'desc' },
    ];

    const pagination: PaginationState = {
        pageIndex: (customers?.current_page ?? filters.page ?? 1) - 1,
        pageSize: customers?.per_page ?? filters.per_page ?? 15,
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title="Customers" />

            <div className="flex flex-wrap items-start justify-between gap-4">
                <Heading
                    variant="small"
                    title="Customers"
                    description="Browse, search, and manage registered storefront customers."
                />
            </div>

            <Deferred data="customers" fallback={<SkeletonRows />}>
                <DataTable
                    columns={columns}
                    data={customers?.data ?? []}
                    getRowId={(customer) => String(customer.id)}
                    selectionResetKey={JSON.stringify(filters)}
                    manualFiltering
                    manualSorting
                    manualPagination
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search name, email, phone..."
                    sorting={sorting}
                    onSortingChange={(next) => {
                        const value = typeof next === 'function' ? next(sorting) : next;
                        visitCustomers({
                            sort: value[0]?.id ?? 'created_at',
                            direction: value[0]?.desc ? 'desc' : 'asc',
                        });
                    }}
                    pagination={pagination}
                    onPaginationChange={(next) => {
                        const value = typeof next === 'function' ? next(pagination) : next;
                        visitCustomers(
                            {
                                page: value.pageIndex + 1,
                                per_page: value.pageSize,
                            },
                            false,
                        );
                    }}
                    pageCount={customers?.last_page ?? 0}
                    totalRows={customers?.total ?? 0}
                    initialPageSize={customers?.per_page ?? filters.per_page ?? 15}
                    pageSizeOptions={[10, 15, 25, 50, 100]}
                    isLoading={isLoading || customers === undefined}
                    emptyTitle="No customers found"
                    emptyDescription={
                        filters.search
                            ? 'Try adjusting your search query or filters.'
                            : 'Registered customers will appear here.'
                    }
                    toolbarFilters={() => (
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Status Filter */}
                            <Select
                                items={statusItems}
                                value={filters.status ?? 'all'}
                                onValueChange={(val) => visitCustomers({ status: val })}
                            >
                                <SelectTrigger className="h-9 min-w-36">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusItems.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {(filters.search || (filters.status && filters.status !== 'all')) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearch('');
                                        visitCustomers({ search: '', status: 'all' });
                                    }}
                                >
                                    Reset
                                </Button>
                            )}
                        </div>
                    )}
                />
            </Deferred>
        </div>
    );
}

function SkeletonRows() {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-9 w-36" />
            </div>
            <div className="rounded-md border">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-4 border-b px-4 py-3 last:border-0"
                    >
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-10" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-28 ml-auto" />
                    </div>
                ))}
            </div>
        </div>
    );
}

CustomerIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Customers', href: '/dashboard/customers' },
    ],
};
