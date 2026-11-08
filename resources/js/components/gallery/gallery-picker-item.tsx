import { Checkbox } from "@/components/ui/checkbox";
import { formatFileSize, mediaIcon } from "@/lib/utils";
import type { GalleryMedia, GalleryView } from "@/types";

type GalleryPickerItemProps = {
    file: GalleryMedia;
    selected: boolean;
    view: GalleryView;
    onToggle: (checked: boolean) => void;
};

export default function GalleryPickerItem({
    file,
    selected,
    view,
    onToggle,
}: GalleryPickerItemProps) {
    const Icon = mediaIcon(file.type);

    return (
        <li>
            <label
                className={
                    view === "grid"
                        ? "flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border transition-colors hover:bg-muted/40"
                        : "flex h-full cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/40"
                }
            >
                {view === "grid" ? (
                    <>
                        <div className="relative flex aspect-4/3 w-full items-center justify-center bg-muted/50">
                            {file.type === "image" && file.url ? (
                                <img
                                    src={file.url}
                                    alt=""
                                    loading="lazy"
                                    className="size-full object-contain"
                                />
                            ) : (
                                <Icon className="size-12 text-muted-foreground" />
                            )}
                            <Checkbox
                                checked={selected}
                                onCheckedChange={(checked) =>
                                    onToggle(checked === true)
                                }
                                aria-label={`Select ${file.original_file_name}`}
                                className="absolute top-3 left-3 size-5 border-background bg-background/90 shadow"
                            />
                        </div>
                        <span className="flex min-w-0 flex-1 flex-col gap-1 p-3">
                            <span
                                className="truncate text-sm font-medium"
                                title={file.original_file_name}
                            >
                                {file.original_file_name}
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                                {file.mime_type}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                            </span>
                        </span>
                    </>
                ) : (
                    <>
                        <Checkbox
                            checked={selected}
                            onCheckedChange={(checked) =>
                                onToggle(checked === true)
                            }
                            aria-label={`Select ${file.original_file_name}`}
                        />
                        {file.type === "image" && file.url ? (
                            <img
                                src={file.url}
                                alt=""
                                loading="lazy"
                                className="size-12 shrink-0 rounded-md bg-muted object-cover"
                            />
                        ) : (
                            <Icon className="size-6 shrink-0 text-muted-foreground" />
                        )}
                        <span className="min-w-0 flex-1">
                            <span
                                className="block truncate text-sm font-medium"
                                title={file.original_file_name}
                            >
                                {file.original_file_name}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                                {file.mime_type}
                            </span>
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                        </span>
                    </>
                )}
            </label>
        </li>
    );
}
