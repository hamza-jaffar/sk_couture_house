import {
    bulkDestroy,
    bulkForceDelete,
    bulkRestore,
    bulkStatus,
    destroy,
    forceDelete,
    index,
    respond,
    restore,
    updateStatus,
} from '@/actions/Modules/Review/Http/Controllers/ReviewController';
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
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
    PaginatedReviews,
    ProductReview,
    ReviewFilters,
    ReviewStatus,
    ReviewStatusOption,
} from '@/types';
import { Deferred, Form, Head, router } from '@inertiajs/react';
import type { PaginationState, SortingState } from '@tanstack/table-core';
import {
    ArchiveRestore,
    CalendarDays,
    CheckCircle2,
    Eye,
    MessageSquare,
    MessageSquareReply,
    MoreHorizontal,
    Package,
    Star,
    Trash2,
    User,
    XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Props = {
    reviews?: PaginatedReviews;
    statusOptions: ReviewStatusOption[];
    filters: ReviewFilters;
};

type PendingAction = {
    action: 'delete' | 'restore' | 'force-delete' | 'status' | 'bulk-status';
    ids: number[];
    status?: ReviewStatus;
    label: string;
};

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`size-3.5 ${
                        star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-muted text-muted-foreground/30'
                    }`}
                />
            ))}
        </div>
    );
}

function StatusBadge({ status, deletedAt }: { status: ReviewStatus; deletedAt?: string | null }) {
    if (deletedAt) {
        return (
            <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
                In trash
            </span>
        );
    }

    switch (status) {
        case 'approved':
            return (
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Approved
                </span>
            );
        case 'rejected':
            return (
                <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                    Rejected
                </span>
            );
        default:
            return (
                <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                    Pending
                </span>
            );
    }
}

