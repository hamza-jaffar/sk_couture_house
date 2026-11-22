export type Banner = {
    id: number;
    title: string | null;
    subtitle: string | null;
    description: string | null;
    media_type: 'image' | 'video';
    media_path: string;
    media_url: string | null;
    button_text: string | null;
    button_url: string | null;
    secondary_button_text: string | null;
    secondary_button_url: string | null;
    text_position: 'left' | 'center' | 'right';
    text_color: 'light' | 'dark';
    sort_order: number;
    is_active: boolean;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
};

export type PaginatedBanners = {
    data: Banner[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

export type BannerFilters = {
    search: string;
    status: 'all' | 'active' | 'inactive' | 'trash';
    media_type: 'all' | 'image' | 'video';
    sort: 'sort_order' | 'created_at' | 'title';
    direction: 'asc' | 'desc';
    page: number;
    per_page: number;
};
