import {
    bulkDestroy,
    destroy,
    exportMethod,
    index,
    toggleStatus,
} from "@/actions/Modules/Newsletter/Http/Controllers/NewsletterController";
import {
    DataTable,
    DataTableColumnHeader,
    type DataTableColumnDef,
} from "@/components/data-table";
import Heading from "@/components/heading";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCan } from "@/hooks/use-can";
import type {
    NewsletterFilters,
    NewsletterSubscriber,
    PaginatedSubscribers,
} from "@/types";
import { Head, router } from "@inertiajs/react";
import type { PaginationState, SortingState } from "@tanstack/table-core";
import {
    Download,
    Mail,
    MoreHorizontal,
    RefreshCw,
    Trash2,
    UserCheck,
    UserX,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

type Props = {
    subscribers?: PaginatedSubscribers;
    filters: NewsletterFilters;
};

export default function SubscribersPage({ subscribers, filters }: Props) {
    const can = useCan();
    const canDelete = can("newsletter.delete");
    const canExport = can("newsletter.export");

    const [search, setSearch] = useState(filters.search ?? "");
    const [statusFilter, setStatusFilter] = useState<
        NewsletterFilters["status"]
    >(filters.status ?? "all");
    const [pendingDeleteIds, setPendingDeleteIds] = useState<number[] | null>(
        null,
    );

    // TanStack table state
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: (filters.page ?? 1) - 1,
        pageSize: filters.per_page ?? 15,
    });

    const [sorting, setSorting] = useState<SortingState>([
        {
            id: filters.sort ?? "created_at",
            desc: filters.direction !== "asc",
        },
    ]);

    // Apply Filter Navigation
    const applyFilters = useCallback(
        (overrides: Partial<NewsletterFilters> = {}) => {
            const next: Record<string, any> = {
                search:
                    overrides.search !== undefined ? overrides.search : search,
                status:
                    overrides.status !== undefined
                        ? overrides.status
                        : statusFilter,
                sort:
                    overrides.sort !== undefined
                        ? overrides.sort
                        : (sorting[0]?.id ?? "created_at"),
                direction:
                    overrides.direction !== undefined
                        ? overrides.direction
                        : sorting[0]?.desc
                          ? "desc"
                          : "asc",
                page:
                    overrides.page !== undefined
                        ? overrides.page
                        : pageIndex + 1,
                per_page:
                    overrides.per_page !== undefined
                        ? overrides.per_page
                        : pageSize,
            };

            // Drop empty values
            Object.keys(next).forEach((key) => {
                if (
                    next[key] === "" ||
                    next[key] === "all" ||
                    next[key] === undefined
                ) {
                    delete next[key];
                }
            });

            router.get(index.url(), next, {
                preserveState: true,
                preserveScroll: true,
            });
        },
        [search, statusFilter, sorting, pageIndex, pageSize],
    );

    const handleConfirmDelete = () => {
        if (!pendingDeleteIds) return;

        if (pendingDeleteIds.length === 1) {
            router.delete(destroy.url({ subscriber: pendingDeleteIds[0] }), {
                preserveScroll: true,
                onSuccess: () => {
                    setPendingDeleteIds(null);
                },
            });
        } else {
            router.delete(bulkDestroy.url(), {
                data: { ids: pendingDeleteIds },
                preserveScroll: true,
                onSuccess: () => {
                    setPendingDeleteIds(null);
                },
            });
        }
    };

    // Columns
    const columns = useMemo<DataTableColumnDef<NewsletterSubscriber>[]>(() => {
        return [
            {
                id: "select",
                header: ({ table }) => (
                    <Checkbox
                        aria-label="Select all subscribers on this page"
                        disabled={!canDelete}
                        checked={table.getIsAllRowsSelected()}
                        indeterminate={
                            table.getIsSomeRowsSelected() &&
                            !table.getIsAllRowsSelected()
                        }
                        onCheckedChange={(checked) =>
                            table.toggleAllRowsSelected(checked === true)
                        }
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        aria-label={`Select subscriber ${row.original.email}`}
                        checked={row.getIsSelected()}
                        disabled={!canDelete}
                        onCheckedChange={(checked) =>
                            row.toggleSelected(checked === true)
                        }
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: "email",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="Email Address"
                    />
                ),
                cell: ({ row }) => {
                    const sub = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">
                                {sub.email}
                            </span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => {
                    const isSubscribed = row.original.status === "subscribed";
                    return isSubscribed ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Subscribed
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600 border border-neutral-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                            Unsubscribed
                        </span>
                    );
                },
            },
            {
                accessorKey: "subscribed_at",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="Subscribed Date"
                    />
                ),
                cell: ({ row }) => {
                    const date = row.original.subscribed_at;
                    if (!date)
                        return (
                            <span className="text-muted-foreground text-xs">
                                —
                            </span>
                        );
                    return (
                        <span className="text-xs text-muted-foreground">
                            {new Date(date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    );
                },
            },
            {
                accessorKey: "ip_address",
                header: "IP Address",
                cell: ({ row }) => (
                    <span className="font-mono text-xs text-muted-foreground">
                        {row.original.ip_address || "—"}
                    </span>
                ),
            },
            {
                id: "actions",
                cell: ({ row }) => {
                    const sub = row.original;

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-full">
                                <DropdownMenuItem
                                    onClick={() =>
                                        router.patch(
                                            toggleStatus.url({
                                                subscriber: sub.id,
                                            }),
                                            {},
                                            { preserveScroll: true },
                                        )
                                    }
                                >
                                    {sub.status === "subscribed" ? (
                                        <>
                                            <UserX className="mr-2 h-4 w-4" />
                                            Mark as Unsubscribed
                                        </>
                                    ) : (
                                        <>
                                            <UserCheck className="mr-2 h-4 w-4" />
                                            Mark as Subscribed
                                        </>
                                    )}
                                </DropdownMenuItem>
                                {canDelete && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() =>
                                                setPendingDeleteIds([sub.id])
                                            }
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Subscriber
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ];
    }, [canDelete]);

    // CSV export URL with current filters
    const exportUrl = `${exportMethod.url()}?status=${statusFilter}${search ? `&search=${encodeURIComponent(search)}` : ""}`;

    return (
        <div className="space-y-6 p-6">
            <Head title="Newsletter Subscribers" />

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Heading
                        title="Newsletter Subscribers"
                        description="View, manage, and export your audience and email subscriber list for email marketing campaigns."
                        variant="small"
                    />
                </div>
                {canExport && (
                    <a
                        href={exportUrl}
                        download
                        className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-semibold text-neutral-800 shadow-sm transition-colors hover:bg-neutral-50"
                    >
                        <Download className="h-4 w-4" />
                        Export to CSV
                    </a>
                )}
            </div>

            {/* Filters Bar */}

            <DataTable
                columns={columns}
                data={subscribers?.data ?? []}
                isLoading={subscribers === undefined}
                pageCount={subscribers?.last_page ?? 1}
                pagination={{ pageIndex, pageSize }}
                onPaginationChange={(updater) => {
                    const next =
                        typeof updater === "function"
                            ? updater({ pageIndex, pageSize })
                            : updater;
                    setPagination(next);
                    applyFilters({
                        page: next.pageIndex + 1,
                        per_page: next.pageSize,
                    });
                }}
                sorting={sorting}
                onSortingChange={(updater) => {
                    const next =
                        typeof updater === "function"
                            ? updater(sorting)
                            : updater;
                    setSorting(next);
                    if (next[0]) {
                        applyFilters({
                            sort: next[0].id as any,
                            direction: next[0].desc ? "desc" : "asc",
                        });
                    }
                }}
                manualPagination
                manualSorting
                totalRows={subscribers?.total ?? 0}
                selectionResetKey={JSON.stringify(filters)}
                getRowId={(row) => String(row.id)}
                toolbarFilters={() => {
                    return (
                        <div className="flex flex-1 flex-wrap items-center gap-3">
                            <Input
                                placeholder="Search by email..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                onKeyDown={(e) =>
                                    e.key === "Enter" &&
                                    applyFilters({ search })
                                }
                                className="w-full sm:w-72"
                            />

                            <Select
                                value={statusFilter}
                                onValueChange={(val: any) => {
                                    setStatusFilter(val);
                                    applyFilters({ status: val });
                                }}
                            >
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Subscribers
                                    </SelectItem>
                                    <SelectItem value="subscribed">
                                        Subscribed Only
                                    </SelectItem>
                                    <SelectItem value="unsubscribed">
                                        Unsubscribed
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    );
                }}
                batchActions={(_table, selectedSubscribers) => (
                    <div className="flex items-center gap-2">
                        {canDelete && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                    setPendingDeleteIds(
                                        selectedSubscribers.map((s) => s.id),
                                    )
                                }
                            >
                                <Trash2 className="mr-1.5 h-4 w-4" />
                                Delete Selected ({selectedSubscribers.length})
                            </Button>
                        )}
                    </div>
                )}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={!!pendingDeleteIds}
                onOpenChange={(open) => !open && setPendingDeleteIds(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingDeleteIds && pendingDeleteIds.length > 1
                                ? `Permanently remove ${pendingDeleteIds.length} subscribers from your list?`
                                : "Permanently remove this subscriber from your list?"}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

SubscribersPage.layout = {
    breadcrumbs: [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Subscribers", href: "/dashboard/subscribers" },
    ],
};
