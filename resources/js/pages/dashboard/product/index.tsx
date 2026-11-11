import {
    create,
    destroy,
    edit,
    forceDelete,
    index,
    restore,
} from '@/actions/Modules/Product/Http/Controller/ProductController';
import {
    DataTable,
    DataTableColumnHeader,
    type DataTableColumnDef,
} from '@/components/data-table';
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
    PaginatedProducts,
    ProductFilters,
    ProductFormOptions,
    ProductRecord,
} from '@/types';
import { Combobox } from '@base-ui/react/combobox';
import { Deferred, Head, router } from '@inertiajs/react';
import type { PaginationState, SortingState } from '@tanstack/table-core';
import {
    ArchiveRestore,
    Check,
    ChevronDown,
    ImageIcon,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Heading from '@/components/heading';
import { formatPrice } from '@/lib/utils';

type Props = {
    products?: PaginatedProducts;
    formOptions?: ProductFormOptions;
    filters: ProductFilters;
};

type PendingAction = {
    type: 'delete' | 'restore' | 'force-delete';
    product: ProductRecord;
};

function ProductTableSkeleton() {
    return (
        <div className="grid gap-3">
            {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-lg" />
            ))}
        </div>
    );
}

function ProductImageCell({ product }: { product: ProductRecord }) {
    const image = product.images[0];

    return (
        <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                {image?.url ? (
                    <img
                        src={image.url}
                        alt=""
                        className="size-full object-cover"
                    />
                ) : (
                    <ImageIcon className="size-5 text-muted-foreground" />
                )}
            </div>
            <div className="min-w-0">
                <p className="truncate font-medium">{product.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                    /{product.slug}
                </p>
            </div>
        </div>
    );
}

function CollectionFilter({
    value,
    categories,
    onValueChange,
}: {
    value: string;
    categories: ProductFormOptions['categories'];
    onValueChange: (value: string) => void;
}) {
    const items = useMemo(
        () => [
            { value: 'all', label: 'All collections' },
            ...categories.map((category) => ({
                value: category.slug,
                label: category.name,
            })),
        ],
        [categories],
    );

    const comboboxItems = useMemo(
        () =>
            Combobox.createItems(items, {
                getValue: (option) => option.value,
                getLabel: (option) => option.label,
            }),
        [items],
    );

    const selectedOption = items.find((option) => option.value === value);

    return (
        <Combobox.Root
            items={comboboxItems}
            value={value || 'all'}
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
                        aria-label="Filter by collection"
                        className="flex h-8 min-w-44 items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 text-left text-sm whitespace-nowrap transition-colors outline-none hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
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
                        aria-label="Filter by collection"
                        className="w-(--anchor-width) min-w-64 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md"
                    >
                        <div className="relative border-b p-2">
                            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Combobox.Input
                                aria-label="Search collections"
                                placeholder="Search collections..."
                                className="h-8 w-full rounded-md bg-transparent py-1 pr-2 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
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

function ProductTable({
    products,
    categories,
    filters,
    can,
    search,
    currencyIcon,
    onSearchChange,
    onEdit,
    onAction,
    onFiltersChange,
    isLoading,
}: {
    products?: PaginatedProducts;
    categories: ProductFormOptions['categories'];
    filters: ProductFilters;
    can: (permission: string) => boolean;
    search: string;
    currencyIcon: string;
    onSearchChange: (value: string) => void;
    onEdit: (product: ProductRecord) => void;
    onAction: (action: PendingAction) => void;
    onFiltersChange: (changes: Partial<ProductFilters>) => void;
    isLoading: boolean;
}) {
    const columns = useMemo<DataTableColumnDef<ProductRecord>[]>(
        () => [
            {
                accessorKey: 'title',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Product" />
                ),
                cell: ({ row }) => <ProductImageCell product={row.original} />,
            },
            {
                id: 'category',
                accessorFn: (product) => product.category?.name ?? '',
                header: () => 'Collection',
                cell: ({ row }) =>
                    row.original.category?.name ?? (
                        <span className="text-muted-foreground">
                            Unassigned
                        </span>
                    ),
                enableSorting: false,
            },
            {
                accessorKey: 'price',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Price" />
                ),
                cell: ({ row }) => (
                    <div className="grid">
                        <span>
                            {formatPrice(row.original.price, currencyIcon)}
                        </span>
                        {row.original.sale_price && (
                            <span className="text-xs text-muted-foreground">
                                Sale{' '}
                                {formatPrice(
                                    row.original.sale_price,
                                    currencyIcon,
                                )}
                            </span>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: 'stock',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Stock" />
                ),
                cell: ({ row }) => (
                    <span>
                        {row.original.stock}
                        {row.original.type === 'variable' && (
                            <span className="ml-1 text-xs text-muted-foreground">
                                across {row.original.variants_count} variants
                            </span>
                        )}
                    </span>
                ),
            },
            {
                accessorKey: 'status',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Status" />
                ),
                cell: ({ row }) =>
                    row.original.deleted_at ? (
                        <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                            In trash
                        </span>
                    ) : (
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize">
                            {row.original.status}
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
                header: () => <span className="sr-only">Actions</span>,
                enableSorting: false,
                cell: ({ row }) => {
                    const product = row.original;

                    return (
                        <div className="flex justify-end gap-1">
                            {product.deleted_at ? (
                                <>
                                    {can('products.delete') && (
                                        <>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    onAction({
                                                        type: 'restore',
                                                        product,
                                                    })
                                                }
                                            >
                                                <ArchiveRestore />
                                                Restore
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                aria-label={`Permanently delete ${product.title}`}
                                                onClick={() =>
                                                    onAction({
                                                        type: 'force-delete',
                                                        product,
                                                    })
                                                }
                                            >
                                                <Trash2 />
                                            </Button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    {can('products.update') && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Edit ${product.title}`}
                                            title="Edit product"
                                            onClick={() => onEdit(product)}
                                        >
                                            <Pencil />
                                        </Button>
                                    )}
                                    {can('products.delete') && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Move ${product.title} to trash`}
                                            onClick={() =>
                                                onAction({
                                                    type: 'delete',
                                                    product,
                                                })
                                            }
                                        >
                                            <Trash2 />
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    );
                },
            },
        ],
        [can, currencyIcon, onAction, onEdit],
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
        <DataTable
            columns={columns}
            data={products?.data ?? []}
            getRowId={(product) => product.slug}
            selectionResetKey={JSON.stringify(filters)}
            manualFiltering
            manualSorting
            manualPagination
            searchValue={search}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search products..."
            sorting={sorting}
            onSortingChange={(next) => {
                const value = typeof next === 'function' ? next(sorting) : next;
                const sort = value[0]?.id;

                if (
                    sort !== 'title' &&
                    sort !== 'price' &&
                    sort !== 'stock' &&
                    sort !== 'status' &&
                    sort !== 'created_at'
                ) {
                    return;
                }

                onFiltersChange({
                    sort,
                    direction: value[0]?.desc ? 'desc' : 'asc',
                });
            }}
            pagination={pagination}
            onPaginationChange={(next) => {
                const value =
                    typeof next === 'function' ? next(pagination) : next;
                onFiltersChange({
                    page: value.pageIndex + 1,
                    per_page: value.pageSize,
                });
            }}
            pageCount={products?.last_page ?? 0}
            totalRows={products?.total ?? 0}
            initialPageSize={products?.per_page ?? filters.per_page}
            pageSizeOptions={[10, 20, 50, 100]}
            isLoading={isLoading || products === undefined}
            emptyTitle={
                filters.status === 'deleted'
                    ? 'The product trash is empty'
                    : 'No products found'
            }
            emptyDescription={
                filters.search
                    ? 'Try changing your search or filters.'
                    : 'Create a product to start building your catalog.'
            }
            toolbarFilters={() => (
                <div className="flex flex-wrap gap-2">
                    <CollectionFilter
                        value={filters.category}
                        categories={categories}
                        onValueChange={(category) =>
                            onFiltersChange({ category })
                        }
                    />
                    <Select
                        value={filters.type}
                        onValueChange={(value) => {
                            if (
                                value === 'all' ||
                                value === 'simple' ||
                                value === 'variable'
                            ) {
                                onFiltersChange({ type: value });
                            }
                        }}
                    >
                        <SelectTrigger
                            className="min-w-40"
                            aria-label="Filter by product type"
                        >
                            <SelectValue>
                                {filters.type === 'all'
                                    ? 'All types'
                                    : filters.type === 'simple'
                                      ? 'Simple'
                                      : 'Variable'}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            <SelectItem value="simple">Simple</SelectItem>
                            <SelectItem value="variable">Variable</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={filters.status}
                        onValueChange={(value) => {
                            if (
                                value === 'all' ||
                                value === 'draft' ||
                                value === 'published' ||
                                value === 'archived' ||
                                value === 'deleted'
                            ) {
                                onFiltersChange({ status: value });
                            }
                        }}
                    >
                        <SelectTrigger
                            className="min-w-40"
                            aria-label="Filter by product status"
                        >
                            <SelectValue>
                                {filters.status === 'all'
                                    ? 'All statuses'
                                    : filters.status === 'draft'
                                      ? 'Draft'
                                      : filters.status === 'published'
                                        ? 'Published'
                                        : filters.status === 'archived'
                                          ? 'Archived'
                                          : 'Trash'}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                            <SelectItem value="deleted">Trash</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
        />
    );
}

export default function ProductIndex({
    products,
    formOptions,
    filters,
}: Props) {
    const can = useCan();
    const [search, setSearch] = useState(filters.search);
    const [isLoading, setIsLoading] = useState(false);
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(
        null,
    );
    const [processingAction, setProcessingAction] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    useEffect(() => {
        setSearch(filters.search);
    }, [filters.search]);

    const visitProducts = useCallback(
        (changes: Partial<ProductFilters>) => {
            const nextFilters = {
                ...filters,
                ...changes,
                page: changes.page ?? 1,
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
                    only: ['products', 'filters'],
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

        const timeout = window.setTimeout(() => visitProducts({ search }), 300);

        return () => window.clearTimeout(timeout);
    }, [filters.search, search, visitProducts]);

    function submitAction() {
        if (!pendingAction) {
            return;
        }

        setProcessingAction(true);
        setActionError(null);
        const options = {
            only: ['products', 'filters'],
            preserveScroll: true,
            onSuccess: () => setPendingAction(null),
            onError: (errors: Record<string, string>) =>
                setActionError(
                    errors.product ?? 'Unable to update this product.',
                ),
            onFinish: () => setProcessingAction(false),
        };
        const slug = pendingAction.product.slug;

        if (pendingAction.type === 'delete') {
            router.delete(destroy.url(slug), options);
        } else if (pendingAction.type === 'restore') {
            router.patch(restore.url(slug), {}, options);
        } else {
            router.delete(forceDelete.url(slug), options);
        }
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <Head title="Products" />
            <header className="flex flex-wrap items-start justify-between gap-4">
                <Heading
                    title="Products"
                    description="Manage catalog information, pricing, stock, and
                        variants."
                />
                {can('products.create') && (
                    <Button
                        type="button"
                        onClick={() => router.visit(create.url())}
                    >
                        <Plus />
                        Create product
                    </Button>
                )}
            </header>

            <Deferred data="products" fallback={<ProductTableSkeleton />}>
                <Deferred
                    data="formOptions"
                    fallback={<ProductTableSkeleton />}
                >
                    <ProductTable
                        products={products}
                        categories={formOptions?.categories ?? []}
                        filters={filters}
                        can={can}
                        search={search}
                        currencyIcon={formOptions?.currency_icon ?? '$'}
                        onSearchChange={setSearch}
                        onEdit={(product) =>
                            router.visit(edit.url(product.slug))
                        }
                        onAction={setPendingAction}
                        onFiltersChange={visitProducts}
                        isLoading={isLoading}
                    />
                </Deferred>
            </Deferred>

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
                            {pendingAction?.type === 'delete'
                                ? 'Move product to trash?'
                                : pendingAction?.type === 'restore'
                                  ? 'Restore product?'
                                  : 'Permanently delete product?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {actionError ??
                                (pendingAction?.type === 'force-delete'
                                    ? `${pendingAction.product.title} will be permanently deleted. This cannot be undone.`
                                    : pendingAction?.type === 'restore'
                                      ? `${pendingAction.product.title} will be restored.`
                                      : `${pendingAction?.product.title} will be moved to trash.`)}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processingAction}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            variant={
                                pendingAction?.type === 'restore'
                                    ? 'default'
                                    : 'destructive'
                            }
                            disabled={processingAction}
                            onClick={submitAction}
                        >
                            {processingAction
                                ? 'Working...'
                                : pendingAction?.type === 'delete'
                                  ? 'Move to trash'
                                  : pendingAction?.type === 'restore'
                                    ? 'Restore'
                                    : 'Delete permanently'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

ProductIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Products', href: '/dashboard/product' },
    ],
};
