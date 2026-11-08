import type { PaginationBase } from './pagination';

export type GalleryMedia = {
    uuid: string;
    title: string | null;
    original_file_name: string;
    mime_type: string;
    size: number;
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
