export type CustomerRow = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    shipping_address: Record<string, string> | null;
    is_active: boolean;
    orders_count: number;
    total_spent: number;
    email_verified_at: string | null;
    created_at: string;
    created_at_human: string;
};

export type CustomerFilters = {
    search?: string;
    status?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
};

export type PaginatedCustomers = {
    data: CustomerRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
};
