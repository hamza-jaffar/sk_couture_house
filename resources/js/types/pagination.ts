type PaginationLinks = {
    active: boolean;
    label: string;
    page?: null | number;
    url?: null | string;
};

export type PaginationBase = {
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url?: null | string;
    path: string;
    per_page: number;
    prev_page_url?: null | string;
    to: number;
    total: number;
    links: PaginationLinks[];
};
