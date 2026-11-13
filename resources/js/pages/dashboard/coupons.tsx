import {
    bulkDestroy,
    bulkForceDelete,
    bulkRestore,
    destroy,
    forceDelete,
    index,
    restore,
    store,
    update,
} from '@/actions/Modules/Coupon/Http/Controllers/CouponController';
import CouponForm from '@/components/forms/coupon-form';
import {
    DataTable,
    DataTableColumnHeader,
    type DataTableColumnDef,
} from '@/components/data-table';
import FormDialog from '@/components/form-dialog';
import Heading from '@/components/heading';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useCan } from '@/hooks/use-can';
import type {
    Coupon,
    CouponFilters,
    DiscountTypeOption,
    PaginatedCoupons,
} from '@/types';
import { Deferred, Form, Head, router } from '@inertiajs/react';
import type { PaginationState, SortingState } from '@tanstack/table-core';
import {
    BadgePercent,
    CalendarDays,
    CircleDollarSign,
    Hash,
    MoreHorizontal,
    PenIcon,
    Plus,
    Tag,
    Trash2,
    Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Props = {
    coupons?: PaginatedCoupons;
    discountTypeOptions: DiscountTypeOption[];
    filters: CouponFilters;
};

type PendingAction = {
    action: 'delete' | 'restore' | 'force-delete';
    ids: number[];
    label: string;
};

function formatDate(isoString: string | null): string {
    if (!isoString) {
        return '—';
    }
    return isoString.slice(0, 10);
}

function CouponDetails({ coupon }: { coupon: Coupon }) {
    const details = [
        {
            label: 'Discount Type',
            value: coupon.discount_type_label,
            icon: coupon.discount_type === 'percentage' ? BadgePercent : CircleDollarSign,
        },
        {
            label: 'Discount Value',
            value: coupon.discount_type === 'percentage'
                ? `${coupon.discount_value}%`
                : `$${coupon.discount_value}`,
            icon: Tag,
        },
        {
            label: 'Times Used',
            value: coupon.usage_limit
                ? `${coupon.times_used} / ${coupon.usage_limit}`
                : String(coupon.times_used),
            icon: Hash,
        },
        {
            label: 'Per-User Limit',
            value: coupon.usage_limit_per_user ? String(coupon.usage_limit_per_user) : 'Unlimited',
            icon: Users,
        },
        {
            label: 'Start Date',
            value: formatDate(coupon.starts_at),
            icon: CalendarDays,
        },
        {
            label: 'Expiry Date',
            value: formatDate(coupon.expires_at),
            icon: CalendarDays,
        },
    ];

    const constraints = [
        ['Minimum Spend', coupon.min_spend ? `$${coupon.min_spend}` : 'None'],
        ['Maximum Discount', coupon.max_discount ? `$${coupon.max_discount}` : 'None'],
        ['Internal Note', coupon.description ?? '—'],
        ['Created', coupon.created_at.slice(0, 10)],
        ['Last Updated', coupon.updated_at.slice(0, 10)],
    ] as [string, string][];

    return (
        <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
                {/* Stats grid */}
                <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {details.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="rounded-xl border bg-card p-4">
                            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                                <Icon className="size-4 shrink-0" />
                                <span className="text-xs font-medium">{label}</span>
                            </div>
                            <p className="truncate text-sm font-semibold">{value}</p>
                        </div>
                    ))}
                </section>

                {/* Constraints */}
                <section>
                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                        Constraints &amp; Notes
                    </h3>
                    <dl className="space-y-2">
                        {constraints.map(([label, value]) => (
                            <div key={label} className="flex justify-between gap-4 rounded-lg bg-muted/40 px-3 py-2 text-sm">
                                <dt className="shrink-0 font-medium text-muted-foreground">
                                    {label}
                                </dt>
                                <dd className="text-right text-foreground break-all">{value}</dd>
                            </div>
                        ))}
                    </dl>
                </section>
            </div>
        </div>
    );
}

