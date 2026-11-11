import type { PaginationBase } from './pagination';

export type ProductVariantOption = {
    name: string;
    values: string[];
};

export type ProductVariantInventory = {
    id?: number;
    sku: string;
    name: string;
    price: string | null;
    sale_price: string | null;
    stock: number;
    attributes: Record<string, string>;
    image: string | null;
};

export type ProductImage = {
    path: string;
    url: string | null;
};

export type ProductRecord = {
    id: number;
    title: string;
    slug: string;
    short_description: string | null;
    description: string | null;
    price: string;
    sale_price: string | null;
    sale_start_at: string | null;
    sale_end_at: string | null;
    sku: string | null;
    stock: number;
    type: 'simple' | 'variable';
    status: 'draft' | 'published' | 'archived';
    is_featured: boolean;
    category_id: number | null;
    category: { id: number; name: string; slug: string } | null;
    images: ProductImage[];
    variant_options: ProductVariantOption[] | null;
    variants: ProductVariantInventory[];
    variants_count: number;
    meta_title: string | null;
    meta_description: string | null;
    meta_keywords: string | null;
    canonical_url: string | null;
    og_title: string | null;
    og_description: string | null;
    og_image: string | null;
    og_image_url: string | null;
    robots_meta: string;
    created_at: string;
    deleted_at: string | null;
};

export type PaginatedProducts = {
    data: ProductRecord[];
} & PaginationBase;

export type ProductFilters = {
    search: string;
    category: string;
    type: 'all' | 'simple' | 'variable';
    status: 'all' | 'draft' | 'published' | 'archived' | 'deleted';
    sort: 'title' | 'price' | 'stock' | 'status' | 'created_at';
    direction: 'asc' | 'desc';
    page: number;
    per_page: number;
};

export type ProductVariantPreset = {
    id: string;
    name: string;
    values: string[];
};

export type ProductFormOptions = {
    categories: { id: number; name: string; slug: string }[];
    variant_presets: ProductVariantPreset[];
    currency: string;
    currency_icon: string;
};
