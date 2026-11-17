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
import type {
    Order,
    OrderFilters,
    OrderStatusOption,
    PaginatedOrders,
} from '@/types/orders';
import { Deferred, Head, Link, router } from '@inertiajs/react';
import type { PaginationState, SortingState } from '@tanstack/table-core';
import {
    Eye,
    MoreHorizontal,
    ShoppingBag,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

type Props = {
    orders?: PaginatedOrders;
    filters: OrderFilters;
    statusOptions?: OrderStatusOption[];
};

export default function OrderIndex({ orders, filters, statusOptions }: Props) {
    const { can } = useCan();
    const [search, setSearch] = useState(filters.search ?? '');
    const [isLoading, setIsLoading] = useState(false);

    const visitOrders = useCallback(
        (newFilters: Partial<OrderFilters>, resetPage = true) => {
            setIsLoading(true);
            const next = {
                ...filters,
                ...newFilters,
                ...(resetPage ? { page: 1 } : {}),
            };

            const query: Record<string, string | number> = {};
            if (next.search) query.search = next.search;
            if (next.status && next.status !== 'all') query.status = next.status;
            if (next.type && next.type !== 'all') query.type = next.type;
            if (next.payment_status && next.payment_status !== 'all') {
                query.payment_status = next.payment_status;
            }
            if (next.sort) query.sort = next.sort;
            if (next.direction) query.direction = next.direction;
            if (next.per_page) query.per_page = next.per_page;
            if (next.page && next.page > 1) query.page = next.page;

            router.get('/dashboard/orders', query, {
                preserveState: true,
                preserveScroll: true,
                only: ['orders', 'filters'],
                onFinish: () => setIsLoading(false),
            });
        },
        [filters],
    );

    const getStatusBadge = (order: Order) => {
        const color = order.status_color ?? 'neutral';
        const styles: Record<string, string> = {
            amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
            blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900',
            indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900',
            cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-900',
            emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900',
            rose: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900',
            orange: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900',
        };

        return (
            <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                    styles[color] ?? 'bg-neutral-100 text-neutral-700 border-neutral-200'
                }`}
            >
                {order.status_label ?? order.status}
            </span>
        );
    };

    const columns = useMemo<DataTableColumnDef<Order>[]>(
        () => [
            {
                accessorKey: 'order_number',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Order #" />
                ),
                cell: ({ row }) => (
                    <div className="min-w-0">
                        <Link
                            href={`/dashboard/orders/${row.original.order_number}`}
                            className="font-mono font-semibold tracking-wide text-foreground hover:underline"
                        >
                            #{row.original.order_number}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                            {row.original.created_at_human ??
                                row.original.created_at.slice(0, 10)}
                        </p>
                    </div>
                ),
            },
            {
                accessorKey: 'customer_name',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Customer" />
                ),
                cell: ({ row }) => (
                    <div className="min-w-0">
                        <p className="font-medium text-foreground">
                            {row.original.customer_name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            {row.original.customer_email}
                        </p>
                        {row.original.customer_phone && (
                            <p className="text-[11px] text-muted-foreground">
                                {row.original.customer_phone}
                            </p>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: 'type',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Type" />
                ),
                cell: ({ row }) => (
                    <span
                        className={`inline-block rounded-xs px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            row.original.type === 'whatsapp'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
                        }`}
                    >
                        {row.original.type === 'whatsapp' ? 'WhatsApp' : 'Direct'}
                    </span>
                ),
            },
            {
                accessorKey: 'items_count',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Items" />
                ),
                cell: ({ row }) => (
                    <span className="text-muted-foreground">
                        {row.original.items_count ?? row.original.items?.length ?? 0}
                    </span>
                ),
                enableSorting: false,
            },
            {
                accessorKey: 'total',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Total" />
                ),
                cell: ({ row }) => (
                    <span className="font-bold text-foreground">
                        {row.original.currency_icon}
                        {row.original.total.toLocaleString('en-PK', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                        })}
                    </span>
                ),
            },
            {
                accessorKey: 'status',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Status" />
                ),
                cell: ({ row }) => getStatusBadge(row.original),
            },
            {
                accessorKey: 'payment_status',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Payment" />
                ),
                cell: ({ row }) => (
                    <span className="capitalize text-xs text-muted-foreground">
                        {row.original.payment_status}
                    </span>
                ),
                enableSorting: false,
            },
            {
                id: 'actions',
                enableHiding: false,
                cell: ({ row }) => {
                    const order = row.original;

                    return (
                        <div className="flex justify-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Actions for order #${order.order_number}`}
                                        >
                                            <MoreHorizontal className="size-4" />
                                        </Button>
                                    }
                                />
                                <DropdownMenuContent align="end" className="w-40">
                                    <DropdownMenuItem
                                        onClick={() =>
                                            router.visit(`/dashboard/orders/${order.order_number}`)
                                        }
                                    >
                                        <Eye className="mr-2 size-4" />
                                        View details
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                },
            },
        ],
        [],
    );

    const statusItems = useMemo(
        () => [
            { value: 'all', label: 'All Statuses' },
            ...(statusOptions ?? []).map((opt) => ({
                value: opt.value,
                label: opt.label,
            })),
        ],
        [statusOptions],
    );

    const typeItems = [
        { value: 'all', label: 'All Order Types' },
        { value: 'direct', label: 'Direct Checkout' },
        { value: 'whatsapp', label: 'WhatsApp' },
    ];

    const paymentItems = [
        { value: 'all', label: 'All Payment Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'paid', label: 'Paid' },
        { value: 'failed', label: 'Failed' },
    ];

    const sorting: SortingState = [
        { id: filters.sort ?? 'created_at', desc: filters.direction === 'desc' },
    ];

    const pagination: PaginationState = {
        pageIndex: (orders?.current_page ?? filters.page ?? 1) - 1,
        pageSize: orders?.per_page ?? filters.per_page ?? 15,
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title="Orders" />

            <div className="flex flex-wrap items-start justify-between gap-4">
                <Heading
                    variant="small"
                    title="Orders"
                    description="View, search, filter, and manage customer orders and fulfillment."
                />
            </div>

            <DataTable
                columns={columns}
                data={orders?.data ?? []}
                getRowId={(order) => String(order.id)}
                selectionResetKey={JSON.stringify(filters)}
                manualFiltering
                manualSorting
                manualPagination
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search order #, customer, email, phone..."
                sorting={sorting}
                onSortingChange={(next) => {
                    const value = typeof next === 'function' ? next(sorting) : next;
                    visitOrders({
                        sort: value[0]?.id ?? 'created_at',
                        direction: value[0]?.desc ? 'desc' : 'asc',
                    });
                }}
                pagination={pagination}
                onPaginationChange={(next) => {
                    const value = typeof next === 'function' ? next(pagination) : next;
                    visitOrders(
                        {
                            page: value.pageIndex + 1,
                            per_page: value.pageSize,
                        },
                        false,
                    );
                }}
                pageCount={orders?.last_page ?? 0}
                totalRows={orders?.total ?? 0}
                initialPageSize={orders?.per_page ?? filters.per_page ?? 15}
                pageSizeOptions={[10, 15, 25, 50, 100]}
                isLoading={isLoading || orders === undefined}
                emptyTitle="No orders found"
                emptyDescription={
                    filters.search
                        ? 'Try adjusting your search query or filters.'
                        : 'Customer orders will appear here once placed.'
                }
                toolbarFilters={() => (
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Status Filter */}
                        <Deferred
                            data="statusOptions"
                            fallback={<Skeleton className="h-9 w-36" />}
                        >
                            <Select
                                items={statusItems}
                                value={filters.status ?? 'all'}
                                onValueChange={(val) => visitOrders({ status: val })}
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
                        </Deferred>

                        {/* Type Filter */}
                        <Select
                            items={typeItems}
                            value={filters.type ?? 'all'}
                            onValueChange={(val) => visitOrders({ type: val })}
                        >
                            <SelectTrigger className="h-9 min-w-36">
                                <SelectValue placeholder="All Order Types" />
                            </SelectTrigger>
                            <SelectContent>
                                {typeItems.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Payment Status Filter */}
                        <Select
                            items={paymentItems}
                            value={filters.payment_status ?? 'all'}
                            onValueChange={(val) => visitOrders({ payment_status: val })}
                        >
                            <SelectTrigger className="h-9 min-w-36">
                                <SelectValue placeholder="All Payment Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                {paymentItems.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {(filters.search ||
                            filters.status !== 'all' ||
                            filters.type !== 'all' ||
                            filters.payment_status !== 'all') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearch('');
                                    visitOrders({
                                        search: '',
                                        status: 'all',
                                        type: 'all',
                                        payment_status: 'all',
                                    });
                                }}
                            >
                                Reset
                            </Button>
                        )}
                    </div>
                )}
            />
        </div>
    );
}

OrderIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Orders', href: '/dashboard/orders' },
    ],
};
