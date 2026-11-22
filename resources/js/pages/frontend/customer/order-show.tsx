import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    MapPin,
    Package,
    ShieldCheck,
    Tag,
    Truck,
} from 'lucide-react';

interface OrderItem {
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
}

interface ShippingAddress {
    line1?: string;
    city?: string;
    region?: string;
    postal_code?: string;
    country?: string;
}

interface OrderDetail {
    id: number;
    order_number: string;
    type: string;
    status: string;
    status_label: string;
    status_color: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: ShippingAddress | null;
    notes: string | null;
    subtotal: number;
    discount_amount: number;
    coupon_code: string | null;
    total: number;
    currency: string;
    currency_icon: string;
    payment_status: string;
    payment_method: string;
    items_count: number;
    items: OrderItem[];
    created_at: string;
    created_at_human: string;
}

interface Props {
    order: OrderDetail;
}

export default function CustomerOrderShow({ order }: Props) {
    const formatPrice = (amount: number) => {
        return `${order.currency_icon || 'Rs.'}${amount.toLocaleString('en-PK', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        })}`;
    };

    const getStatusBadge = (color: string, label: string) => {
        const colorClasses: Record<string, string> = {
            amber: 'bg-amber-50 text-amber-700 border-amber-200',
            blue: 'bg-blue-50 text-blue-700 border-blue-200',
            indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            purple: 'bg-purple-50 text-purple-700 border-purple-200',
            emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            rose: 'bg-rose-50 text-rose-700 border-rose-200',
            zinc: 'bg-zinc-100 text-zinc-700 border-zinc-200',
        };

        const badgeClass = colorClasses[color] ?? colorClasses.zinc;

        return (
            <span
                className={`inline-flex items-center gap-1.5 border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${badgeClass}`}
            >
                <span className="size-1.5 rounded-full bg-current" />
                {label}
            </span>
        );
    };

    const addr = order.shipping_address;

    return (
        <div className="min-h-screen bg-white text-neutral-900">
            <Head title={`Order ${order.order_number} — SK Couture House`} />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <nav className="mb-6 flex items-center text-xs tracking-wider text-neutral-500 uppercase">
                    <Link href="/" className="hover:text-black">
                        Home
                    </Link>
                    <span className="mx-2 text-neutral-300">/</span>
                    <Link href="/customer/account" className="hover:text-black">
                        Client Account
                    </Link>
                    <span className="mx-2 text-neutral-300">/</span>
                    <Link href="/customer/orders" className="hover:text-black">
                        Orders
                    </Link>
                    <span className="mx-2 text-neutral-300">/</span>
                    <span className="text-black font-mono">{order.order_number}</span>
                </nav>

                {/* Top Banner / Order Title */}
                <div className="mb-8 flex flex-col justify-between gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="font-mono text-2xl font-bold tracking-tight text-neutral-900 uppercase sm:text-3xl">
                                {order.order_number}
                            </h1>
                            {getStatusBadge(order.status_color, order.status_label)}
                        </div>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-neutral-500">
                            <Clock className="size-3.5" />
                            Placed on {new Date(order.created_at).toLocaleDateString('en-PK', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            })} ({order.created_at_human})
                        </p>
                    </div>

                    <Link
                        href="/customer/orders"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-neutral-600 uppercase underline hover:text-black"
                    >
                        <ArrowLeft className="size-3.5" />
                        Back to Orders
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    {/* Left: Items & Delivery Details */}
                    <div className="space-y-8 lg:col-span-8">
                        {/* Items Section */}
                        <div className="border border-neutral-200 bg-white">
                            <div className="border-b border-neutral-200 px-6 py-4">
                                <h2 className="text-sm font-bold tracking-widest text-neutral-900 uppercase">
                                    Ordered Items ({order.items_count})
                                </h2>
                            </div>

                            <div className="divide-y divide-neutral-200">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:gap-6"
                                    >
                                        <div className="size-20 shrink-0 overflow-hidden bg-neutral-100 sm:size-24">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.product_title}
                                                    className="h-full w-full object-cover object-top"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-wider text-neutral-400">
                                                    No Image
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-1 flex-col justify-between">
                                            <div>
                                                <div className="flex items-start justify-between">
                                                    {item.product_slug ? (
                                                        <Link
                                                            href={`/products/${item.product_slug}`}
                                                            className="text-sm font-semibold text-neutral-900 hover:underline"
                                                        >
                                                            {item.product_title}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-sm font-semibold text-neutral-900">
                                                            {item.product_title}
                                                        </span>
                                                    )}
                                                    <span className="text-sm font-bold text-neutral-900">
                                                        {formatPrice(item.total_price)}
                                                    </span>
                                                </div>

                                                {item.sku && (
                                                    <p className="mt-0.5 text-xs text-neutral-400">
                                                        SKU: {item.sku}
                                                    </p>
                                                )}

                                                {item.selected_options &&
                                                    Object.keys(item.selected_options).length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-neutral-600">
                                                            {Object.entries(item.selected_options).map(
                                                                ([key, val]) => (
                                                                    <span
                                                                        key={key}
                                                                        className="inline-block bg-neutral-100 px-2 py-0.5"
                                                                    >
                                                                        {key}:{' '}
                                                                        <strong className="text-neutral-900">
                                                                            {val}
                                                                        </strong>
                                                                    </span>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                            </div>

                                            <p className="mt-3 text-xs text-neutral-500">
                                                Qty: {item.quantity} &times; {formatPrice(item.unit_price)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery & Customer Info */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Shipping Address */}
                            <div className="border border-neutral-200 bg-white p-6">
                                <div className="mb-4 flex items-center gap-2 border-b border-neutral-200 pb-3">
                                    <MapPin className="size-4 text-neutral-700" />
                                    <h3 className="text-xs font-bold tracking-widest text-neutral-900 uppercase">
                                        Delivery Destination
                                    </h3>
                                </div>

                                <div className="space-y-1 text-sm text-neutral-700">
                                    <p className="font-semibold text-neutral-900">
                                        {order.customer_name}
                                    </p>
                                    {addr?.line1 && <p>{addr.line1}</p>}
                                    <p>
                                        {[addr?.city, addr?.region, addr?.postal_code]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </p>
                                    <p>{addr?.country || 'Pakistan'}</p>

                                    {order.customer_phone && (
                                        <p className="mt-3 pt-2 border-t border-neutral-100 text-xs text-neutral-500">
                                            Phone: {order.customer_phone}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Payment & Fulfillment Details */}
                            <div className="border border-neutral-200 bg-white p-6">
                                <div className="mb-4 flex items-center gap-2 border-b border-neutral-200 pb-3">
                                    <Truck className="size-4 text-neutral-700" />
                                    <h3 className="text-xs font-bold tracking-widest text-neutral-900 uppercase">
                                        Fulfillment & Payment
                                    </h3>
                                </div>

                                <div className="space-y-3 text-xs text-neutral-700">
                                    <div>
                                        <p className="font-medium text-neutral-500 uppercase">
                                            Payment Method
                                        </p>
                                        <p className="mt-0.5 font-semibold text-neutral-900 uppercase">
                                            {order.payment_method.replace(/_/g, ' ')}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="font-medium text-neutral-500 uppercase">
                                            Payment Status
                                        </p>
                                        <p className="mt-0.5 font-semibold text-neutral-900 uppercase">
                                            {order.payment_status}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="font-medium text-neutral-500 uppercase">
                                            Order Channel
                                        </p>
                                        <p className="mt-0.5 font-semibold text-neutral-900 uppercase">
                                            {order.type} checkout
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Notes */}
                        {order.notes && (
                            <div className="border border-neutral-200 bg-white p-6">
                                <h3 className="mb-2 text-xs font-bold tracking-widest text-neutral-900 uppercase">
                                    Special Instructions / Notes
                                </h3>
                                <p className="text-sm text-neutral-600 whitespace-pre-line">
                                    {order.notes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right: Summary Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 border border-neutral-200 bg-neutral-50/50 p-6">
                            <h2 className="text-sm font-bold tracking-widest text-neutral-900 uppercase">
                                Payment Breakdown
                            </h2>

                            <div className="mt-6 space-y-3 text-sm">
                                <div className="flex justify-between text-neutral-600">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-neutral-900">
                                        {formatPrice(order.subtotal)}
                                    </span>
                                </div>

                                {order.discount_amount > 0 && (
                                    <div className="flex justify-between text-rose-600">
                                        <span className="flex items-center gap-1.5">
                                            <Tag className="size-3.5" />
                                            Coupon {order.coupon_code && `(${order.coupon_code})`}
                                        </span>
                                        <span className="font-semibold">
                                            −{formatPrice(order.discount_amount)}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between text-neutral-600">
                                    <span>Shipping</span>
                                    <span className="font-semibold text-emerald-600 uppercase text-xs">
                                        Complimentary
                                    </span>
                                </div>

                                <div className="border-t border-neutral-200 pt-4">
                                    <div className="flex justify-between text-base font-bold text-neutral-900">
                                        <span>Total Paid / Due</span>
                                        <span>{formatPrice(order.total)}</span>
                                    </div>
                                    <p className="mt-1 text-[11px] text-neutral-400">
                                        Inclusive of all taxes and atelier packaging.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 border-t border-neutral-200 pt-6 space-y-3">
                                <div className="flex items-center gap-2 text-xs text-neutral-600">
                                    <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                                    <span>Verified Authentic Couture</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-neutral-600">
                                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                                    <span>Client Concierge Support Available</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
