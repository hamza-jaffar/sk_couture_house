import {
    bulkDestroy,
    bulkForceDelete,
    bulkRestore,
    destroy,
    forceDelete,
    index,
    reorder,
    restore,
    store,
    toggleStatus,
    update,
} from "@/actions/Modules/Banner/Http/Controllers/BannerController";
import BannerForm from "@/components/forms/banner-form";
import {
    DataTable,
    DataTableColumnHeader,
    type DataTableColumnDef,
} from "@/components/data-table";
import FormDialog from "@/components/form-dialog";
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
import { useCan } from "@/hooks/use-can";
import type {
    Banner,
    BannerFilters,
    PaginatedBanners,
} from "@/types";
import { Form, Head, router } from "@inertiajs/react";
import type { PaginationState, SortingState } from "@tanstack/table-core";
import {
    ArrowUpDown,
    ExternalLink,
    Film,
    Image as ImageIcon,
    MoreHorizontal,
    PenIcon,
    Plus,
    RotateCcw,
    SlidersHorizontal,
    Trash2,
    Video,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Switch } from "@/components/ui/switch";

type Props = {
    banners?: PaginatedBanners;
    filters: BannerFilters;
};

type PendingAction = {
    action: "delete" | "restore" | "force-delete";
    ids: number[];
    label: string;
};

