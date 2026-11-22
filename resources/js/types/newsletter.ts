export type NewsletterSubscriber = {
    id: number;
    email: string;
    status: 'subscribed' | 'unsubscribed';
    ip_address: string | null;
    subscribed_at: string | null;
    unsubscribed_at: string | null;
    created_at: string;
};

export type PaginatedSubscribers = {
    data: NewsletterSubscriber[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

export type NewsletterFilters = {
    search: string;
    status: 'all' | 'subscribed' | 'unsubscribed';
    sort: 'created_at' | 'subscribed_at' | 'email';
    direction: 'asc' | 'desc';
    page: number;
    per_page: number;
};
