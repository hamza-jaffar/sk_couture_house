import {
    destroy,
    forceDelete,
    index,
    restore,
} from "@/actions/Modules/Gallery/Http/Controllers/GalleryController";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import GalleryForm from "@/components/forms/gallery-form";
import { useCan } from "@/hooks/use-can";
import type { Category, GalleryFilters, GalleryPageProps } from "@/types";
import { Head, InfiniteScroll, router } from "@inertiajs/react";
import { File as FileIcon, Search, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import GalleryFileCard from "./gallery-file-card";
import GalleryViewToggle, { type GalleryView } from "./gallery-view-toggle";
import { galleryCategories } from "@/lib/utils";
import Heading from "../heading";

export default function GalleryManager({ media, filters }: GalleryPageProps) {
    const can = useCan();
    const [activeCategory, setActiveCategory] = useState<Category>(
        filters.category,
    );
    const [search, setSearch] = useState(filters.search);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [selectedUuids, setSelectedUuids] = useState<string[]>([]);
    const [uuidsToPermanentlyDelete, setUuidsToPermanentlyDelete] = useState<
        string[]
    >([]);
    const [view, setView] = useState<GalleryView>("list");

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
                    only: ["media", "filters"],
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    reset: ["media"],
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
        method: "delete" | "post",
        uuids: string[],
    ) {
        const options = {
            preserveScroll: true,
            onSuccess: () => setSelectedUuids([]),
        };

        if (method === "delete") {
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
        setActiveCategory("all");
        setSearch("");

        router.get(
            index.url({
                query: { ...filters, category: "all", search: "", page: 1 },
            }),
            {},
            {
                only: ["media", "filters"],
                preserveState: true,
                preserveScroll: true,
                replace: true,
                reset: ["media"],
            },
        );
    }

    const isDeletedView = activeCategory === "deleted";
    const visibleCategories = galleryCategories.filter(
        ({ value }) =>
            value !== "deleted" ||
            can("gallery.delete") ||
            can("gallery.restore") ||
            can("gallery.force-delete"),
    );
    const listedMedia = media?.data ?? [];
    const listClassName =
        view === "grid"
            ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "flex flex-col gap-3";

    return (
        <>
            <Head title={showUploadForm ? "Upload files" : "Gallery"} />
            <main className="flex flex-1 flex-col gap-2 p-4 md:p-6">
                <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <Heading
                        title={showUploadForm ? "Upload files" : "Gallery"}
                        description={
                            showUploadForm
                                ? "Add private files to your gallery."
                                : "Browse and manage your uploaded files."
                        }
                    />
                    {can("gallery.upload") && (
                        <Button
                            type="button"
                            variant={showUploadForm ? "outline" : "default"}
                            onClick={() =>
                                setShowUploadForm((visible) => !visible)
                            }
                        >
                            <Upload />
                            {showUploadForm ? "Back to gallery" : "Upload"}
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
                                            ? "secondary"
                                            : "ghost"
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
                                            ? "Deleted files"
                                            : (galleryCategories.find(
                                                  ({ value }) =>
                                                      value === activeCategory,
                                              )?.label ?? "All files")}
                                    </h2>
                                    {media && (
                                        <p className="text-sm text-muted-foreground">
                                            {media.total}{" "}
                                            {media.total === 1
                                                ? "file"
                                                : "files"}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <div className="relative w-full sm:max-w-xs">
                                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            value={search}
                                            onChange={(event) =>
                                                setSearch(
                                                    event.currentTarget.value,
                                                )
                                            }
                                            placeholder="Search files..."
                                            aria-label="Search gallery files"
                                            className="pl-9"
                                        />
                                    </div>
                                    <GalleryViewToggle
                                        value={view}
                                        onChange={setView}
                                    />
                                </div>
                            </div>

                            {(can("gallery.delete") ||
                                (isDeletedView &&
                                    (can("gallery.restore") ||
                                        can("gallery.force-delete")))) &&
                                selectedUuids.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
                                        <span className="mr-auto text-sm text-muted-foreground">
                                            {selectedUuids.length} selected
                                        </span>
                                        {isDeletedView ? (
                                            <>
                                                {can("gallery.restore") && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() =>
                                                            runMutation(
                                                                restore.url(),
                                                                "post",
                                                                selectedUuids,
                                                            )
                                                        }
                                                    >
                                                        Restore selected
                                                    </Button>
                                                )}
                                                {can(
                                                    "gallery.force-delete",
                                                ) && (
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
                                            can("gallery.delete") && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        runMutation(
                                                            destroy.url(),
                                                            "delete",
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
                                <div className={listClassName}>
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
                                            ? "No matching files"
                                            : isDeletedView
                                              ? "The trash is empty"
                                              : "No files uploaded yet"}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {filters.search
                                            ? "Try another search."
                                            : isDeletedView
                                              ? "Deleted files will appear here."
                                              : "Uploaded files will appear here."}
                                    </p>
                                </div>
                            ) : (
                                <InfiniteScroll data="media" buffer={400}>
                                    <ul className={listClassName}>
                                        {listedMedia.map((file) => (
                                            <GalleryFileCard
                                                key={file.uuid}
                                                file={file}
                                                view={view}
                                                selected={selectedUuids.includes(
                                                    file.uuid,
                                                )}
                                                selectable={
                                                    isDeletedView
                                                        ? can(
                                                              "gallery.restore",
                                                          ) ||
                                                          can(
                                                              "gallery.force-delete",
                                                          )
                                                        : can("gallery.delete")
                                                }
                                                onSelectionChange={(checked) =>
                                                    toggleSelection(
                                                        file.uuid,
                                                        checked,
                                                    )
                                                }
                                                deleted={isDeletedView}
                                                canDelete={can(
                                                    "gallery.delete",
                                                )}
                                                canRestore={can(
                                                    "gallery.restore",
                                                )}
                                                canForceDelete={can(
                                                    "gallery.force-delete",
                                                )}
                                                onDelete={() =>
                                                    runMutation(
                                                        destroy.url(),
                                                        "delete",
                                                        [file.uuid],
                                                    )
                                                }
                                                onRestore={() =>
                                                    runMutation(
                                                        restore.url(),
                                                        "post",
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
                                This permanently removes{" "}
                                {uuidsToPermanentlyDelete.length === 1
                                    ? "this file"
                                    : `${uuidsToPermanentlyDelete.length} files`}{" "}
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
                                        "delete",
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
