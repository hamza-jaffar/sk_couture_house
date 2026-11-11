import { Combobox } from '@base-ui/react/combobox';
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
} from '@/actions/Modules/Category/Http/Controllers/CategoryController';
import CategoryForm from '@/components/forms/category-form';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useCan } from '@/hooks/use-can';
import type {
    CategoryFilters,
    CategoryOrderTypeOption,
    CategoryParentOption,
    CollectionCategory,
    PaginatedCategories,
} from '@/types';
import { Deferred, Form, Head, router } from '@inertiajs/react';
import type { PaginationState, SortingState } from '@tanstack/table-core';
import {
    Check,
    CalendarDays,
    ChevronDown,
    Eye,
    FolderTree,
    Image as ImageIcon,
    Layers3,
    MoreHorizontal,
    PenIcon,
    Plus,
    Search,
    ShoppingBag,
    Star,
    Sparkles,
    Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Props = {
    categories?: PaginatedCategories;
    parentOptions?: CategoryParentOption[];
    orderTypeOptions?: CategoryOrderTypeOption[];
    filters: CategoryFilters;
};

type PendingAction = {
    action: 'delete' | 'restore' | 'force-delete';
    ids: number[];
    label: string;
};

function CategoryParentFilter({
    value,
    options,
    onValueChange,
}: {
    value: string;
    options: CategoryParentOption[];
    onValueChange: (value: string) => void;
}) {
    const items = [
        { value: '__all__', label: 'All collections' },
        { value: '__root__', label: 'Top-level collections' },
        ...options.map((option) => ({
            value: option.slug,
            label: `${option.name}${option.deleted_at ? ' (Deleted)' : ''}`,
        })),
    ];
    const comboboxItems = Combobox.createItems(items, {
        getValue: (option) => option.value,
        getLabel: (option) => option.label,
    });
    const selectedOption = items.find((option) => option.value === value);

    return (
        <Combobox.Root
            items={comboboxItems}
            value={value}
            onValueChange={(nextValue) => {
                if (nextValue !== null) {
                    onValueChange(nextValue);
                }
            }}
        >
            <Combobox.Trigger
                render={
                    <button
                        type="button"
                        aria-label="Filter by parent collection"
                        className="flex h-8 min-w-48 items-center justify-between gap-3 rounded-lg border border-input bg-transparent px-2.5 text-left text-sm whitespace-nowrap transition-colors outline-none hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
                    >
                        <span className="truncate">
                            {selectedOption?.label ?? 'All collections'}
                        </span>
                        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                    </button>
                }
            />
            <Combobox.Portal>
                <Combobox.Positioner
                    align="start"
                    sideOffset={4}
                    className="z-50 outline-none"
                >
                    <Combobox.Popup
                        aria-label="Filter collections by parent"
                        className="w-(--anchor-width) min-w-64 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md"
                    >
                        <div className="relative border-b p-2">
                            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Combobox.Input
                                aria-label="Search parent collections"
                                placeholder="Search parent collections..."
                                className="h-9 w-full rounded-md bg-transparent py-1 pr-2 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <Combobox.Empty>
                            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                No matching collections found.
                            </p>
                        </Combobox.Empty>
                        <Combobox.List className="max-h-64 overflow-y-auto p-1">
                            {(option: (typeof items)[number]) => (
                                <Combobox.Item
                                    key={option.value}
                                    value={option.value}
                                    className="flex cursor-default items-center gap-2 rounded-md px-2 py-2 text-sm outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                                >
                                    <Combobox.ItemIndicator className="flex size-4 shrink-0 items-center justify-center">
                                        <Check className="size-4" />
                                    </Combobox.ItemIndicator>
                                    <span className="min-w-0 flex-1 truncate">
                                        {option.label}
                                    </span>
                                </Combobox.Item>
                            )}
                        </Combobox.List>
                    </Combobox.Popup>
                </Combobox.Positioner>
            </Combobox.Portal>
        </Combobox.Root>
    );
}

function CategoryDetails({
    category,
    orderTypeOptions = [],
}: {
    category: CollectionCategory;
    orderTypeOptions?: CategoryOrderTypeOption[];
}) {
    const orderTypeLabel =
        orderTypeOptions.find((opt) => opt.value === category.order_type)
            ?.label ?? category.order_type;

    const details = [
        {
            label: 'Parent collection',
            value: category.parent?.name ?? 'Top-level collection',
            icon: FolderTree,
        },
        {
            label: 'Order type',
            value: orderTypeLabel,
            icon: ShoppingBag,
        },
        {
            label: 'Child collections',
            value: String(category.children_count),
            icon: Layers3,
        },
        {
            label: 'Created',
            value: category.created_at.slice(0, 10),
            icon: CalendarDays,
        },
    ];
    const metadata: [string, string | null][] = [
        ['Meta title', category.meta_title],
        ['Meta description', category.meta_description],
        ['Meta keywords', category.meta_keywords],
    ];

    return (
        <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
                <section className="grid gap-3 sm:grid-cols-2">
                    {[
                        {
                            label: 'Collection image',
                            url: category.image_url,
                            path: category.image_path,
                            alt: `${category.name} category image`,
                        },
                        {
                            label: 'Collection banner',
                            url: category.banner_url,
                            path: category.banner_path,
                            alt: `${category.name} banner`,
                        },
                    ].map((media) => (
                        <div
                            key={media.label}
                            className="overflow-hidden rounded-xl border bg-card"
                        >
                            <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden bg-muted/60">
                                {media.url ? (
                                    <img
                                        src={media.url}
                                        alt={media.alt}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <ImageIcon className="size-7 opacity-60" />
                                        <span className="text-xs">
                                            No image selected
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1 p-3">
                                <p className="text-sm font-medium">
                                    {media.label}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {media.path
                                        ? 'Selected from gallery'
                                        : 'Not set'}
                                </p>
                            </div>
                        </div>
                    ))}
                </section>

                <section className="space-y-2 rounded-xl border bg-card p-4">
                    <h3 className="text-sm font-semibold">Description</h3>
                    <p className="text-sm leading-6 text-muted-foreground">
                        {category.description || 'No description provided.'}
                    </p>
                </section>

                <section className="space-y-3">
                    <div>
                        <h3 className="text-sm font-semibold">
                            Collection info
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Organization and visibility
                        </p>
                    </div>
                    <dl className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border bg-card p-4">
                            <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                <Sparkles className="size-4" />
                                Featured
                            </dt>
                            <dd className="mt-2 text-sm font-semibold">
                                {category.is_featured ? 'Yes' : 'No'}
                            </dd>
                        </div>
                        {details.map(({ label, value, icon: Icon }) => (
                            <div
                                key={label}
                                className="min-w-0 rounded-xl border bg-card p-4"
                            >
                                <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                    <Icon className="size-4" />
                                    {label}
                                </dt>
                                <dd className="mt-2 truncate text-sm font-semibold">
                                    {value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <div className="rounded-xl border bg-card p-4">
                        <p className="text-xs font-medium text-muted-foreground">
                            Slug
                        </p>
                        <p className="mt-1 font-mono text-sm break-all">
                            {category.slug}
                        </p>
                    </div>
                </section>

                <section className="space-y-3 pb-2">
                    <div>
                        <h3 className="text-sm font-semibold">
                            Search metadata
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            Details used by search engines
                        </p>
                    </div>
                    <dl className="divide-y rounded-xl border bg-card px-4">
                        {metadata.map(([label, value]) => (
                            <div key={label} className="space-y-1 py-3">
                                <dt className="text-xs font-medium text-muted-foreground">
                                    {label}
                                </dt>
                                <dd className="text-sm leading-5 break-words">
                                    {value || (
                                        <span className="text-muted-foreground">
                                            Not set
                                        </span>
                                    )}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </section>
            </div>
        </div>
    );
}

export default function Collection({
    categories,
    parentOptions,
    orderTypeOptions = [],
    filters,
}: Props) {
    const can = useCan();
    const [search, setSearch] = useState(filters.search);
    const [isLoading, setIsLoading] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] =
        useState<CollectionCategory | null>(null);
    const [viewingCategory, setViewingCategory] =
        useState<CollectionCategory | null>(null);
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(
        null,
    );
    const [processingAction, setProcessingAction] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    useEffect(() => {
        setSearch(filters.search);
    }, [filters.search]);

    const visitCategories = useCallback(
        (changes: Partial<CategoryFilters>, resetPage = true) => {
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
                    only: ['categories', 'filters', 'orderTypeOptions'],
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
            () => visitCategories({ search }),
            300,
        );

        return () => window.clearTimeout(timeout);
    }, [filters.search, search, visitCategories]);

    const submitAction = () => {
        if (pendingAction === null) {
            return;
        }

        setProcessingAction(true);
        setActionError(null);
        const options = {
            only: ['categories', 'filters', 'parentOptions'],
            preserveScroll: true,
            onSuccess: () => setPendingAction(null),
            onError: (errors: Record<string, string>) => {
                setActionError(
                    errors.ids ??
                        errors.category ??
                        'Unable to update collections.',
                );
            },
            onFinish: () => setProcessingAction(false),
        };

        if (pendingAction.action === 'delete') {
            if (pendingAction.ids.length === 1) {
                const category = categories?.data.find(
                    (item) => item.id === pendingAction.ids[0],
                );

                if (!category) {
                    setActionError(
                        'The selected collection is no longer available.',
                    );
                    setProcessingAction(false);

                    return;
                }

                router.delete(destroy.url(category.slug), options);
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
                const category = categories?.data.find(
                    (item) => item.id === pendingAction.ids[0],
                );

                if (!category) {
                    setActionError(
                        'The selected collection is no longer available.',
                    );
                    setProcessingAction(false);

                    return;
                }

                router.post(restore.url(category.slug), {}, options);
            } else {
                router.post(
                    bulkRestore.url(),
                    { ids: pendingAction.ids },
                    options,
                );
            }

            return;
        }

        if (pendingAction.ids.length === 1) {
            const category = categories?.data.find(
                (item) => item.id === pendingAction.ids[0],
            );

            if (!category) {
                setActionError(
                    'The selected collection is no longer available.',
                );
                setProcessingAction(false);

                return;
            }

            router.delete(forceDelete.url(category.slug), options);
        } else {
            router.delete(bulkForceDelete.url(), {
                data: { ids: pendingAction.ids },
                ...options,
            });
        }
    };

    const columns = useMemo<DataTableColumnDef<CollectionCategory>[]>(
        () => [
            {
                id: 'select',
                header: ({ table }) => {
                    const rows = table.getRowModel().rows;
                    const selectedCount = rows.filter((row) =>
                        row.getIsSelected(),
                    ).length;

                    return (
                        <Checkbox
                            aria-label="Select all collections on this page"
                            disabled={!can('collections.delete')}
                            checked={
                                rows.length > 0 && selectedCount === rows.length
                            }
                            indeterminate={
                                selectedCount > 0 && selectedCount < rows.length
                            }
                            onCheckedChange={(checked) =>
                                rows.forEach((row) =>
                                    row.toggleSelected(checked === true),
                                )
                            }
                        />
                    );
                },
                cell: ({ row }) => (
                    <Checkbox
                        aria-label={`Select ${row.original.name}`}
                        checked={row.getIsSelected()}
                        disabled={!can('collections.delete')}
                        onCheckedChange={(checked) =>
                            row.toggleSelected(checked === true)
                        }
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: 'name',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Collection" />
                ),
                cell: ({ row }) => (
                    <div className="min-w-0">
                        <p className="font-medium">{row.original.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {row.original.slug}
                        </p>
                    </div>
                ),
            },
            {
                id: 'parent',
                header: 'Parent',
                cell: ({ row }) =>
                    row.original.parent?.name ?? (
                        <span className="text-muted-foreground">Top-level</span>
                    ),
                enableSorting: false,
            },
            {
                accessorKey: 'children_count',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Children" />
                ),
                cell: ({ row }) => row.original.children_count,
            },
            {
                accessorKey: 'order_type',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Order Type" />
                ),
                cell: ({ row }) => {
                    const type = row.original.order_type;
                    const label =
                        orderTypeOptions.find((opt) => opt.value === type)
                            ?.label ?? type;

                    return (
                        <span className="rounded-md border bg-muted/50 px-2 py-0.5 text-xs font-medium">
                            {label}
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
                accessorKey: 'is_featured',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Featured" />
                ),
                cell: ({ row }) =>
                    row.original.is_featured ? (
                        <Star className="size-4 fill-amber-500 text-amber-500" />
                    ) : (
                        <span className="text-muted-foreground">—</span>
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
                                    aria-label={`Actions for ${row.original.name}`}
                                >
                                    <MoreHorizontal />
                                </Button>
                            }
                        />
                        <DropdownMenuContent align="end" className="w-full">
                            <DropdownMenuItem
                                onClick={() => setViewingCategory(row.original)}
                            >
                                <Eye />
                                View details
                            </DropdownMenuItem>
                            {filters.status === 'active' ? (
                                <>
                                    {can('collections.update') && (
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setEditingCategory(
                                                    row.original,
                                                );
                                                setFormOpen(true);
                                            }}
                                        >
                                            <PenIcon />
                                            Edit collection
                                        </DropdownMenuItem>
                                    )}
                                    {can('collections.delete') && (
                                        <DropdownMenuItem
                                            variant="destructive"

                                            onClick={() =>
                                                setPendingAction({
                                                    action: 'delete',
                                                    ids: [row.original.id],
                                                    label: row.original.name,
                                                })
                                            }
                                        >
                                            <Trash2 />
                                            Move to trash
                                        </DropdownMenuItem>
                                    )}
                                </>
                            ) : (
                                can('collections.delete') && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                setPendingAction({
                                                    action: 'restore',
                                                    ids: [row.original.id],
                                                    label: row.original.name,
                                                })
                                            }
                                        >
                                            Restore collection
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={() =>
                                                setPendingAction({
                                                    action: 'force-delete',
                                                    ids: [row.original.id],
                                                    label: row.original.name,
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
        [can, filters.status, orderTypeOptions],
    );

    const sorting: SortingState = [
        { id: filters.sort, desc: filters.direction === 'desc' },
    ];
    const pagination: PaginationState = {
        pageIndex: (categories?.current_page ?? filters.page) - 1,
        pageSize: categories?.per_page ?? filters.per_page,
    };
    const formRoute = editingCategory ? update(editingCategory.slug) : store();

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title="Collections" />
            <div className="flex flex-wrap items-start justify-between gap-4">
                <Heading
                    variant="small"
                    title="Collections"
                    description="Create and manage your product collections."
                />
                {can('collections.create') && (
                    <Button
                        onClick={() => {
                            setEditingCategory(null);
                            setFormOpen(true);
                        }}
                    >
                        <Plus />
                        Create collection
                    </Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={categories?.data ?? []}
                getRowId={(category) => String(category.id)}
                selectionResetKey={JSON.stringify(filters)}
                manualFiltering
                manualSorting
                manualPagination
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search collections..."
                sorting={sorting}
                onSortingChange={(next) => {
                    const value =
                        typeof next === 'function' ? next(sorting) : next;
                    visitCategories({
                        sort: value[0]?.id ?? 'name',
                        direction: value[0]?.desc ? 'desc' : 'asc',
                    });
                }}
                pagination={pagination}
                onPaginationChange={(next) => {
                    const value =
                        typeof next === 'function' ? next(pagination) : next;
                    visitCategories(
                        {
                            page: value.pageIndex + 1,
                            per_page: value.pageSize,
                        },
                        false,
                    );
                }}
                pageCount={categories?.last_page ?? 0}
                totalRows={categories?.total ?? 0}
                initialPageSize={categories?.per_page ?? filters.per_page}
                pageSizeOptions={[10, 20, 50, 100]}
                isLoading={isLoading || categories === undefined}
                emptyTitle={
                    filters.status === 'deleted'
                        ? 'The collection trash is empty'
                        : 'No collections found'
                }
                emptyDescription={
                    filters.search
                        ? 'Try changing the search or collection filters.'
                        : 'Create a collection to organize your products.'
                }
                toolbarFilters={() => (
                    <div className="flex flex-wrap gap-2">
                        <Deferred
                            data="parentOptions"
                            fallback={<Skeleton className="h-8 w-48" />}
                        >
                            <CategoryParentFilter
                                value={filters.parent || '__all__'}
                                options={parentOptions ?? []}
                                onValueChange={(value) =>
                                    visitCategories({ parent: value })
                                }
                            />
                        </Deferred>
                        <Select
                            items={[
                                {
                                    value: 'active',
                                    label: 'Active collections',
                                },
                                { value: 'deleted', label: 'Trash' },
                            ]}
                            value={filters.status}
                            onValueChange={(value) => {
                                if (value === 'active' || value === 'deleted') {
                                    visitCategories({
                                        status: value,
                                        parent: '__all__',
                                    });
                                }
                            }}
                        >
                            <SelectTrigger
                                className="min-w-48"
                                aria-label="Filter collection status"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">
                                    Active collections
                                </SelectItem>
                                <SelectItem value="deleted">Trash</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
                batchActions={
                    can('collections.delete')
                        ? (_table, selectedCategories) => (
                              <div className="flex gap-2">
                                  {filters.status === 'active' ? (
                                      <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() =>
                                              setPendingAction({
                                                  action: 'delete',
                                                  ids: selectedCategories.map(
                                                      (category) => category.id,
                                                  ),
                                                  label: `${selectedCategories.length} selected collections`,
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
                                                      ids: selectedCategories.map(
                                                          (category) =>
                                                              category.id,
                                                      ),
                                                      label: `${selectedCategories.length} selected collections`,
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
                                                      ids: selectedCategories.map(
                                                          (category) =>
                                                              category.id,
                                                      ),
                                                      label: `${selectedCategories.length} selected collections`,
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

            <Deferred
                data="parentOptions"
                fallback={<Skeleton className="h-10 w-full" />}
            >
                <Form
                    key={editingCategory?.id ?? 'new-category'}
                    action={formRoute}
                    options={{
                        only: [
                            'categories',
                            'filters',
                            'parentOptions',
                            'orderTypeOptions',
                        ],
                        preserveScroll: true,
                    }}
                    onSuccess={() => {
                        setFormOpen(false);
                        setEditingCategory(null);
                    }}
                >
                    {({ processing, errors }) => (
                        <FormDialog
                            open={formOpen}
                            onOpenChange={setFormOpen}
                            name={
                                editingCategory
                                    ? 'Edit collection'
                                    : 'Create collection'
                            }
                            width="w-full max-w-2xl"
                            height="h-[90vh] max-h-[52rem]"
                            processing={processing}
                        >
                            <CategoryForm
                                category={editingCategory}
                                parentOptions={parentOptions}
                                orderTypeOptions={orderTypeOptions}
                                errors={errors}
                            />
                        </FormDialog>
                    )}
                </Form>
            </Deferred>

            <Sheet
                open={viewingCategory !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setViewingCategory(null);
                    }
                }}
            >
                <SheetContent className="w-full gap-0 overflow-hidden p-0 sm:max-w-xl">
                    {viewingCategory && (
                        <>
                            <SheetHeader className="shrink-0 border-b px-6 py-5">
                                <div className="space-y-3 pr-8">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 space-y-1">
                                            <SheetTitle className="truncate text-lg">
                                                {viewingCategory.name}
                                            </SheetTitle>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {viewingCategory.slug}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 flex-wrap justify-end gap-2">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    viewingCategory.deleted_at
                                                        ? 'bg-destructive/10 text-destructive'
                                                        : viewingCategory.is_active
                                                          ? 'bg-primary/10 text-primary'
                                                          : 'bg-muted text-muted-foreground'
                                                }`}
                                            >
                                                {viewingCategory.deleted_at
                                                    ? 'In trash'
                                                    : viewingCategory.is_active
                                                      ? 'Active'
                                                      : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </SheetHeader>
                            <CategoryDetails
                                category={viewingCategory}
                                orderTypeOptions={orderTypeOptions}
                            />
                        </>
                    )}
                </SheetContent>
            </Sheet>

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
                                ? 'Move collections to trash?'
                                : pendingAction?.action === 'restore'
                                  ? 'Restore collections?'
                                  : 'Permanently delete collections?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionError ??
                                (pendingAction?.action === 'delete'
                                    ? `${pendingAction?.label} will be moved to trash. Collections with children require deleting their child collections first.`
                                    : pendingAction?.action === 'restore'
                                      ? `${pendingAction?.label} will be restored. Restore a parent before restoring its children.`
                                      : `${pendingAction?.label} will be permanently deleted. This cannot be undone. Delete child collections first.`)}
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

Collection.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Collections', href: '/dashboard/collection' },
    ],
};
