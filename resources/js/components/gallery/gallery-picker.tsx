import { picker } from '@/actions/Modules/Gallery/Http/Controllers/GalleryController';
import GalleryForm from '@/components/forms/gallery-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import type {
    Category,
    GalleryMedia,
    GalleryPickerProps,
    PaginatedGalleryMedia,
} from '@/types';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { useHttp } from '@inertiajs/react';
import { Upload } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import GalleryPickerItem from './gallery-picker-item';
import GalleryViewToggle, { type GalleryView } from './gallery-view-toggle';
import { galleryCategories } from '@/lib/utils';
import { useCan } from '@/hooks/use-can';

export default function GalleryPicker(props: GalleryPickerProps) {
    const can = useCan();
    const {
        open,
        onOpenChange,
        initialCategory = 'all',
        allowedCategories,
    } = props;
    const selectionMode = props.selectionMode ?? 'multiple';
    const [internalOpen, setInternalOpen] = useState(false);
    const [category, setCategory] = useState<Category>(initialCategory);
    const [search, setSearch] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<
        Record<string, GalleryMedia>
    >({});
    const [files, setFiles] = useState<GalleryMedia[]>([]);
    const [pagination, setPagination] = useState<PaginatedGalleryMedia | null>(
        null,
    );
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [requestError, setRequestError] = useState<string | null>(null);
    const [view, setView] = useState<GalleryView>('list');
    const requestId = useRef(0);
    const { get, processing } = useHttp<
        Record<string, never>,
        PaginatedGalleryMedia
    >({});
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

    function selectUploadedFiles(uploadedFiles: GalleryMedia[]) {
        const filesToSelect =
            selectionMode === 'single'
                ? uploadedFiles.slice(0, 1)
                : uploadedFiles;

        setSelectedFiles((current) => {
            const next = selectionMode === 'single' ? {} : { ...current };

            for (const file of filesToSelect) {
                next[file.uuid] = file;
            }

            return next;
        });
        setFiles((current) => [
            ...uploadedFiles,
            ...current.filter(
                (file) =>
                    !uploadedFiles.some(
                        (uploadedFile) => uploadedFile.uuid === file.uuid,
                    ),
            ),
        ]);
        setCategory(initialCategory);
        setSearch('');
        setShowUploadForm(false);
    }

    const selected = Object.values(selectedFiles);
    const listClassName =
        view === 'grid'
            ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'flex flex-col gap-3';

    return (
        <DialogPrimitive.Root open={isOpen} onOpenChange={setDialogOpen}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 supports-backdrop-filter:backdrop-blur-xs" />
                <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 flex h-[90vh] max-h-[90vh] w-[min(96vw,72rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-hidden rounded-xl border bg-background p-4 text-foreground shadow-lg outline-none sm:p-6">
                    <header className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 flex-col gap-1">
                            <DialogPrimitive.Title className="text-lg font-semibold">
                                Select from gallery
                            </DialogPrimitive.Title>
                            <DialogPrimitive.Description className="text-sm text-muted-foreground">
                                {selectionMode === 'single'
                                    ? 'Choose one file.'
                                    : 'Choose one or more files.'}
                            </DialogPrimitive.Description>
                        </div>
                        {!showUploadForm && can('gallery.upload') && (
                            <Button
                                type="button"
                                className="shrink-0"
                                onClick={() => setShowUploadForm(true)}
                            >
                                <Upload />
                                Upload files
                            </Button>
                        )}
                        {showUploadForm && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowUploadForm(false)}
                            >
                                Back to files
                            </Button>
                        )}
                    </header>
                    {!showUploadForm && (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <nav
                                aria-label="Gallery categories"
                                className="flex flex-wrap gap-1"
                            >
                                {galleryCategories
                                    .filter(
                                        ({ value }) =>
                                            value !== 'deleted' &&
                                            (allowedCategories === undefined ||
                                                allowedCategories.includes(
                                                    value,
                                                )),
                                    )
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
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.currentTarget.value)
                                    }
                                    placeholder="Search files..."
                                    aria-label="Search gallery files"
                                    className="sm:max-w-xs"
                                />
                                <GalleryViewToggle
                                    value={view}
                                    onChange={setView}
                                />
                            </div>
                        </div>
                    )}
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        {showUploadForm ? (
                            <GalleryForm
                                maxFiles={selectionMode === 'single' ? 1 : 10}
                                onUploadSuccess={selectUploadedFiles}
                            />
                        ) : requestError ? (
                            <div className="rounded-lg border border-destructive/40 p-6 text-center text-sm text-destructive">
                                {requestError}
                            </div>
                        ) : files.length === 0 && processing ? (
                            <div className={listClassName}>
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
                            <ul className={listClassName}>
                                {files.map((file) => (
                                    <GalleryPickerItem
                                        key={file.uuid}
                                        file={file}
                                        view={view}
                                        selected={file.uuid in selectedFiles}
                                        onToggle={(checked) =>
                                            toggleFile(file, checked)
                                        }
                                    />
                                ))}
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
