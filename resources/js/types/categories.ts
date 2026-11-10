import type { PaginationBase } from './pagination';

export type CategoryParentOption = {
    id: number;
    parent_id: number | null;
    name: string;
    slug: string;
    deleted_at: string | null;
};

export type CollectionCategory = {
    id: number;
    parent_id: number | null;
    name: string;
    slug: string;
    description: string | null;
    image_path: string | null;
    image_url: string | null;
    banner_path: string | null;
    banner_url: string | null;
    is_active: boolean;
    is_featured: boolean;
    meta_title: string | null;
    meta_description: string | null;
    meta_keywords: string | null;
    children_count: number;
    parent: Pick<
        CategoryParentOption,
        'id' | 'name' | 'slug' | 'deleted_at'
    > | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type PaginatedCategories = {
    data: CollectionCategory[];
} & PaginationBase;

export type CategoryFilters = {
    search: string;
    parent: string;
    status: 'active' | 'deleted';
    sort: string;
    direction: 'asc' | 'desc';
    page: number;
    per_page: number;
};
