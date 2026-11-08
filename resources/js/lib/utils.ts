import { Category, GalleryMedia } from "@/types";
import { InertiaLinkProps } from "@inertiajs/react";
import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import {
    Archive,
    FileIcon,
    FileText,
    ImageIcon,
    Music2,
    Video,
} from "lucide-react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps["href"]>): string {
    return typeof url === "string" ? url : url.url;
}

export const galleryCategories: { label: string; value: Category }[] = [
    { label: "All", value: "all" },
    { label: "Images", value: "image" },
    { label: "Docs", value: "document" },
    { label: "Video", value: "video" },
    { label: "Other", value: "other" },
    { label: "Deleted", value: "deleted" },
];

export function mediaIcon(type: GalleryMedia["type"]) {
    switch (type) {
        case "image":
            return ImageIcon;
        case "video":
            return Video;
        case "audio":
            return Music2;
        case "document":
            return FileText;
        case "archive":
            return Archive;
        default:
            return FileIcon;
    }
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    const units = ["KB", "MB", "GB", "TB"];
    let size = bytes / 1024;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex += 1;
    }

    return `${size.toFixed(size < 10 ? 1 : 0)} ${units[unitIndex]}`;
}
