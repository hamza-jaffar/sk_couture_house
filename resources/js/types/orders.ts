export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';

export type OrderType = 'direct' | 'whatsapp';

export type CartItem = {
    key: string;
    product_id: number;
    product_title: string;
    product_slug: string;
    variant_id: number | null;
    sku: string | null;
    selected_options: Record<string, string> | null;
    unit_price: number;
    quantity: number;
    total_price: number;
    image_url: string | null;
    order_type: OrderType;
};

export type OrderItem = {
    id: number;
    product_id: number | null;
    product_title: string;
    product_slug: string;
    sku: string | null;
    selected_options: Record<string, string> | null;
    quantity: number;
    unit_price: number;
    total_price: number;
    image_url: string | null;
};

export type ShippingAddress = {
    line1: string;
    city: string;
    region?: string | null;
    postal_code?: string | null;
    country: string;
};

export type Order = {
    id: number;
    order_number: string;
    type: OrderType;
    status: OrderStatus;
    status_label: string;
    status_color: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    shipping_address: ShippingAddress | null;
    notes: string | null;
    subtotal: number;
    total: number;
    currency: string;
    currency_icon: string;
    payment_status: string;
    payment_method: string | null;
    metadata?: Record<string, unknown> | null;
    items_count?: number;
    items: OrderItem[];
    created_at: string;
    created_at_human?: string;
};

export type OrderFilters = {
    status?: string;
    payment_status?: string;
    type?: string;
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
};

export type OrderStatusOption = {
    value: string;
    label: string;
    color: string;
};

export type PaginatedOrders = {
    data: Order[];
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
