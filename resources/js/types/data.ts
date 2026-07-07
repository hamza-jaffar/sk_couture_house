export interface CollectionItem {
    id: number;
    collection_id: number;
    piece_title: string;
    peice_title?: string;
    desc: string | null;
    note: string | null;
    gsm: string | null;
    image?: string | null;
}

export interface Collection {
    id: number;
    title: string;
    desc: string;
    category_id: number;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
    items: CollectionItem[]
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