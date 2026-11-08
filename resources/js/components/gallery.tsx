import {
    destroy,
    download,
    forceDelete,
    index,
    picker,
    restore,
} from '@/actions/Modules/Gallery/Http/Controllers/GalleryController';
import { AlertDialog } from '@/components/ui/alert-dialog';
import {
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type {
    GalleryFilters,
    GalleryMedia,
    PaginatedGalleryMedia,
} from '@/types';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { Head, InfiniteScroll, router, useHttp } from '@inertiajs/react';
import {
    Archive,
    Copy,
    File as FileIcon,
    FileText,
    Image as ImageIcon,
    Music2,
    Search,
    Trash2,
    Upload,
    Video,
} from 'lucide-react';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import GalleryForm from '@/components/forms/gallery-form';
import { toast } from 'sonner';

type GalleryPageProps = {
    media?: PaginatedGalleryMedia;
    filters: GalleryFilters;
    canUpload: boolean;
    canDelete: boolean;
    canRestore: boolean;
    canForceDelete: boolean;
    mode?: 'page';
};

type GalleryPickerBaseProps = {
    mode: 'dialog';
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: ReactElement;
};

type GalleryPickerProps = GalleryPickerBaseProps &
    (
        | {
              selectionMode: 'single';
              onSelect: (selection: GalleryMedia) => void;
          }
        | {
              selectionMode?: 'multiple';
              onSelect: (selection: GalleryMedia[]) => void;
          }
    );

type GalleryProps = GalleryPageProps | GalleryPickerProps;
type Category = GalleryFilters['category'];

const categories: { label: string; value: Category }[] = [
    { label: 'All', value: 'all' },
    { label: 'Images', value: 'image' },
    { label: 'Docs', value: 'document' },
    { label: 'Video', value: 'video' },
    { label: 'Other', value: 'other' },
    { label: 'Deleted', value: 'deleted' },
];

function mediaIcon(type: GalleryMedia['type']) {
    switch (type) {
        case 'image':
            return ImageIcon;
        case 'video':
            return Video;
        case 'audio':
            return Music2;
        case 'document':
            return FileText;
        case 'archive':
            return Archive;
        default:
            return FileIcon;
    }
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    const units = ['KB', 'MB', 'GB', 'TB'];
    let size = bytes / 1024;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex += 1;
    }

    return `${size.toFixed(size < 10 ? 1 : 0)} ${units[unitIndex]}`;
}

export default function Gallery(props: GalleryProps) {
    if (props.mode === 'dialog') {
        return <GalleryPicker {...props} />;
    }

    return <GalleryManager {...props} />;
}

