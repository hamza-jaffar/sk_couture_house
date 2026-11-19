import {
    DataTable,
    DataTableColumnHeader,
    type DataTableColumnDef,
} from '@/components/data-table';
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
import { Deferred, Head, Link, router } from '@inertiajs/react';
import type { PaginationState, SortingState } from '@tanstack/table-core';
import { Edit, Eye, Globe, Lock, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type PageRow = {
    id: number;
    title: string;
    slug: string;
    is_system: boolean;
    is_active: boolean;
    meta_title: string | null;
    meta_description: string | null;
    created_at: string;
    created_at_human: string;
    updated_at: string;
};

type PageFilters = {
    search?: string;
    status?: string;
    type?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
};

type PaginatedPages = {
    data: PageRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

type Props = {
    pages?: PaginatedPages;
    filters: PageFilters;
};

export default function PagesIndex({ pages, filters }: Props) {
    const can = useCan();
    const [search, setSearch] = useState(filters.search ?? '');
    const [isLoading, setIsLoading] = useState(false);
    const [pageToDelete, setPageToDelete] = useState<PageRow | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const visitPages = useCallback(
        (newFilters: Partial<PageFilters>, resetPage = true) => {
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
            if (next.sort) query.sort = next.sort;
            if (next.direction) query.direction = next.direction;
            if (next.per_page) query.per_page = next.per_page;
            if (next.page && next.page > 1) query.page = next.page;

            router.get('/dashboard/pages', query, {
                preserveState: true,
                preserveScroll: true,
                only: ['pages', 'filters'],
                onFinish: () => setIsLoading(false),
            });
        },
        [filters],
    );

    useEffect(() => {
        if (search === (filters.search ?? '')) return;
        const timeout = window.setTimeout(() => visitPages({ search }), 300);
        return () => window.clearTimeout(timeout);
    }, [filters.search, search, visitPages]);

    const handleConfirmDelete = () => {
        if (!pageToDelete) return;
        setIsDeleting(true);

        router.delete(`/dashboard/pages/${pageToDelete.slug}`, {
            preserveScroll: true,
            only: ['pages', 'filters'],
            onFinish: () => {
                setIsDeleting(false);
                setPageToDelete(null);
            },
        });
    };

    const columns = useMemo<DataTableColumnDef<PageRow>[]>(
        () => [
            {
                accessorKey: 'title',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
                cell: ({ row }) => (
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{row.original.title}</p>
                            {row.original.is_system && (
                                <span className="inline-flex items-center gap-0.5 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-400">
                                    <Lock className="size-2.5" /> System
                                </span>
                            )}
                        </div>
                        <p className="mt-0.5 text-xs font-mono text-muted-foreground">
                            /{row.original.slug}
                        </p>
                    </div>
                ),
            },
            {
                accessorKey: 'is_active',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
                cell: ({ row }) =>
                    row.original.is_active ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400">
                            Published
                        </span>
                    ) : (
                        <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                            Draft
                        </span>
                    ),
                enableSorting: false,
            },
            {
                accessorKey: 'created_at',
                header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
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
                    const page = row.original;
                    return (
                        <div className="flex justify-end">
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Actions for ${page.title}`}
                                        >
                                            <MoreHorizontal className="size-4" />
                                        </Button>
                                    }
                                />
                                <DropdownMenuContent align="end" className="w-full">
                                    <DropdownMenuItem>
                                        <a
                                            href={`/page/${page.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className='w-full flex'
                                        >
                                            <Eye className="mr-2 size-4" />
                                            View page
                                        </a>
                                    </DropdownMenuItem>
                                    {can('pages.update') && (
                                        <DropdownMenuItem
                                            onClick={() =>
                                                router.visit(`/dashboard/pages/${page.slug}/edit`)
                                            }
                                        >
                                            <Edit className="mr-2 size-4" />
                                            Edit
                                        </DropdownMenuItem>
                                    )}
                                    {can('pages.delete') && !page.is_system && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => setPageToDelete(page)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="mr-2 size-4" />
                                                Delete
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
        { value: 'active', label: 'Published' },
        { value: 'inactive', label: 'Draft' },
    ];

    const typeItems = [
        { value: 'all', label: 'All Pages' },
        { value: 'system', label: 'System Pages' },
        { value: 'custom', label: 'Custom Pages' },
    ];

    const sorting: SortingState = [
        { id: filters.sort ?? 'created_at', desc: filters.direction !== 'asc' },
    ];

    const pagination: PaginationState = {
        pageIndex: (pages?.current_page ?? filters.page ?? 1) - 1,
        pageSize: pages?.per_page ?? filters.per_page ?? 15,
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title="Pages" />

            <div className="flex flex-wrap items-start justify-between gap-4">
                <Heading
                    variant="small"
                    title="Pages"
                    description="Manage content pages including system pages and custom pages with SEO metadata."
                />
                {can('pages.create') && (
                    <Link href="/dashboard/pages/create">
                        <Button>
                            <Plus className="mr-2 size-4" />
                            New Page
                        </Button>
                    </Link>
                )}
            </div>

            <Deferred data="pages" fallback={<SkeletonRows />}>
                <DataTable
                    columns={columns}
                    data={pages?.data ?? []}
                    getRowId={(page) => String(page.id)}
                    selectionResetKey={JSON.stringify(filters)}
                    manualFiltering
                    manualSorting
                    manualPagination
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchPlaceholder="Search title, slug..."
                    sorting={sorting}
                    onSortingChange={(next) => {
                        const value = typeof next === 'function' ? next(sorting) : next;
                        visitPages({
                            sort: value[0]?.id ?? 'created_at',
                            direction: value[0]?.desc ? 'desc' : 'asc',
                        });
                    }}
                    pagination={pagination}
                    onPaginationChange={(next) => {
                        const value = typeof next === 'function' ? next(pagination) : next;
                        visitPages({ page: value.pageIndex + 1, per_page: value.pageSize }, false);
                    }}
                    pageCount={pages?.last_page ?? 0}
                    totalRows={pages?.total ?? 0}
                    initialPageSize={pages?.per_page ?? filters.per_page ?? 15}
                    pageSizeOptions={[10, 15, 25, 50]}
                    isLoading={isLoading || pages === undefined}
                    emptyTitle="No pages found"
                    emptyDescription={
                        filters.search
                            ? 'Try adjusting your search query or filters.'
                            : 'Create your first page to get started.'
                    }
                    toolbarFilters={() => (
                        <div className="flex flex-wrap items-center gap-2">
                            <Select
                                items={statusItems}
                                value={filters.status ?? 'all'}
                                onValueChange={(val) => visitPages({ status: val ?? undefined })}
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

                            <Select
                                items={typeItems}
                                value={filters.type ?? 'all'}
                                onValueChange={(val) => visitPages({ type: val ?? undefined })}
                            >
                                <SelectTrigger className="h-9 min-w-36">
                                    <SelectValue placeholder="All Pages" />
                                </SelectTrigger>
                                <SelectContent>
                                    {typeItems.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {(filters.search ||
                                (filters.status && filters.status !== 'all') ||
                                (filters.type && filters.type !== 'all')) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearch('');
                                        visitPages({ search: '', status: 'all', type: 'all' });
                                    }}
                                >
                                    Reset
                                </Button>
                            )}
                        </div>
                    )}
                />
            </Deferred>

            {/* Confirmation Dialog for Page Deletion */}
            <AlertDialog
                open={pageToDelete !== null}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setPageToDelete(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Page?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &ldquo;{pageToDelete?.title}&rdquo;?
                            This action will remove the page and cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={handleConfirmDelete}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Page'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function SkeletonRows() {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-9 w-36" />
                <Skeleton className="h-9 w-36" />
            </div>
            <div className="rounded-md border">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 border-b px-4 py-3 last:border-0">
                        <Skeleton className="h-4 w-56" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-28 ml-auto" />
                    </div>
                ))}
            </div>
        </div>
    );
}

PagesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pages', href: '/dashboard/pages' },
    ],
};