export default function BannersPage({ banners, filters }: Props) {
    const can = useCan();
    const canCreate = can("banners.create");
    const canUpdate = can("banners.update");
    const canDelete = can("banners.delete");

    const [search, setSearch] = useState(filters.search ?? "");
    const [statusFilter, setStatusFilter] = useState<BannerFilters["status"]>(
        filters.status ?? "all",
    );
    const [mediaFilter, setMediaFilter] = useState<BannerFilters["media_type"]>(
        filters.media_type ?? "all",
    );
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(
        null,
    );

    // TanStack table state
    const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
        pageIndex: (filters.page ?? 1) - 1,
        pageSize: filters.per_page ?? 15,
    });

    const [sorting, setSorting] = useState<SortingState>([
        {
            id: filters.sort ?? "sort_order",
            desc: filters.direction === "desc",
        },
    ]);

    // Filter Navigation
    const applyFilters = useCallback(
        (overrides: Partial<BannerFilters> = {}) => {
            const next: Record<string, any> = {
                search:
                    overrides.search !== undefined ? overrides.search : search,
                status:
                    overrides.status !== undefined
                        ? overrides.status
                        : statusFilter,
                media_type:
                    overrides.media_type !== undefined
                        ? overrides.media_type
                        : mediaFilter,
                sort:
                    overrides.sort !== undefined
                        ? overrides.sort
                        : (sorting[0]?.id ?? "sort_order"),
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
        [search, statusFilter, mediaFilter, sorting, pageIndex, pageSize],
    );

    const confirmAction = () => {
        if (!pendingAction) return;

        const { action, ids } = pendingAction;
        if (action === "delete") {
            if (ids.length === 1) {
                router.delete(destroy.url({ banner: ids[0] }), {
                    preserveScroll: true,
                });
            } else {
                router.delete(bulkDestroy.url(), {
                    data: { ids },
                    preserveScroll: true,
                });
            }
        } else if (action === "restore") {
            if (ids.length === 1) {
                router.post(
                    restore.url({ id: ids[0] }),
                    {},
                    { preserveScroll: true },
                );
            } else {
                router.post(
                    bulkRestore.url(),
                    { ids },
                    { preserveScroll: true },
                );
            }
        } else if (action === "force-delete") {
            if (ids.length === 1) {
                router.delete(forceDelete.url({ id: ids[0] }), {
                    preserveScroll: true,
                });
            } else {
                router.delete(bulkForceDelete.url(), {
                    data: { ids },
                    preserveScroll: true,
                });
            }
        }

        setPendingAction(null);
    };

    // Columns
    const columns = useMemo<DataTableColumnDef<Banner>[]>(() => {
        return [
            {
                id: "select",
                header: ({ table }) => (
                    <Checkbox
                        aria-label="Select all banners on this page"
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
                        aria-label={`Select banner ${row.original.title || row.original.id}`}
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
                id: "media",
                header: "Media",
                cell: ({ row }) => {
                    const banner = row.original;
                    return (
                        <div className="relative h-14 w-24 overflow-hidden rounded border bg-neutral-100">
                            {banner.media_type === "video" ? (
                                banner.media_url ? (
                                    <video
                                        src={banner.media_url}
                                        className="h-full w-full object-cover"
                                        muted
                                        playsInline
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <Film className="h-6 w-6 text-neutral-400" />
                                    </div>
                                )
                            ) : banner.media_url ? (
                                <img
                                    src={banner.media_url}
                                    alt={banner.title ?? "Banner"}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                    <ImageIcon className="h-6 w-6 text-neutral-400" />
                                </div>
                            )}
                            <span className="absolute right-1 bottom-1 rounded bg-black/60 px-1 py-0.5 text-[10px] text-white uppercase font-semibold">
                                {banner.media_type}
                            </span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "title",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="Content & Badges"
                    />
                ),
                cell: ({ row }) => {
                    const banner = row.original;
                    return (
                        <div className="max-w-md space-y-1">
                            {banner.subtitle && (
                                <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                                    {banner.subtitle}
                                </p>
                            )}
                            <p className="font-medium text-foreground line-clamp-1">
                                {banner.title || "Untitled Banner"}
                            </p>
                            {banner.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {banner.description}
                                </p>
                            )}
                            <div className="flex items-center gap-1.5 pt-1">
                                <span className="rounded-md border px-1.5 py-0.5 text-[10px] capitalize text-muted-foreground">
                                    Align: {banner.text_position}
                                </span>
                                <span className="rounded-md border px-1.5 py-0.5 text-[10px] capitalize text-muted-foreground">
                                    Theme: {banner.text_color}
                                </span>
                            </div>
                        </div>
                    );
                },
            },
            {
                id: "action",
                header: "Action Buttons",
                cell: ({ row }) => {
                    const banner = row.original;
                    return (
                        <div className="space-y-1 text-xs">
                            {banner.button_text && (
                                <div className="flex items-center gap-1 font-medium text-foreground">
                                    <span>{banner.button_text}</span>
                                    <span className="text-muted-foreground">
                                        →
                                    </span>
                                    <span className="truncate max-w-[140px] text-muted-foreground">
                                        {banner.button_url}
                                    </span>
                                </div>
                            )}
                            {banner.secondary_button_text && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <span>{banner.secondary_button_text}</span>
                                    <span>→</span>
                                    <span className="truncate max-w-[140px]">
                                        {banner.secondary_button_url}
                                    </span>
                                </div>
                            )}
                            {!banner.button_text &&
                                !banner.secondary_button_text && (
                                    <span className="text-muted-foreground italic">
                                        No action buttons
                                    </span>
                                )}
                        </div>
                    );
                },
            },
            {
                accessorKey: "sort_order",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Order" />
                ),
                cell: ({ row }) => (
                    <span className="font-mono text-xs">
                        {row.original.sort_order}
                    </span>
                ),
            },
            {
                accessorKey: "is_active",
                header: "Status",
                cell: ({ row }) => {
                    const banner = row.original;
                    const isTrash = !!banner.deleted_at;

                    if (isTrash) {
                        return (
                            <span className="rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                                Trashed
                            </span>
                        );
                    }

                    return (
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={banner.is_active}
                                disabled={!canUpdate}
                                onCheckedChange={() =>
                                    router.patch(
                                        toggleStatus.url({
                                            banner: banner.id,
                                        }),
                                        {},
                                        { preserveScroll: true },
                                    )
                                }
                            />
                            <span className="text-xs font-medium text-muted-foreground">
                                {banner.is_active ? "Active" : "Inactive"}
                            </span>
                        </div>
                    );
                },
            },
            {
                id: "actions",
                cell: ({ row }) => {
                    const banner = row.original;
                    const isTrash = !!banner.deleted_at;

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
                            <DropdownMenuContent align="end">
                                {!isTrash ? (
                                    <>
                                        {canUpdate && (
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setEditingBanner(banner);
                                                    setIsCreateOpen(true);
                                                }}
                                            >
                                                <PenIcon className="mr-2 h-4 w-4" />
                                                Edit Banner
                                            </DropdownMenuItem>
                                        )}
                                        {canDelete && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() =>
                                                        setPendingAction({
                                                            action: "delete",
                                                            ids: [banner.id],
                                                            label: `Move "${banner.title || "Banner"}" to trash?`,
                                                        })
                                                    }
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Trash
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {canDelete && (
                                            <>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        setPendingAction({
                                                            action: "restore",
                                                            ids: [banner.id],
                                                            label: `Restore "${banner.title || "Banner"}"?`,
                                                        })
                                                    }
                                                >
                                                    <RotateCcw className="mr-2 h-4 w-4" />
                                                    Restore
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() =>
                                                        setPendingAction({
                                                            action: "force-delete",
                                                            ids: [banner.id],
                                                            label: `Permanently delete "${banner.title || "Banner"}"? This cannot be undone.`,
                                                        })
                                                    }
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete Permanently
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ];
    }, [canUpdate, canDelete]);

    return (
        <div className="space-y-6 p-6">
            <Head title="Banner Management" />

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Heading
                        title="Banners & Sliders"
                        description="Manage high-impact hero sliders, promotional image/video banners, and call-to-actions for your storefront."
                        variant="small"
                    />
                </div>
                {canCreate && (
                    <Button
                        onClick={() => {
                            setEditingBanner(null);
                            setIsCreateOpen(true);
                        }}
                        className="inline-flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Create Banner
                    </Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={banners?.data ?? []}
                isLoading={banners === undefined}
                manualPagination
                manualSorting
                pageCount={banners?.last_page ?? 1}
                totalRows={banners?.total ?? 0}
                pagination={{ pageIndex, pageSize }}
                selectionResetKey={JSON.stringify(filters)}
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
                getRowId={(row) => String(row.id)}
                toolbarFilters={() => {
                    return (
                        <div className="flex flex-1 flex-wrap items-center gap-3">
                            <Input
                                placeholder="Search banners..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" &&
                                    applyFilters({ search })
                                }
                                className="w-full sm:w-64"
                            />

                            <Select
                                value={statusFilter}
                                onValueChange={(val: any) => {
                                    setStatusFilter(val);
                                    applyFilters({ status: val });
                                }}
                            >
                                <SelectTrigger className="w-36">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="active">
                                        Active Only
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                        Inactive
                                    </SelectItem>
                                    <SelectItem value="trash">
                                        Trash
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={mediaFilter}
                                onValueChange={(val: any) => {
                                    setMediaFilter(val);
                                    applyFilters({
                                        media_type: val,
                                    });
                                }}
                            >
                                <SelectTrigger className="w-36">
                                    <SelectValue placeholder="Media Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Media
                                    </SelectItem>
                                    <SelectItem value="image">
                                        Image Only
                                    </SelectItem>
                                    <SelectItem value="video">
                                        Video Only
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    );
                }}
                batchActions={(_table, selectedBanners) => (
                    <div className="flex items-center gap-2">
                        {statusFilter !== "trash" ? (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() =>
                                    setPendingAction({
                                        action: "delete",
                                        ids: selectedBanners.map(
                                            (b) => b.id,
                                        ),
                                        label: `Move ${selectedBanners.length} selected banners to trash?`,
                                    })
                                }
                            >
                                <Trash2 className="mr-1.5 h-4 w-4" />
                                Trash Selected ({selectedBanners.length})
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setPendingAction({
                                            action: "restore",
                                            ids: selectedBanners.map(
                                                (b) => b.id,
                                            ),
                                            label: `Restore ${selectedBanners.length} selected banners?`,
                                        })
                                    }
                                >
                                    <RotateCcw className="mr-1.5 h-4 w-4" />
                                    Restore ({selectedBanners.length})
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                        setPendingAction({
                                            action: "force-delete",
                                            ids: selectedBanners.map(
                                                (b) => b.id,
                                            ),
                                            label: `Permanently delete ${selectedBanners.length} selected banners?`,
                                        })
                                    }
                                >
                                    <Trash2 className="mr-1.5 h-4 w-4" />
                                    Delete Permanently
                                </Button>
                            </>
                        )}
                    </div>
                )}
            />

            {/* Create / Edit Dialog using Inertia <Form> */}
            <Form
                key={editingBanner?.id ?? "new-banner"}
                action={
                    editingBanner
                        ? update.url({ banner: editingBanner.id })
                        : store.url()
                }
                method={editingBanner ? "patch" : "post"}
                options={{
                    only: ["banners", "filters"],
                    preserveScroll: true,
                }}
                onSuccess={() => {
                    setIsCreateOpen(false);
                    setEditingBanner(null);
                }}
            >
                {({ processing, errors }) => (
                    <FormDialog
                        open={isCreateOpen}
                        onOpenChange={(open) => {
                            setIsCreateOpen(open);
                            if (!open) {
                                setEditingBanner(null);
                            }
                        }}
                        name={
                            editingBanner
                                ? "Edit Slider Banner"
                                : "Create New Banner"
                        }
                        width="w-full max-w-2xl"
                        height="h-[90vh] max-h-[52rem]"
                        processing={processing}
                        submitLabel={
                            editingBanner ? "Update Banner" : "Create Banner"
                        }
                        cancelLabel="Cancel"
                    >
                        <BannerForm banner={editingBanner} errors={errors} />
                    </FormDialog>
                )}
            </Form>

            {/* Alert Dialog Confirmation */}
            <AlertDialog
                open={!!pendingAction}
                onOpenChange={(open) => !open && setPendingAction(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingAction?.label}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmAction}
                            className={
                                pendingAction?.action === "delete" ||
                                pendingAction?.action === "force-delete"
                                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    : ""
                            }
                        >
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

BannersPage.layout = {
    breadcrumbs: [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Banners", href: "/dashboard/banners" },
    ],
};
