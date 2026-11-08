import { download } from "@/actions/Modules/Gallery/Http/Controllers/GalleryController";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { formatFileSize, mediaIcon } from "@/lib/utils";
import type { GalleryMedia, GalleryView } from "@/types";
import { Copy, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

type GalleryFileCardProps = {
    file: GalleryMedia;
    view: GalleryView;
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
};

export default function GalleryFileCard({
    file,
    view,
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
}: GalleryFileCardProps) {
    const Icon = mediaIcon(file.type);
    const isList = view === "list";

    async function copyMediaUrl() {
        if (!file.url) {
            toast.error("This file does not have a public URL.");

            return;
        }

        try {
            const publicUrl = new URL(
                file.url,
                window.location.origin,
            ).toString();
            await navigator.clipboard.writeText(publicUrl);
            toast.success("File URL copied to clipboard.");
        } catch {
            toast.error(
                "Could not copy the file URL. Check clipboard permissions.",
            );
        }
    }

    return (
        <li>
            <Card
                className={
                    isList
                        ? "h-full gap-0 py-0"
                        : "h-full gap-0 overflow-hidden py-0"
                }
            >
                <div
                    className={
                        isList
                            ? "relative flex items-center gap-4 p-3"
                            : "relative"
                    }
                >
                    {file.type === "image" && file.url ? (
                        <img
                            src={file.url}
                            alt={file.original_file_name}
                            loading="lazy"
                            className={
                                isList
                                    ? "size-16 shrink-0 rounded-md bg-muted object-cover"
                                    : "aspect-4/3 w-full bg-muted object-contain"
                            }
                        />
                    ) : (
                        <div
                            className={
                                isList
                                    ? "flex size-16 shrink-0 items-center justify-center rounded-md bg-muted/50"
                                    : "flex aspect-4/3 w-full items-center justify-center bg-muted/50"
                            }
                        >
                            <Icon
                                className={
                                    isList
                                        ? "size-8 text-muted-foreground"
                                        : "size-12 text-muted-foreground"
                                }
                            />
                        </div>
                    )}
                    {isList && (
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
                            <p className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)} ·{" "}
                                {file.created_at.slice(0, 10)}
                            </p>
                        </div>
                    )}
                    {selectable && (
                        <Checkbox
                            checked={selected}
                            onCheckedChange={(checked) =>
                                onSelectionChange(checked === true)
                            }
                            aria-label={`Select ${file.original_file_name}`}
                            className={
                                isList
                                    ? "ml-auto shrink-0"
                                    : "absolute top-3 left-3 size-5 border-background bg-background/90 shadow"
                            }
                        />
                    )}
                </div>
                {!isList && (
                    <CardContent className="flex h-full flex-col gap-3 py-4">
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
                        <FileActions
                            file={file}
                            deleted={deleted}
                            canDelete={canDelete}
                            canRestore={canRestore}
                            canForceDelete={canForceDelete}
                            onDelete={onDelete}
                            onRestore={onRestore}
                            onForceDelete={onForceDelete}
                            onCopyUrl={copyMediaUrl}
                        />
                    </CardContent>
                )}
                {isList && (
                    <div className="flex flex-wrap items-center justify-end gap-2 border-t p-3">
                        {deleted && file.deleted_at && (
                            <p className="mr-auto text-xs text-muted-foreground">
                                Deleted {file.deleted_at.slice(0, 10)}
                            </p>
                        )}
                        <FileActions
                            file={file}
                            deleted={deleted}
                            canDelete={canDelete}
                            canRestore={canRestore}
                            canForceDelete={canForceDelete}
                            onDelete={onDelete}
                            onRestore={onRestore}
                            onForceDelete={onForceDelete}
                            onCopyUrl={copyMediaUrl}
                        />
                    </div>
                )}
            </Card>
        </li>
    );
}

function FileActions({
    file,
    deleted,
    canDelete,
    canRestore,
    canForceDelete,
    onDelete,
    onRestore,
    onForceDelete,
    onCopyUrl,
}: Omit<
    GalleryFileCardProps,
    "view" | "selected" | "selectable" | "onSelectionChange"
> & {
    onCopyUrl: () => void;
}) {
    return (
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
                            onClick={onCopyUrl}
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
    );
}
