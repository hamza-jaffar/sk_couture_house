import type { PaginationBase } from './pagination';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export type ReviewStatusOption = {
    value: ReviewStatus;
    label: string;
};

export type ProductReview = {
    id: number;
    product_id: number;
    product: {
        id: number;
        title: string;
        slug: string;
        price: string;
    };
    user_id: number | null;
    user?: {
        id: number;
        name: string;
        email: string;
    } | null;
    author_name: string | null;
    author_email: string | null;
    reviewer_display_name: string;
    reviewer_display_email: string | null;
    rating: number;
    title: string | null;
    comment: string;
    status: ReviewStatus;
    status_label: string;
    admin_response: string | null;
    responded_at: string | null;
    responder?: {
        id: number;
        name: string;
    } | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type PaginatedReviews = {
    data: ProductReview[];
} & PaginationBase;

export type ReviewFilters = {
    search: string;
    status: string;
    rating: string;
    sort: string;
    direction: 'asc' | 'desc';
    page: number;
    per_page: number;
};