function ReviewDetails({ review }: { review: ProductReview }) {
    return (
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Product & Rating Header */}
            <div className="rounded-xl border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <Package className="size-3.5" />
                            <span>Product</span>
                        </div>
                        <h4 className="font-semibold text-base leading-snug">
                            {review.product?.title ?? 'Product'}
                        </h4>
                    </div>
                    <div className="text-right shrink-0">
                        <StarRating rating={review.rating} />
                        <span className="text-xs text-muted-foreground mt-1 inline-block">
                            {review.rating} out of 5
                        </span>
                    </div>
                </div>

                <div className="border-t pt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <User className="size-3.5" />
                        <span className="font-medium text-foreground">{review.reviewer_display_name}</span>
                        {review.reviewer_display_email && (
                            <span className="text-muted-foreground">({review.reviewer_display_email})</span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <CalendarDays className="size-3.5" />
                        <span>{review.created_at.slice(0, 10)}</span>
                    </div>
                </div>
            </div>

            {/* Review Body */}
            <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Review Content
                </h4>
                {review.title && (
                    <h5 className="font-semibold text-foreground text-sm">
                        {review.title}
                    </h5>
                )}
                <div className="rounded-lg bg-muted/40 p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap border">
                    {review.comment}
                </div>
            </div>

            {/* Admin Response Section */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <MessageSquareReply className="size-3.5 text-primary" />
                        Store Response
                    </h4>
                    {review.responded_at && (
                        <span className="text-xs text-muted-foreground">
                            Responded on {review.responded_at.slice(0, 10)}
                            {review.responder?.name && ` by ${review.responder.name}`}
                        </span>
                    )}
                </div>

                {review.admin_response ? (
                    <div className="rounded-lg border-l-4 border-l-primary bg-primary/5 p-4 text-sm text-foreground whitespace-pre-wrap">
                        {review.admin_response}
                    </div>
                ) : (
                    <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                        No store response provided yet. Use the action menu to respond.
                    </p>
                )}
            </div>
        </div>
    );
}

export default function Reviews({ reviews, statusOptions, filters }: Props) {
    const can = useCan();
    const [search, setSearch] = useState(filters.search);
    const [isLoading, setIsLoading] = useState(false);
    const [viewingReview, setViewingReview] = useState<ProductReview | null>(null);
    const [respondingReview, setRespondingReview] = useState<ProductReview | null>(null);
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
    const [processingAction, setProcessingAction] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    useEffect(() => {
        setSearch(filters.search);
    }, [filters.search]);

    const visitReviews = useCallback(
        (changes: Partial<ReviewFilters>, resetPage = true) => {
            const nextFilters = {
                ...filters,
                ...changes,
                page: resetPage ? 1 : (changes.page ?? filters.page),
            };

            const query = Object.fromEntries(
                Object.entries(nextFilters).filter(
                    ([, value]) => value !== '' && value !== 'all',
                ),
            );

            setIsLoading(true);
            router.get(
                index.url({ query }),
                {},
                {
                    only: ['reviews', 'filters'],
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
            () => visitReviews({ search }),
            300,
        );

        return () => window.clearTimeout(timeout);
    }, [filters.search, search, visitReviews]);

    const submitAction = () => {
        if (pendingAction === null) {
            return;
        }

        setProcessingAction(true);
        setActionError(null);

        const options = {
            only: ['reviews', 'filters'] as string[],
            preserveScroll: true,
            onSuccess: () => setPendingAction(null),
            onError: (errors: Record<string, string>) => {
                setActionError(
                    errors.ids ?? errors.status ?? errors.review ?? 'Unable to perform this action.',
                );
            },
            onFinish: () => setProcessingAction(false),
        };

        if (pendingAction.action === 'status') {
            const reviewId = pendingAction.ids[0];
            router.patch(
                updateStatus.url(reviewId),
                { status: pendingAction.status },
                options,
            );
            return;
        }

        if (pendingAction.action === 'bulk-status') {
            router.post(
                bulkStatus.url(),
                {
                    ids: pendingAction.ids,
                    status: pendingAction.status,
                },
                options,
            );
            return;
        }

        if (pendingAction.action === 'delete') {
            if (pendingAction.ids.length === 1) {
                router.delete(destroy.url(pendingAction.ids[0]), options);
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
                router.post(restore.url(pendingAction.ids[0]), {}, options);
            } else {
                router.post(bulkRestore.url(), { ids: pendingAction.ids }, options);
            }
            return;
        }

        // force-delete
        if (pendingAction.ids.length === 1) {
            router.delete(forceDelete.url(pendingAction.ids[0]), options);
        } else {
            router.delete(bulkForceDelete.url(), {
                data: { ids: pendingAction.ids },
                ...options,
            });
        }
    };

    const columns = useMemo<DataTableColumnDef<ProductReview>[]>(
        () => [
            {
                id: 'select',
                header: ({ table }) => {
                    const rows = table.getRowModel().rows;
                    const selectedCount = rows.filter((row) => row.getIsSelected()).length;

                    return (
                        <Checkbox
                            aria-label="Select all reviews on this page"
                            disabled={!can('reviews.delete') && !can('reviews.approve')}
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
                        aria-label={`Select review by ${row.original.reviewer_display_name}`}
                        checked={row.getIsSelected()}
                        disabled={!can('reviews.delete') && !can('reviews.approve')}
                        onCheckedChange={(checked) => row.toggleSelected(checked === true)}
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: 'product',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Product" />
                ),
                cell: ({ row }) => (
                    <div className="min-w-0 max-w-48">
                        <p className="font-medium truncate">{row.original.product?.title ?? 'Product'}</p>
                        <p className="text-xs text-muted-foreground truncate">
                            by {row.original.reviewer_display_name}
                        </p>
                    </div>
                ),
                enableSorting: false,
            },
            {
                accessorKey: 'rating',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Rating" />
                ),
                cell: ({ row }) => <StarRating rating={row.original.rating} />,
            },
            {
                accessorKey: 'comment',
                header: 'Review',
                cell: ({ row }) => (
                    <div className="min-w-0 max-w-xs sm:max-w-md">
                        {row.original.title && (
                            <p className="font-semibold text-xs truncate text-foreground">
                                {row.original.title}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground line-clamp-2">
                            {row.original.comment}
                        </p>
                        {row.original.admin_response && (
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-primary">
                                <MessageSquareReply className="size-3 shrink-0" />
                                <span className="truncate">Responded</span>
                            </div>
                        )}
                    </div>
                ),
                enableSorting: false,
            },
            {
                accessorKey: 'status',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Status" />
                ),
                cell: ({ row }) => (
                    <StatusBadge
                        status={row.original.status}
                        deletedAt={row.original.deleted_at}
                    />
                ),
            },
            {
                accessorKey: 'created_at',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Date" />
                ),
                cell: ({ row }) => row.original.created_at.slice(0, 10),
            },
            {
                id: 'actions',
                enableHiding: false,
                cell: ({ row }) => {
                    const review = row.original;

                    return (
                        <div className="flex justify-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Actions for review by ${review.reviewer_display_name}`}
                                        >
                                            <MoreHorizontal className="size-4" />
                                        </Button>
                                    }
                                />
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => setViewingReview(review)}>
                                        <Eye />
                                        View details
                                    </DropdownMenuItem>

                                    {review.deleted_at ? (
                                        can('reviews.delete') && (
                                            <>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        setPendingAction({
                                                            action: 'restore',
                                                            ids: [review.id],
                                                            label: `Review by ${review.reviewer_display_name}`,
                                                        })
                                                    }
                                                >
                                                    <ArchiveRestore />
                                                    Restore review
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    variant="destructive"
                                                    onClick={() =>
                                                        setPendingAction({
                                                            action: 'force-delete',
                                                            ids: [review.id],
                                                            label: `Review by ${review.reviewer_display_name}`,
                                                        })
                                                    }
                                                >
                                                    <Trash2 />
                                                    Delete permanently
                                                </DropdownMenuItem>
                                            </>
                                        )
                                    ) : (
                                        <>
                                            {can('reviews.approve') && (
                                                <>
                                                    <DropdownMenuItem
                                                        onClick={() => setRespondingReview(review)}
                                                    >
                                                        <MessageSquareReply />
                                                        {review.admin_response ? 'Edit response' : 'Respond'}
                                                    </DropdownMenuItem>

                                                    {review.status !== 'approved' && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setPendingAction({
                                                                    action: 'status',
                                                                    ids: [review.id],
                                                                    status: 'approved',
                                                                    label: `Approve review by ${review.reviewer_display_name}?`,
                                                                })
                                                            }
                                                        >
                                                            <CheckCircle2 className="text-emerald-500" />
                                                            Approve review
                                                        </DropdownMenuItem>
                                                    )}

                                                    {review.status !== 'rejected' && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                setPendingAction({
                                                                    action: 'status',
                                                                    ids: [review.id],
                                                                    status: 'rejected',
                                                                    label: `Reject review by ${review.reviewer_display_name}?`,
                                                                })
                                                            }
                                                        >
                                                            <XCircle className="text-rose-500" />
                                                            Reject review
                                                        </DropdownMenuItem>
                                                    )}
                                                </>
                                            )}

                                            {can('reviews.delete') && (
                                                <>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        variant="destructive"
                                                        onClick={() =>
                                                            setPendingAction({
                                                                action: 'delete',
                                                                ids: [review.id],
                                                                label: `Review by ${review.reviewer_display_name}`,
                                                            })
                                                        }
                                                    >
                                                        <Trash2 />
                                                        Move to trash
                                                    </DropdownMenuItem>
                                                </>
                                            )}
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

    const sorting: SortingState = [
        { id: filters.sort, desc: filters.direction === 'desc' },
    ];
    const pagination: PaginationState = {
        pageIndex: (reviews?.current_page ?? filters.page) - 1,
        pageSize: reviews?.per_page ?? filters.per_page,
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title="Product Reviews" />

            <div className="flex flex-wrap items-start justify-between gap-4">
                <Heading
                    variant="small"
                    title="Product Reviews"
                    description="Moderate customer product ratings, feedback, and responses."
                />
            </div>

            <DataTable
                columns={columns}
                data={reviews?.data ?? []}
                getRowId={(review) => String(review.id)}
                selectionResetKey={JSON.stringify(filters)}
                manualFiltering
                manualSorting
                manualPagination
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search product, author, review..."
                sorting={sorting}
                onSortingChange={(next) => {
                    const value = typeof next === 'function' ? next(sorting) : next;
                    visitReviews({
                        sort: value[0]?.id ?? 'created_at',
                        direction: value[0]?.desc ? 'desc' : 'asc',
                    });
                }}
                pagination={pagination}
                onPaginationChange={(next) => {
                    const value = typeof next === 'function' ? next(pagination) : next;
                    visitReviews(
                        {
                            page: value.pageIndex + 1,
                            per_page: value.pageSize,
                        },
                        false,
                    );
                }}
                pageCount={reviews?.last_page ?? 0}
                totalRows={reviews?.total ?? 0}
                initialPageSize={reviews?.per_page ?? filters.per_page}
                pageSizeOptions={[10, 20, 50, 100]}
                isLoading={isLoading || reviews === undefined}
                emptyTitle={
                    filters.status === 'deleted'
                        ? 'The review trash is empty'
                        : 'No product reviews found'
                }
                emptyDescription={
                    filters.search
                        ? 'Try adjusting your search or filters.'
                        : filters.status === 'deleted'
                          ? 'Deleted reviews will appear here.'
                          : 'Customer reviews will appear here once submitted.'
                }
                toolbarFilters={() => (
                    <div className="flex flex-wrap gap-2">
                        {/* Status Filter */}
                        <Select
                            items={[
                                { value: 'all', label: 'All reviews' },
                                { value: 'pending', label: 'Pending approval' },
                                { value: 'approved', label: 'Approved' },
                                { value: 'rejected', label: 'Rejected' },
                                { value: 'deleted', label: 'Trash' },
                            ]}
                            value={filters.status || 'all'}
                            onValueChange={(value) => visitReviews({ status: value })}
                        >
                            <SelectTrigger className="min-w-44" aria-label="Filter by status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All reviews</SelectItem>
                                <SelectItem value="pending">Pending approval</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="deleted">Trash</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Rating Filter */}
                        <Select
                            items={[
                                { value: 'all', label: 'All ratings' },
                                { value: '5', label: '5 Stars' },
                                { value: '4', label: '4 Stars' },
                                { value: '3', label: '3 Stars' },
                                { value: '2', label: '2 Stars' },
                                { value: '1', label: '1 Star' },
                            ]}
                            value={String(filters.rating || 'all')}
                            onValueChange={(value) => visitReviews({ rating: value })}
                        >
                            <SelectTrigger className="min-w-36" aria-label="Filter by rating">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All ratings</SelectItem>
                                <SelectItem value="5">5 Stars</SelectItem>
                                <SelectItem value="4">4 Stars</SelectItem>
                                <SelectItem value="3">3 Stars</SelectItem>
                                <SelectItem value="2">2 Stars</SelectItem>
                                <SelectItem value="1">1 Star</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
                batchActions={
                    (_table, selectedReviews) => (
                        <div className="flex flex-wrap gap-2">
                            {filters.status !== 'deleted' ? (
                                <>
                                    {can('reviews.approve') && (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setPendingAction({
                                                        action: 'bulk-status',
                                                        status: 'approved',
                                                        ids: selectedReviews.map((r) => r.id),
                                                        label: `Approve ${selectedReviews.length} selected reviews?`,
                                                    })
                                                }
                                            >
                                                <CheckCircle2 className="text-emerald-500" />
                                                Approve selected
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setPendingAction({
                                                        action: 'bulk-status',
                                                        status: 'rejected',
                                                        ids: selectedReviews.map((r) => r.id),
                                                        label: `Reject ${selectedReviews.length} selected reviews?`,
                                                    })
                                                }
                                            >
                                                <XCircle className="text-rose-500" />
                                                Reject selected
                                            </Button>
                                        </>
                                    )}

                                    {can('reviews.delete') && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                setPendingAction({
                                                    action: 'delete',
                                                    ids: selectedReviews.map((r) => r.id),
                                                    label: `${selectedReviews.length} selected reviews`,
                                                })
                                            }
                                        >
                                            <Trash2 />
                                            Move selected to trash
                                        </Button>
                                    )}
                                </>
                            ) : (
                                can('reviews.delete') && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setPendingAction({
                                                    action: 'restore',
                                                    ids: selectedReviews.map((r) => r.id),
                                                    label: `${selectedReviews.length} selected reviews`,
                                                })
                                            }
                                        >
                                            <ArchiveRestore />
                                            Restore selected
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                setPendingAction({
                                                    action: 'force-delete',
                                                    ids: selectedReviews.map((r) => r.id),
                                                    label: `${selectedReviews.length} selected reviews`,
                                                })
                                            }
                                        >
                                            <Trash2 />
                                            Delete permanently
                                        </Button>
                                    </>
                                )
                            )}
                        </div>
                    )
                }
            />

            {/* Admin Response Form Dialog */}
            {respondingReview && (
                <Form
                    action={respond(respondingReview.id)}
                    options={{
                        only: ['reviews', 'filters'],
                        preserveScroll: true,
                    }}
                    onSuccess={() => setRespondingReview(null)}
                >
                    {({ processing, errors }) => (
                        <FormDialog
                            open={respondingReview !== null}
                            onOpenChange={(open) => !open && setRespondingReview(null)}
                            name="Respond to Customer Review"
                            width="w-full max-w-xl"
                            processing={processing}
                        >
                            <div className="space-y-4">
                                {/* Customer Review Recap */}
                                <div className="rounded-lg bg-muted/50 p-3 space-y-1.5 border text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-foreground">
                                            {respondingReview.product?.title}
                                        </span>
                                        <StarRating rating={respondingReview.rating} />
                                    </div>
                                    <p className="text-muted-foreground italic line-clamp-3">
                                        &ldquo;{respondingReview.comment}&rdquo;
                                    </p>
                                    <p className="text-muted-foreground">
                                        — {respondingReview.reviewer_display_name}
                                    </p>
                                </div>

                                {/* Response Field */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="admin-response-input">
                                        Store Response <span className="text-destructive">*</span>
                                    </Label>
                                    <textarea
                                        id="admin-response-input"
                                        name="response"
                                        rows={4}
                                        maxLength={2000}
                                        defaultValue={respondingReview.admin_response ?? ''}
                                        placeholder="Write an empathetic and helpful public response..."
                                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                                        autoFocus
                                        required
                                    />
                                    {errors.response && (
                                        <p className="text-xs text-destructive">{errors.response}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        This response will be visible publicly under the customer&apos;s review.
                                    </p>
                                </div>
                            </div>
                        </FormDialog>
                    )}
                </Form>
            )}

            {/* View Details Sheet */}
            <Sheet
                open={viewingReview !== null}
                onOpenChange={(open) => !open && setViewingReview(null)}
            >
                <SheetContent className="w-full gap-0 overflow-hidden p-0 sm:max-w-xl">
                    {viewingReview && (
                        <>
                            <SheetHeader className="shrink-0 border-b px-6 py-5">
                                <div className="space-y-2 pr-8">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 space-y-1">
                                            <SheetTitle className="truncate text-lg">
                                                Review Details
                                            </SheetTitle>
                                            <p className="text-xs text-muted-foreground">
                                                Submitted on {viewingReview.created_at.slice(0, 10)}
                                            </p>
                                        </div>
                                        <div className="shrink-0">
                                            <StatusBadge
                                                status={viewingReview.status}
                                                deletedAt={viewingReview.deleted_at}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </SheetHeader>
                            <ReviewDetails review={viewingReview} />
                        </>
                    )}
                </SheetContent>
            </Sheet>

            {/* Action Confirmation AlertDialog */}
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
                                ? 'Move reviews to trash?'
                                : pendingAction?.action === 'restore'
                                  ? 'Restore reviews?'
                                  : pendingAction?.action === 'force-delete'
                                    ? 'Permanently delete reviews?'
                                    : 'Update review status?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionError ??
                                (pendingAction?.action === 'delete'
                                    ? `${pendingAction?.label} will be moved to trash and can be restored later.`
                                    : pendingAction?.action === 'restore'
                                      ? `${pendingAction?.label} will be restored.`
                                      : pendingAction?.action === 'force-delete'
                                        ? `${pendingAction?.label} will be permanently deleted. This cannot be undone.`
                                        : `${pendingAction?.label}`)}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processingAction}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            variant={
                                pendingAction?.action === 'delete' || pendingAction?.action === 'force-delete'
                                    ? 'destructive'
                                    : 'default'
                            }
                            disabled={processingAction}
                            onClick={submitAction}
                        >
                            {processingAction
                                ? 'Working...'
                                : pendingAction?.action === 'delete'
                                  ? 'Move to trash'
                                  : pendingAction?.action === 'restore'
                                    ? 'Restore'
                                    : pendingAction?.action === 'force-delete'
                                      ? 'Delete permanently'
                                      : 'Confirm'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

Reviews.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Product Reviews', href: '/dashboard/reviews' },
    ],
};