function GalleryManager({
    media,
    filters,
    canUpload,
    canDelete,
    canRestore,
    canForceDelete,
}: GalleryPageProps) {
    const [activeCategory, setActiveCategory] = useState<Category>(
        filters.category,
    );
    const [search, setSearch] = useState(filters.search);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [selectedUuids, setSelectedUuids] = useState<string[]>([]);
    const [uuidsToPermanentlyDelete, setUuidsToPermanentlyDelete] = useState<
        string[]
    >([]);

    useEffect(() => {
        setActiveCategory(filters.category);
        setSearch(filters.search);
        setSelectedUuids([]);
    }, [filters.category, filters.search]);

    const visitGallery = useCallback(
        (changes: Partial<GalleryFilters>) => {
            const query = {
                ...filters,
                ...changes,
                page: 1,
            };

            router.get(
                index.url({ query }),
                {},
                {
                    only: ['media', 'filters'],
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    reset: ['media'],
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
            visitGallery({ search });
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [filters.search, search, visitGallery]);

    function selectCategory(category: Category) {
        setActiveCategory(category);
        setSelectedUuids([]);
        visitGallery({ category, search });
    }

    function runMutation(
        url: string,
        method: 'delete' | 'post',
        uuids: string[],
    ) {
        const options = {
            preserveScroll: true,
            onSuccess: () => setSelectedUuids([]),
        };

        if (method === 'delete') {
            router.delete(url, { ...options, data: { uuids } });
        } else {
            router.post(url, { uuids }, options);
        }
    }

    function toggleSelection(uuid: string, checked: boolean) {
        setSelectedUuids((selected) => {
            if (checked) {
                return selected.includes(uuid) ? selected : [...selected, uuid];
            }

            return selected.filter((selectedUuid) => selectedUuid !== uuid);
        });
    }

    function finishUpload() {
        setShowUploadForm(false);
        setActiveCategory('all');
        setSearch('');

        router.get(
            index.url({
                query: { ...filters, category: 'all', search: '', page: 1 },
            }),
            {},
            {
                only: ['media', 'filters'],
                preserveState: true,
                preserveScroll: true,
                replace: true,
                reset: ['media'],
            },
        );
    }

    const isDeletedView = activeCategory === 'deleted';
    const visibleCategories = categories.filter(
        ({ value }) =>
            value !== 'deleted' || canDelete || canRestore || canForceDelete,
    );
    const listedMedia = media?.data ?? [];

    return (
        <>
            <Head title={showUploadForm ? 'Upload files' : 'Gallery'} />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {showUploadForm ? 'Upload files' : 'Gallery'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {showUploadForm
                                ? 'Add private files to your gallery.'
                                : 'Browse and manage your uploaded files.'}
                        </p>
                    </div>
                    {canUpload && (
                        <Button
                            type="button"
                            variant={showUploadForm ? 'outline' : 'default'}
                            onClick={() =>
                                setShowUploadForm((visible) => !visible)
                            }
                        >
                            <Upload />
                            {showUploadForm ? 'Back to gallery' : 'Upload'}
                        </Button>
                    )}
                </header>

                {showUploadForm ? (
                    <GalleryForm onUploadSuccess={finishUpload} />
                ) : (
                    <>
                        <nav
                            aria-label="Gallery categories"
                            className="flex flex-wrap gap-2"
                        >
                            {visibleCategories.map(({ label, value }) => (
                                <Button
                                    key={value}
                                    type="button"
                                    variant={
                                        activeCategory === value
                                            ? 'secondary'
                                            : 'ghost'
                                    }
                                    aria-pressed={activeCategory === value}
                                    onClick={() => selectCategory(value)}
                                >
                                    {label}
                                </Button>
                            ))}
                        </nav>

                        <section className="flex flex-col gap-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        {isDeletedView
                                            ? 'Deleted files'
                                            : (categories.find(
                                                  ({ value }) =>
                                                      value === activeCategory,
                                              )?.label ?? 'All files')}
                                    </h2>
                                    {media && (
                                        <p className="text-sm text-muted-foreground">
                                            {media.total}{' '}
                                            {media.total === 1
                                                ? 'file'
                                                : 'files'}
                                        </p>
                                    )}
                                </div>
                                <div className="relative w-full sm:max-w-xs">
                                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.currentTarget.value)
                                        }
                                        placeholder="Search files..."
                                        aria-label="Search gallery files"
                                        className="pl-9"
                                    />
                                </div>
                            </div>

                            {(canDelete ||
                                (isDeletedView &&
                                    (canRestore || canForceDelete))) &&
                                selectedUuids.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
                                        <span className="mr-auto text-sm text-muted-foreground">
                                            {selectedUuids.length} selected
                                        </span>
                                        {isDeletedView ? (
                                            <>
                                                {canRestore && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() =>
                                                            runMutation(
                                                                restore.url(),
                                                                'post',
                                                                selectedUuids,
                                                            )
                                                        }
                                                    >
                                                        Restore selected
                                                    </Button>
                                                )}
                                                {canForceDelete && (
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        onClick={() =>
                                                            setUuidsToPermanentlyDelete(
                                                                selectedUuids,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 />
                                                        Delete permanently
                                                    </Button>
                                                )}
                                            </>
                                        ) : (
                                            canDelete && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        runMutation(
                                                            destroy.url(),
                                                            'delete',
                                                            selectedUuids,
                                                        )
                                                    }
                                                >
                                                    <Trash2 />
                                                    Move to trash
                                                </Button>
                                            )
                                        )}
                                    </div>
                                )}

                            {!media ? (
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {Array.from({ length: 8 }, (_, item) => (
                                        <Skeleton
                                            key={item}
                                            className="h-32 rounded-xl"
                                        />
                                    ))}
                                </div>
                            ) : listedMedia.length === 0 ? (
                                <div className="rounded-xl border border-dashed p-10 text-center">
                                    <FileIcon className="mx-auto size-8 text-muted-foreground" />
                                    <p className="mt-3 font-medium">
                                        {filters.search
                                            ? 'No matching files'
                                            : isDeletedView
                                              ? 'The trash is empty'
                                              : 'No files uploaded yet'}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {filters.search
                                            ? 'Try another search.'
                                            : isDeletedView
                                              ? 'Deleted files will appear here.'
                                              : 'Uploaded files will appear here.'}
                                    </p>
                                </div>
                            ) : (
                                <InfiniteScroll data="media" buffer={400}>
                                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {listedMedia.map((file) => (
                                            <GalleryFileCard
                                                key={file.uuid}
                                                file={file}
                                                selected={selectedUuids.includes(
                                                    file.uuid,
                                                )}
                                                selectable={
                                                    isDeletedView
                                                        ? canRestore ||
                                                          canForceDelete
                                                        : canDelete
                                                }
                                                onSelectionChange={(checked) =>
                                                    toggleSelection(
                                                        file.uuid,
                                                        checked,
                                                    )
                                                }
                                                deleted={isDeletedView}
                                                canDelete={canDelete}
                                                canRestore={canRestore}
                                                canForceDelete={canForceDelete}
                                                onDelete={() =>
                                                    runMutation(
                                                        destroy.url(),
                                                        'delete',
                                                        [file.uuid],
                                                    )
                                                }
                                                onRestore={() =>
                                                    runMutation(
                                                        restore.url(),
                                                        'post',
                                                        [file.uuid],
                                                    )
                                                }
                                                onForceDelete={() =>
                                                    setUuidsToPermanentlyDelete(
                                                        [file.uuid],
                                                    )
                                                }
                                            />
                                        ))}
                                    </ul>
                                </InfiniteScroll>
                            )}
                        </section>
                    </>
                )}

                <AlertDialog
                    open={uuidsToPermanentlyDelete.length > 0}
                    onOpenChange={(open) => {
                        if (!open) {
                            setUuidsToPermanentlyDelete([]);
                        }
                    }}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Permanently delete files?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                This permanently removes{' '}
                                {uuidsToPermanentlyDelete.length === 1
                                    ? 'this file'
                                    : `${uuidsToPermanentlyDelete.length} files`}{' '}
                                and cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                onClick={() => setUuidsToPermanentlyDelete([])}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                variant="destructive"
                                onClick={() => {
                                    runMutation(
                                        forceDelete.url(),
                                        'delete',
                                        uuidsToPermanentlyDelete,
                                    );
                                    setUuidsToPermanentlyDelete([]);
                                }}
                            >
                                Delete permanently
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </main>
        </>
    );
}

