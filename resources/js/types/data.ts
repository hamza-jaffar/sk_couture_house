export interface Collection {
    id: number;
    title: string;
    desc: string;
    category_id: number;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: number;
    name: string;
    desc: string;
    collections: Collection[];
    featured_collection: Collection;
    featured_collection_id: number;
    created_at: string;
    updated_at: string;
}