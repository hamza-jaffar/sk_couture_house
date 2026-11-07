import {
    DataTable,
    DataTableColumnHeader,
    type DataTableColumnDef,
} from '@/components/data-table';
import Heading from '@/components/heading';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { index } from '@/actions/Modules/User/Http/Controllers/CustomerController';
import type { CustomerFilters, PaginatedUser, User } from '@/types';
import { Deferred, Head, router } from '@inertiajs/react';
import type { PaginationState, SortingState } from '@tanstack/table-core';
import { BadgeCheck, CalendarDays, Eye, Mail, UserRound } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Props = {
    customers?: PaginatedUser;
    filters: CustomerFilters;
};

function initials(name: string): string {
    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0] ?? '')
        .join('')
        .toUpperCase();
}

export default function Customer({ customers, filters }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);

    useEffect(() => {
        setSearch(filters.search);
    }, [filters.search]);

    const visitCustomers = useCallback(
        (changes: Partial<CustomerFilters>, resetPage = true) => {
            const nextFilters = {
                ...filters,
                ...changes,
                page: resetPage ? 1 : (changes.page ?? filters.page),
            };
            const query = Object.fromEntries(
                Object.entries(nextFilters).filter(([, value]) => value !== ''),
            );

            setIsLoading(true);
            router.get(
                index.url({ query }),
                {},
                {
                    only: ['customers', 'filters'],
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    onFinish: () => setIsLoading(false),
                },
            );
        },
        [filters],
    );

    useEffect(() => {
        if (search === filters.search) {
            return;
        }

        const timeout = window.setTimeout(() => {
            visitCustomers({ search });
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [filters.search, search, visitCustomers]);

    const columns = useMemo<DataTableColumnDef<User>[]>(
        () => [
            {
                id: 'name',
                accessorKey: 'name',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Customer" />
                ),
                cell: ({ row }) => (
                    <div className="flex min-w-48 items-center gap-3">
                        <Avatar className="size-9">
                            <AvatarImage
                                src={row.original.avatar ?? undefined}
                                alt=""
                            />
                            <AvatarFallback className="text-xs font-medium">
                                {initials(row.original.name)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{row.original.name}</span>
                    </div>
                ),
            },
            {
                id: 'email',
                accessorKey: 'email',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Email" />
                ),
                cell: ({ row }) => (
                    <span className="text-muted-foreground">
                        {row.original.email}
                    </span>
                ),
            },
            {
                id: 'created_at',
                accessorKey: 'created_at',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Joined" />
                ),
                cell: ({ row }) => (
                    <time dateTime={row.original.created_at}>
                        {row.original.created_at.slice(0, 10)}
                    </time>
                ),
            },
            {
                id: 'actions',
                enableHiding: false,
                enableSorting: false,
                cell: ({ row }) => (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCustomer(row.original)}
                        aria-label={`View ${row.original.name}`}
                    >
                        <Eye />
                        View
                    </Button>
                ),
            },
        ],
        [],
    );

    const sorting: SortingState = [
        {
            id: filters.sort,
            desc: filters.direction === 'desc',
        },
    ];
    const pagination: PaginationState = {
        pageIndex: filters.page - 1,
        pageSize: filters.per_page,
    };

    return (
        <>
            <Head title="Customers" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <Heading
                    title="Customers"
                    description="Browse and view customer account details."
                />

                <Deferred
                    data="customers"
                    fallback={
                        <div className="space-y-3">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-64 w-full" />
                        </div>
                    }
                >
                    <DataTable
                        columns={columns}
                        data={customers?.data ?? []}
                        searchPlaceholder="Search customers..."
                        enableGlobalSearch
                        enableColumnVisibility={false}
                        manualSorting
                        sorting={sorting}
                        onSortingChange={(updater) => {
                            const nextSorting =
                                typeof updater === 'function'
                                    ? updater(sorting)
                                    : updater;
                            const sort = nextSorting[0];

                            if (sort) {
                                visitCustomers({
                                    sort: sort.id,
                                    direction: sort.desc ? 'desc' : 'asc',
                                });
                            }
                        }}
                        manualFiltering
                        searchValue={search}
                        onSearchChange={setSearch}
                        manualPagination
                        pagination={pagination}
                        onPaginationChange={(updater) => {
                            const nextPagination =
                                typeof updater === 'function'
                                    ? updater(pagination)
                                    : updater;

                            visitCustomers(
                                {
                                    page: nextPagination.pageIndex + 1,
                                    per_page: nextPagination.pageSize,
                                },
                                false,
                            );
                        }}
                        pageCount={customers?.last_page ?? 0}
                        totalRows={customers?.total ?? 0}
                        pageSizeOptions={[10, 20, 50, 100]}
                        initialPageSize={filters.per_page}
                        isLoading={isLoading || customers === undefined}
                        emptyTitle="No customers found"
                        emptyDescription="Try a different search, or check back when customers have joined."
                    />
                </Deferred>
            </div>

            <Sheet
                open={selectedCustomer !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedCustomer(null);
                    }
                }}
            >
                <SheetContent side="right" className="w-full sm:max-w-md">
                    {selectedCustomer && (
                        <>
                            <SheetHeader className="border-b">
                                <div className="flex items-center gap-4 pr-8">
                                    <Avatar size="lg">
                                        <AvatarImage
                                            src={
                                                selectedCustomer.avatar ??
                                                undefined
                                            }
                                            alt=""
                                        />
                                        <AvatarFallback>
                                            {initials(selectedCustomer.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <SheetTitle className="truncate">
                                            {selectedCustomer.name}
                                        </SheetTitle>
                                        <SheetDescription>
                                            Customer profile
                                        </SheetDescription>
                                    </div>
                                </div>
                            </SheetHeader>

                            <div className="space-y-5 px-4">
                                <div className="flex items-start gap-3">
                                    <Mail className="mt-0.5 size-4 text-muted-foreground" />
                                    <div className="min-w-0">
                                        <p className="text-xs text-muted-foreground">
                                            Email address
                                        </p>
                                        <p className="font-medium break-all">
                                            {selectedCustomer.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <BadgeCheck className="mt-0.5 size-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Email verification
                                        </p>
                                        <p className="font-medium">
                                            {selectedCustomer.email_verified_at
                                                ? 'Verified'
                                                : 'Not verified'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CalendarDays className="mt-0.5 size-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Customer since
                                        </p>
                                        <time
                                            className="font-medium"
                                            dateTime={
                                                selectedCustomer.created_at
                                            }
                                        >
                                            {selectedCustomer.created_at.slice(
                                                0,
                                                10,
                                            )}
                                        </time>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <UserRound className="mt-0.5 size-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Account type
                                        </p>
                                        <p className="font-medium">Customer</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </>
    );
}

Customer.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Customers', href: '/dashboard/customers' },
    ],
};