function GalleryFileCard({
    file,
    selected,
    selectable,
    onSelectionChange,
    deleted,
    canDelete,
    canRestore,
    canForceDelete,
    onDelete,
    onRestore,
    onForceDelete,
}: {
    file: GalleryMedia;
    selected: boolean;
    selectable: boolean;
    onSelectionChange: (checked: boolean) => void;
    deleted: boolean;
    canDelete: boolean;
    canRestore: boolean;
    canForceDelete: boolean;
    onDelete: () => void;
    onRestore: () => void;
    onForceDelete: () => void;
}) {
    const Icon = mediaIcon(file.type);

    async function copyMediaUrl() {
        if (!file.url) {
            toast.error('This file does not have a public URL.');

            return;
        }

        try {
            const publicUrl = new URL(
                file.url,
                window.location.origin,
            ).toString();
            await navigator.clipboard.writeText(publicUrl);
            toast.success('File URL copied to clipboard.');
        } catch {
            toast.error(
                'Could not copy the file URL. Check clipboard permissions.',
            );
        }
    }

    return (
        <li>
            <Card className="h-full gap-0 py-0">
                <div className="relative">
                    {file.type === 'image' && file.url ? (
                        <img
                            src={file.url}
                            alt={file.original_file_name}
                            loading="lazy"
                            className="aspect-[4/3] w-full bg-muted object-contain"
                        />
                    ) : (
                        <div className="flex aspect-[4/3] w-full items-center justify-center bg-muted/50">
                            <Icon className="size-12 text-muted-foreground" />
                        </div>
                    )}
                    {selectable && (
                        <Checkbox
                            checked={selected}
                            onCheckedChange={(checked) =>
                                onSelectionChange(checked === true)
                            }
                            aria-label={`Select ${file.original_file_name}`}
                            className="absolute top-3 left-3 size-5 border-background bg-background/90 shadow"
                        />
                    )}
                </div>
                <CardContent className="flex h-full flex-col gap-3 py-4">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="min-w-0 flex-1">
                            <p
                                className="truncate font-medium"
                                title={file.original_file_name}
                            >
                                {file.original_file_name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                                {file.mime_type}
                            </p>
                        </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <time dateTime={file.created_at}>
                            {file.created_at.slice(0, 10)}
                        </time>
                    </div>
                    {deleted && file.deleted_at && (
                        <p className="text-xs text-muted-foreground">
                            Deleted {file.deleted_at.slice(0, 10)}
                        </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                        {!deleted && (
                            <>
                                <a
                                    href={download.url(file.uuid)}
                                    className="inline-flex h-8 flex-1 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                                >
                                    <Upload className="size-4 rotate-180" />
                                    Download
                                </a>
                                {file.url && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        aria-label={`Copy URL for ${file.original_file_name}`}
                                        title="Copy public URL"
                                        onClick={copyMediaUrl}
                                    >
                                        <Copy />
                                    </Button>
                                )}
                            </>
                        )}
                        {deleted ? (
                            <>
                                {canRestore && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={onRestore}
                                    >
                                        Restore
                                    </Button>
                                )}
                                {canForceDelete && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        aria-label={`Permanently delete ${file.original_file_name}`}
                                        onClick={onForceDelete}
                                    >
                                        <Trash2 />
                                    </Button>
                                )}
                            </>
                        ) : (
                            canDelete && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Move ${file.original_file_name} to trash`}
                                    onClick={onDelete}
                                >
                                    <Trash2 />
                                </Button>
                            )
                        )}
                    </div>
                </CardContent>
            </Card>
        </li>
    );
}

type PickerResponse = PaginatedGalleryMedia;

function GalleryPicker(props: GalleryPickerProps) {
    const { open, onOpenChange, trigger } = props;
    const selectionMode = props.selectionMode ?? 'multiple';
    const [internalOpen, setInternalOpen] = useState(false);
    const [category, setCategory] = useState<Category>('all');
    const [search, setSearch] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<
        Record<string, GalleryMedia>
    >({});
    const [files, setFiles] = useState<GalleryMedia[]>([]);
    const [pagination, setPagination] = useState<PaginatedGalleryMedia | null>(
        null,
    );
    const [requestError, setRequestError] = useState<string | null>(null);
    const requestId = useRef(0);
    const { get, processing } = useHttp<Record<string, never>, PickerResponse>(
        {},
    );
    const isOpen = open ?? internalOpen;

    const setDialogOpen = useCallback(
        (nextOpen: boolean) => {
            setInternalOpen(nextOpen);
            onOpenChange?.(nextOpen);
        },
        [onOpenChange],
    );

    const loadFiles = useCallback(
        (page: number, append: boolean) => {
            const currentRequestId = ++requestId.current;
            setRequestError(null);

            void get(
                picker.url({
                    query: {
                        category,
                        search,
                        page,
                        per_page: 24,
                    },
                }),
                {
                    onSuccess: (response) => {
                        if (currentRequestId !== requestId.current) {
                            return;
                        }

                        setFiles((current) =>
                            append
                                ? [...current, ...response.data]
                                : response.data,
                        );
                        setPagination(response);
                    },
                    onHttpException: () => {
                        if (currentRequestId === requestId.current) {
                            setRequestError('Unable to load gallery files.');
                        }
                    },
                    onNetworkError: () => {
                        if (currentRequestId === requestId.current) {
                            setRequestError(
                                'A network error prevented loading files.',
                            );
                        }
                    },
                },
            ).catch(() => {
                if (currentRequestId === requestId.current) {
                    setRequestError('Unable to load gallery files.');
                }
            });
        },
        [category, get, search],
    );

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const timeout = window.setTimeout(
            () => loadFiles(1, false),
            search ? 250 : 0,
        );

        return () => window.clearTimeout(timeout);
    }, [category, isOpen, loadFiles, search]);

    function toggleFile(file: GalleryMedia, checked: boolean) {
        setSelectedFiles((current) => {
            const next = selectionMode === 'single' ? {} : { ...current };

            if (checked) {
                next[file.uuid] = file;
            } else {
                delete next[file.uuid];
            }

            return next;
        });
    }

    const selected = Object.values(selectedFiles);

    return (
        <DialogPrimitive.Root open={isOpen} onOpenChange={setDialogOpen}>
            <DialogPrimitive.Trigger
                render={
                    trigger ?? (
                        <Button type="button" variant="outline">
                            Browse gallery
                        </Button>
                    )
                }
            />
            <DialogPrimitive.Portal>
                <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 supports-backdrop-filter:backdrop-blur-xs" />
                <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-[min(96vw,72rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-hidden rounded-xl border bg-background p-4 text-foreground shadow-lg outline-none sm:p-6">
                    <header className="flex flex-col gap-1">
                        <DialogPrimitive.Title className="text-lg font-semibold">
                            Select from gallery
                        </DialogPrimitive.Title>
                        <DialogPrimitive.Description className="text-sm text-muted-foreground">
                            {selectionMode === 'single'
                                ? 'Choose one file.'
                                : 'Choose one or more files.'}
                        </DialogPrimitive.Description>
                    </header>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <nav
                            aria-label="Gallery categories"
                            className="flex flex-wrap gap-1"
                        >
                            {categories
                                .filter(({ value }) => value !== 'deleted')
                                .map(({ label, value }) => (
                                    <Button
                                        key={value}
                                        type="button"
                                        size="sm"
                                        variant={
                                            category === value
                                                ? 'secondary'
                                                : 'ghost'
                                        }
                                        aria-pressed={category === value}
                                        onClick={() => setCategory(value)}
                                    >
                                        {label}
                                    </Button>
                                ))}
                        </nav>
                        <Input
                            value={search}
                            onChange={(event) =>
                                setSearch(event.currentTarget.value)
                            }
                            placeholder="Search files..."
                            aria-label="Search gallery files"
                            className="sm:max-w-xs"
                        />
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        {requestError ? (
                            <div className="rounded-lg border border-destructive/40 p-6 text-center text-sm text-destructive">
                                {requestError}
                            </div>
                        ) : files.length === 0 && processing ? (
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                {Array.from({ length: 8 }, (_, item) => (
                                    <Skeleton
                                        key={item}
                                        className="h-28 rounded-xl"
                                    />
                                ))}
                            </div>
                        ) : files.length === 0 ? (
                            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                                No files match this selection.
                            </p>
                        ) : (
                            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {files.map((file) => {
                                    const Icon = mediaIcon(file.type);

                                    return (
                                        <li key={file.uuid}>
                                            <label className="flex h-full cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/40">
                                                <Checkbox
                                                    checked={
                                                        file.uuid in
                                                        selectedFiles
                                                    }
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        toggleFile(
                                                            file,
                                                            checked === true,
                                                        )
                                                    }
                                                    aria-label={`Select ${file.original_file_name}`}
                                                    className="mt-1"
                                                />
                                                {file.type === 'image' &&
                                                file.url ? (
                                                    <img
                                                        src={file.url}
                                                        alt=""
                                                        loading="lazy"
                                                        className="size-12 shrink-0 rounded-md bg-muted object-cover"
                                                    />
                                                ) : (
                                                    <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                                                )}
                                                <span className="min-w-0">
                                                    <span
                                                        className="block truncate text-sm font-medium"
                                                        title={
                                                            file.original_file_name
                                                        }
                                                    >
                                                        {
                                                            file.original_file_name
                                                        }
                                                    </span>
                                                    <span className="block truncate text-xs text-muted-foreground">
                                                        {file.mime_type}
                                                    </span>
                                                    <span className="block text-xs text-muted-foreground">
                                                        {formatFileSize(
                                                            file.size,
                                                        )}
                                                    </span>
                                                </span>
                                            </label>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                        {pagination &&
                            pagination.current_page < pagination.last_page && (
                                <div className="flex justify-center p-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={processing}
                                        onClick={() =>
                                            loadFiles(
                                                pagination.current_page + 1,
                                                true,
                                            )
                                        }
                                    >
                                        {processing
                                            ? 'Loading...'
                                            : 'Load more'}
                                    </Button>
                                </div>
                            )}
                    </div>
                    <footer className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                        <p className="text-sm text-muted-foreground">
                            {selected.length} selected
                        </p>
                        <div className="flex gap-2">
                            <DialogPrimitive.Close
                                render={
                                    <Button type="button" variant="outline" />
                                }
                            >
                                Cancel
                            </DialogPrimitive.Close>
                            <Button
                                type="button"
                                disabled={selected.length === 0}
                                onClick={() => {
                                    if (props.selectionMode === 'single') {
                                        const file = selected[0];

                                        if (file) {
                                            props.onSelect(file);
                                        }
                                    } else {
                                        props.onSelect(selected);
                                    }

                                    setDialogOpen(false);
                                }}
                            >
                                Use selected
                            </Button>
                        </div>
                    </footer>
                </DialogPrimitive.Popup>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
