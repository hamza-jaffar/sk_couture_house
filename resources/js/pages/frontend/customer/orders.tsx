import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Package, ShoppingBag } from 'lucide-react';

interface OrderItemPreview {
    id: number;
    product_title: string;
    product_slug: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    image_url: string | null;
}

interface Order {
    id: number;
    order_number: string;
    type: string;
    status: string;
    status_label: string;
    status_color: string;
    customer_name: string;
    customer_email: string;
    total: number;
    currency_icon: string;
    created_at: string;
    created_at_human: string;
    items_count: number;
    items?: OrderItemPreview[];
}

interface PaginatorLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedOrders {
    data: Order[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginatorLink[];
}

interface Props {
    orders: PaginatedOrders;
}

export default function CustomerOrders({ orders }: Props) {
    const formatPrice = (icon: string, amount: number) => {
        return `${icon || 'Rs.'}${amount.toLocaleString('en-PK', {
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
                className={`inline-flex items-center gap-1.5 border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${badgeClass}`}
            >
                <span className="size-1.5 rounded-full bg-current" />
                {label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-white text-neutral-900">
            <Head title="My Orders — SK Couture House" />

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
                    <span className="text-black">Order History</span>
                </nav>

                {/* Page Header */}
                <div className="mb-8 flex flex-col justify-between gap-4 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 uppercase sm:text-3xl">
                            Order History
                        </h1>
                        <p className="mt-1 text-xs tracking-widest text-neutral-500 uppercase">
                            {orders.total} {orders.total === 1 ? 'Order' : 'Orders'} Placed
                        </p>
                    </div>

                    <Link
                        href="/customer/account"
                        className="text-xs font-semibold tracking-wider text-neutral-600 uppercase underline hover:text-black"
                    >
                        &larr; Back to Account
                    </Link>
                </div>

                {orders.data.length === 0 ? (
                    /* Empty State */
                    <div className="my-16 flex flex-col items-center justify-center text-center">
                        <div className="flex size-20 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                            <ShoppingBag className="size-10 stroke-[1.5]" />
                        </div>
                        <h2 className="mt-6 text-xl font-bold tracking-tight text-neutral-900 uppercase">
                            No Orders Yet
                        </h2>
                        <p className="mt-2 max-w-md text-sm text-neutral-500">
                            You have not placed any orders with this account yet. Discover our latest couture pieces.
                        </p>
                        <Link
                            href="/collections"
                            className="mt-8 inline-flex items-center gap-2 bg-neutral-900 px-8 py-3.5 text-xs font-bold tracking-widest text-white uppercase hover:bg-black transition-colors"
                        >
                            Explore Collections
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                ) : (
                    /* Orders Table & Cards */
                    <div className="space-y-6">
                        <div className="divide-y divide-neutral-200 border border-neutral-200 bg-white">
                            {orders.data.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex flex-col gap-6 p-6 transition-colors hover:bg-neutral-50/50 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    {/* Order Info & Item Previews */}
                                    <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                                        <div className="flex size-14 shrink-0 items-center justify-center bg-neutral-100 text-neutral-500">
                                            <Package className="size-6 stroke-[1.5]" />
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="font-mono text-sm font-bold text-neutral-900">
                                                    {order.order_number}
                                                </span>
                                                {getStatusBadge(order.status_color, order.status_label)}
                                            </div>

                                            <p className="text-xs text-neutral-500">
                                                Placed {order.created_at_human} &bull; {order.items_count}{' '}
                                                {order.items_count === 1 ? 'item' : 'items'}
                                            </p>

                                            {order.items && order.items.length > 0 && (
                                                <p className="text-xs text-neutral-600 line-clamp-1">
                                                    {order.items.map((i) => i.product_title).join(', ')}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Price & Action */}
                                    <div className="flex items-center justify-between gap-6 border-t border-neutral-100 pt-4 sm:border-t-0 sm:pt-0">
                                        <div className="text-right">
                                            <p className="text-xs font-medium text-neutral-500 uppercase">
                                                Total
                                            </p>
                                            <p className="text-base font-bold text-neutral-900">
                                                {formatPrice(order.currency_icon, order.total)}
                                            </p>
                                        </div>

                                        <Link
                                            href={`/customer/orders/${order.order_number}`}
                                            className="inline-flex items-center gap-1.5 border border-neutral-900 px-4 py-2 text-xs font-bold tracking-widest text-neutral-900 uppercase hover:bg-neutral-900 hover:text-white transition-colors"
                                        >
                                            View
                                            <ArrowRight className="size-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Links */}
                        {orders.last_page > 1 && (
                            <div className="flex items-center justify-center gap-1 pt-6">
                                {orders.links.map((link, idx) => {
                                    if (!link.url) {
                                        return (
                                            <span
                                                key={idx}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className="px-3 py-2 text-xs text-neutral-300 select-none"
                                            />
                                        );
                                    }

                                    return (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            preserveScroll
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-2 text-xs font-semibold tracking-wider transition-colors ${
                                                link.active
                                                    ? 'bg-neutral-900 text-white'
                                                    : 'border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                                            }`}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
