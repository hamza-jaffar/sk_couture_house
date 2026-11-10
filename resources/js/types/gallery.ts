import { ReactElement } from 'react';
import type { PaginationBase } from './pagination';

export type GalleryMedia = {
    uuid: string;
    title: string | null;
    original_file_name: string;
    mime_type: string;
    size: number;
    path?: string | null;
    type: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'other';
    metadata: Record<string, unknown> | null;
    url: string | null;
    created_at: string;
    deleted_at: string | null;
    uploader: {
        id: number;
        name: string;
    } | null;
};

export type PaginatedGalleryMedia = {
    data: GalleryMedia[];
} & PaginationBase;

export type GalleryFilters = {
    search: string;
    category: 'all' | 'image' | 'document' | 'video' | 'other' | 'deleted';
    page: number;
    per_page: number;
};

export type GalleryPageProps = {
    media?: PaginatedGalleryMedia;
    filters: GalleryFilters;
    mode?: 'page';
};

export type GalleryPickerBaseProps = {
    mode: 'dialog';
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: ReactElement;
    initialCategory?: Exclude<Category, 'deleted'>;
    allowedCategories?: Exclude<Category, 'deleted'>[];
};

export type GalleryPickerProps = GalleryPickerBaseProps &
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

export type GalleryProps = GalleryPageProps | GalleryPickerProps;
export type Category = GalleryFilters['category'];
export type GalleryView = 'grid' | 'list';
