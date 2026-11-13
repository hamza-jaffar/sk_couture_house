import type { PaginationBase } from './pagination';

export type DiscountTypeOption = {
    value: 'percentage' | 'fixed';
    label: string;
};

export type Coupon = {
    id: number;
    code: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_type_label: string;
    discount_value: string;
    min_spend: string | null;
    max_discount: string | null;
    usage_limit: number | null;
    usage_limit_per_user: number | null;
    times_used: number;
    starts_at: string | null;
    expires_at: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type PaginatedCoupons = {
    data: Coupon[];
} & PaginationBase;

export type CouponFilters = {
    search: string;
    discount_type: string;
    status: 'active' | 'deleted';
    sort: string;
    direction: 'asc' | 'desc';
    page: number;
    per_page: number;
};