export default function Coupons({ coupons, discountTypeOptions, filters }: Props) {
    const can = useCan();
    const [search, setSearch] = useState(filters.search);
    const [isLoading, setIsLoading] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [viewingCoupon, setViewingCoupon] = useState<Coupon | null>(null);
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
    const [processingAction, setProcessingAction] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    useEffect(() => {
        setSearch(filters.search);
    }, [filters.search]);

    const visitCoupons = useCallback(
        (changes: Partial<CouponFilters>, resetPage = true) => {
            const nextFilters = {
                ...filters,
                ...changes,
                page: resetPage ? 1 : (changes.page ?? filters.page),
            };

            const query = Object.fromEntries(
                Object.entries(nextFilters).filter(
                    ([, value]) => value !== '' && value !== '__all__',
                ),
            );

            setIsLoading(true);
            router.get(
                index.url({ query }),
                {},
                {
                    only: ['coupons', 'filters'],
                    preserveState: true,
                    preserveScroll: true,
                    preserveErrors: true,
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

        const timeout = window.setTimeout(
            () => visitCoupons({ search }),
            300,
        );

        return () => window.clearTimeout(timeout);
    }, [filters.search, search, visitCoupons]);

    const submitAction = () => {
        if (pendingAction === null) {
            return;
        }

        setProcessingAction(true);
        setActionError(null);

        const options = {
            only: ['coupons', 'filters'] as string[],
            preserveScroll: true,
            onSuccess: () => setPendingAction(null),
            onError: (errors: Record<string, string>) => {
                setActionError(
                    errors.ids ?? errors.coupon ?? 'Unable to perform action on coupons.',
                );
            },
            onFinish: () => setProcessingAction(false),
        };

        if (pendingAction.action === 'delete') {
            if (pendingAction.ids.length === 1) {
                const coupon = coupons?.data.find((c) => c.id === pendingAction.ids[0]);
                if (!coupon) {
                    setActionError('The selected coupon is no longer available.');
                    setProcessingAction(false);
                    return;
                }
                router.delete(destroy.url(coupon.id), options);
            } else {
                router.delete(bulkDestroy.url(), {
                    data: { ids: pendingAction.ids },
                    ...options,
                });
            }
            return;
        }

        if (pendingAction.action === 'restore') {
            if (pendingAction.ids.length === 1) {
                const coupon = coupons?.data.find((c) => c.id === pendingAction.ids[0]);
                if (!coupon) {
                    setActionError('The selected coupon is no longer available.');
                    setProcessingAction(false);
                    return;
                }
                router.post(restore.url(coupon.id), {}, options);
            } else {
                router.post(bulkRestore.url(), { ids: pendingAction.ids }, options);
            }
            return;
        }

        // force-delete
        if (pendingAction.ids.length === 1) {
            const coupon = coupons?.data.find((c) => c.id === pendingAction.ids[0]);
            if (!coupon) {
                setActionError('The selected coupon is no longer available.');
                setProcessingAction(false);
                return;
            }
            router.delete(forceDelete.url(coupon.id), options);
        } else {
            router.delete(bulkForceDelete.url(), {
                data: { ids: pendingAction.ids },
                ...options,
            });
        }
    };

    const columns = useMemo<DataTableColumnDef<Coupon>[]>(
        () => [
            {
                id: 'select',
                header: ({ table }) => {
                    const rows = table.getRowModel().rows;
                    const selectedCount = rows.filter((row) => row.getIsSelected()).length;

                    return (
                        <Checkbox
                            aria-label="Select all coupons on this page"
                            disabled={!can('coupons.delete')}
                            checked={rows.length > 0 && selectedCount === rows.length}
                            indeterminate={selectedCount > 0 && selectedCount < rows.length}
                            onCheckedChange={(checked) =>
                                rows.forEach((row) => row.toggleSelected(checked === true))
                            }
                        />
                    );
                },
                cell: ({ row }) => (
                    <Checkbox
                        aria-label={`Select coupon ${row.original.code}`}
                        checked={row.getIsSelected()}
                        disabled={!can('coupons.delete')}
                        onCheckedChange={(checked) => row.toggleSelected(checked === true)}
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: 'code',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Code" />
                ),
                cell: ({ row }) => (
                    <div className="min-w-0">
                        <p className="font-mono font-semibold tracking-wide">
                            {row.original.code}
                        </p>
                        {row.original.description && (
                            <p className="truncate text-xs text-muted-foreground max-w-48">
                                {row.original.description}
                            </p>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: 'discount_type',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Type" />
                ),
                cell: ({ row }) => (
                    <span className="rounded-md border bg-muted/50 px-2 py-0.5 text-xs font-medium">
                        {row.original.discount_type_label}
                    </span>
                ),
            },
            {
                accessorKey: 'discount_value',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Value" />
                ),
                cell: ({ row }) =>
                    row.original.discount_type === 'percentage'
                        ? `${row.original.discount_value}%`
                        : `$${row.original.discount_value}`,
            },
            {
                accessorKey: 'times_used',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Used" />
                ),
                cell: ({ row }) =>
                    row.original.usage_limit
                        ? `${row.original.times_used} / ${row.original.usage_limit}`
                        : row.original.times_used,
            },
            {
                accessorKey: 'expires_at',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Expires" />
                ),
                cell: ({ row }) => {
                    const date = row.original.expires_at;
                    if (!date) {
                        return <span className="text-muted-foreground">Never</span>;
                    }
                    const isExpired = new Date(date) < new Date();
                    return (
                        <span className={isExpired ? 'text-destructive' : undefined}>
                            {date.slice(0, 10)}
                        </span>
                    );
                },
            },
            {
                accessorKey: 'is_active',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Status" />
                ),
                cell: ({ row }) =>
                    row.original.deleted_at ? (
                        <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                            Deleted
                        </span>
                    ) : (
                        <span
                            className={
                                row.original.is_active
                                    ? 'rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary'
                                    : 'rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground'
                            }
                        >
                            {row.original.is_active ? 'Active' : 'Inactive'}
                        </span>
                    ),
            },
            {
                accessorKey: 'created_at',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Created" />
                ),
                cell: ({ row }) => row.original.created_at.slice(0, 10),
            },
            {
                id: 'actions',
                enableHiding: false,
                cell: ({ row }) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Actions for ${row.original.code}`}
                                >
                                    <MoreHorizontal />
                                </Button>
                            }
                        />
                        <DropdownMenuContent align="end" className="w-full">
                            <DropdownMenuItem
                                onClick={() => setViewingCoupon(row.original)}
                            >
                                View details
                            </DropdownMenuItem>
                            {filters.status === 'active' ? (
                                <>
                                    {can('coupons.update') && (
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setEditingCoupon(row.original);
                                                setFormOpen(true);
                                            }}
                                        >
                                            <PenIcon />
                                            Edit coupon
                                        </DropdownMenuItem>
                                    )}
                                    {can('coupons.delete') && (
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={() =>
                                                setPendingAction({
                                                    action: 'delete',
                                                    ids: [row.original.id],
                                                    label: row.original.code,
                                                })
                                            }
                                        >
                                            <Trash2 />
                                            Move to trash
                                        </DropdownMenuItem>
                                    )}
                                </>
                            ) : (
                                can('coupons.delete') && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                setPendingAction({
                                                    action: 'restore',
                                                    ids: [row.original.id],
                                                    label: row.original.code,
                                                })
                                            }
                                        >
                                            Restore coupon
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={() =>
                                                setPendingAction({
                                                    action: 'force-delete',
                                                    ids: [row.original.id],
                                                    label: row.original.code,
                                                })
                                            }
                                        >
                                            <Trash2 />
                                            Delete permanently
                                        </DropdownMenuItem>
                                    </>
                                )
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [can, filters.status],
    );

    const sorting: SortingState = [
        { id: filters.sort, desc: filters.direction === 'desc' },
    ];
    const pagination: PaginationState = {
        pageIndex: (coupons?.current_page ?? filters.page) - 1,
        pageSize: coupons?.per_page ?? filters.per_page,
    };

    const formRoute = editingCoupon ? update(editingCoupon.id) : store();

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title="Coupons" />

            <div className="flex flex-wrap items-start justify-between gap-4">
                <Heading
                    variant="small"
                    title="Coupons"
                    description="Create and manage discount coupons for your store."
                />
                {can('coupons.create') && (
                    <Button
                        onClick={() => {
                            setEditingCoupon(null);
                            setFormOpen(true);
                        }}
                    >
                        <Plus />
                        Create coupon
                    </Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={coupons?.data ?? []}
                getRowId={(coupon) => String(coupon.id)}
                selectionResetKey={JSON.stringify(filters)}
                manualFiltering
                manualSorting
                manualPagination
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search by code or description..."
                sorting={sorting}
                onSortingChange={(next) => {
                    const value = typeof next === 'function' ? next(sorting) : next;
                    visitCoupons({
                        sort: value[0]?.id ?? 'created_at',
                        direction: value[0]?.desc ? 'desc' : 'asc',
                    });
                }}
                pagination={pagination}
                onPaginationChange={(next) => {
                    const value = typeof next === 'function' ? next(pagination) : next;
                    visitCoupons(
                        {
                            page: value.pageIndex + 1,
                            per_page: value.pageSize,
                        },
                        false,
                    );
                }}
                pageCount={coupons?.last_page ?? 0}
                totalRows={coupons?.total ?? 0}
                initialPageSize={coupons?.per_page ?? filters.per_page}
                pageSizeOptions={[10, 20, 50, 100]}
                isLoading={isLoading || coupons === undefined}
                emptyTitle={
                    filters.status === 'deleted'
                        ? 'The coupon trash is empty'
                        : 'No coupons found'
                }
                emptyDescription={
                    filters.search
                        ? 'Try adjusting the search or filter.'
                        : filters.status === 'deleted'
                          ? 'Deleted coupons will appear here.'
                          : 'Create a coupon to offer discounts at checkout.'
                }
                toolbarFilters={() => (
                    <div className="flex flex-wrap gap-2">
                        <Select
                            items={[
                                { value: '__all__', label: 'All types' },
                                ...discountTypeOptions,
                            ]}
                            value={filters.discount_type || '__all__'}
                            onValueChange={(value) =>
                                visitCoupons({ discount_type: value })
                            }
                        >
                            <SelectTrigger
                                className="min-w-40"
                                aria-label="Filter by discount type"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">All types</SelectItem>
                                {discountTypeOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            items={[
                                { value: 'active', label: 'Active coupons' },
                                { value: 'deleted', label: 'Trash' },
                            ]}
                            value={filters.status}
                            onValueChange={(value) => {
                                if (value === 'active' || value === 'deleted') {
                                    visitCoupons({ status: value });
                                }
                            }}
                        >
                            <SelectTrigger
                                className="min-w-44"
                                aria-label="Filter coupon status"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active coupons</SelectItem>
                                <SelectItem value="deleted">Trash</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
                batchActions={
                    can('coupons.delete')
                        ? (_table, selectedCoupons) => (
                              <div className="flex gap-2">
                                  {filters.status === 'active' ? (
                                      <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() =>
                                              setPendingAction({
                                                  action: 'delete',
                                                  ids: selectedCoupons.map((c) => c.id),
                                                  label: `${selectedCoupons.length} selected coupons`,
                                              })
                                          }
                                      >
                                          <Trash2 />
                                          Move selected to trash
                                      </Button>
                                  ) : (
                                      <>
                                          <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                  setPendingAction({
                                                      action: 'restore',
                                                      ids: selectedCoupons.map((c) => c.id),
                                                      label: `${selectedCoupons.length} selected coupons`,
                                                  })
                                              }
                                          >
                                              Restore selected
                                          </Button>
                                          <Button
                                              variant="destructive"
                                              size="sm"
                                              onClick={() =>
                                                  setPendingAction({
                                                      action: 'force-delete',
                                                      ids: selectedCoupons.map((c) => c.id),
                                                      label: `${selectedCoupons.length} selected coupons`,
                                                  })
                                              }
                                          >
                                              <Trash2 />
                                              Delete permanently
                                          </Button>
                                      </>
                                  )}
                              </div>
                          )
                        : undefined
                }
            />

            {/* Create / Edit Form Dialog */}
            <Form
                key={editingCoupon?.id ?? 'new-coupon'}
                action={formRoute}
                options={{
                    only: ['coupons', 'filters'],
                    preserveScroll: true,
                }}
                onSuccess={() => {
                    setFormOpen(false);
                    setEditingCoupon(null);
                }}
            >
                {({ processing, errors }) => (
                    <FormDialog
                        open={formOpen}
                        onOpenChange={setFormOpen}
                        name={editingCoupon ? 'Edit coupon' : 'Create coupon'}
                        width="w-full max-w-2xl"
                        height="h-[90vh] max-h-[52rem]"
                        processing={processing}
                    >
                        <CouponForm
                            coupon={editingCoupon}
                            discountTypeOptions={discountTypeOptions}
                            errors={errors}
                        />
                    </FormDialog>
                )}
            </Form>

            {/* View Details Sheet */}
            <Sheet
                open={viewingCoupon !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setViewingCoupon(null);
                    }
                }}
            >
                <SheetContent className="w-full gap-0 overflow-hidden p-0 sm:max-w-xl">
                    {viewingCoupon && (
                        <>
                            <SheetHeader className="shrink-0 border-b px-6 py-5">
                                <div className="space-y-3 pr-8">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 space-y-1">
                                            <SheetTitle className="truncate font-mono text-lg tracking-widest">
                                                {viewingCoupon.code}
                                            </SheetTitle>
                                            <p className="text-xs text-muted-foreground">
                                                {viewingCoupon.discount_type_label} coupon
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 flex-wrap justify-end gap-2">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    viewingCoupon.deleted_at
                                                        ? 'bg-destructive/10 text-destructive'
                                                        : viewingCoupon.is_active
                                                          ? 'bg-primary/10 text-primary'
                                                          : 'bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                {viewingCoupon.deleted_at
                                                    ? 'In trash'
                                                    : viewingCoupon.is_active
                                                      ? 'Active'
                                                      : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </SheetHeader>
                            <CouponDetails coupon={viewingCoupon} />
                        </>
                    )}
                </SheetContent>
            </Sheet>

            {/* Confirm Action Dialog */}
            <AlertDialog
                open={pendingAction !== null}
                onOpenChange={(open) => {
                    if (!open && !processingAction) {
                        setPendingAction(null);
                        setActionError(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {pendingAction?.action === 'delete'
                                ? 'Move coupons to trash?'
                                : pendingAction?.action === 'restore'
                                  ? 'Restore coupons?'
                                  : 'Permanently delete coupons?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionError ??
                                (pendingAction?.action === 'delete'
                                    ? `${pendingAction?.label} will be moved to trash and can be restored later.`
                                    : pendingAction?.action === 'restore'
                                      ? `${pendingAction?.label} will be restored and made available again.`
                                      : `${pendingAction?.label} will be permanently deleted. This cannot be undone.`)}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processingAction}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={processingAction}
                            onClick={submitAction}
                        >
                            {processingAction
                                ? 'Working...'
                                : pendingAction?.action === 'delete'
                                  ? 'Move to trash'
                                  : pendingAction?.action === 'restore'
                                    ? 'Restore'
                                    : 'Delete permanently'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

Coupons.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Coupons', href: '/dashboard/coupons' },
    ],
};
