import Navbar from '@/components/frontend/navbar';
import type { Order } from '@/types/orders';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Check, Package, ShoppingBag, Truck } from 'lucide-react';

interface Props {
    order: Order;
}

export default function CheckoutSuccess({ order }: Props) {
    const formatPrice = (amount: number) => {
        return `${order.currency_icon ?? 'Rs.'}${amount.toLocaleString('en-PK', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <div className="min-h-screen bg-neutral-50/50 text-neutral-900">
            <Head title={`Order Confirmed - #${order.order_number}`} />
            <Navbar />

            <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Confirmation Header */}
                <div className="border border-neutral-200 bg-white p-8 text-center shadow-xs">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <Check className="size-7 stroke-[2.5]" />
                    </div>

                    <h1 className="mt-6 text-2xl font-bold tracking-tight text-neutral-900 uppercase sm:text-3xl">
                        Order Confirmed
                    </h1>

                    <p className="mt-2 text-sm text-neutral-600">
                        Thank you for shopping with SK Couture House. We have sent a confirmation email to{' '}
                        <strong className="text-neutral-900">{order.customer_email}</strong>.
                    </p>

                    <div className="mt-6 inline-block border border-neutral-200 bg-neutral-50 px-6 py-3">
                        <span className="text-xs uppercase tracking-widest text-neutral-500">
                            Order Reference
                        </span>
                        <p className="text-lg font-bold tracking-wider text-neutral-900">
                            {order.order_number}
                        </p>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href="/collections"
                            className="inline-flex items-center gap-2 bg-neutral-900 px-6 py-3 text-xs font-bold tracking-widest text-white uppercase hover:bg-black transition-colors"
                        >
                            Continue Shopping
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                </div>

                {/* Order Details Card */}
                <div className="mt-8 border border-neutral-200 bg-white p-8">
                    <h2 className="text-xs font-bold tracking-widest text-neutral-900 uppercase pb-4 border-b border-neutral-200">
                        Order Details
                    </h2>

                    {/* Items table */}
                    <div className="mt-4 divide-y divide-neutral-200">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between py-4">
                                <div className="flex items-center gap-4">
                                    <div className="size-16 shrink-0 overflow-hidden bg-neutral-100">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.product_title}
                                                className="h-full w-full object-cover object-top"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[8px] uppercase tracking-wider text-neutral-400">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-neutral-900">
                                            {item.product_title}
                                        </p>
                                        {item.selected_options && (
                                            <p className="text-xs text-neutral-500">
                                                {Object.entries(item.selected_options)
                                                    .map(([k, v]) => `${k}: ${v}`)
                                                    .join(' | ')}
                                            </p>
                                        )}
                                        <p className="text-xs text-neutral-500">
                                            Qty: {item.quantity} &times; {formatPrice(item.unit_price)}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-neutral-900">
                                    {formatPrice(item.total_price)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Financial Summary */}
                    <div className="mt-6 border-t border-neutral-200 pt-4 space-y-2 text-sm">
                        <div className="flex justify-between text-neutral-600">
                            <span>Subtotal</span>
                            <span className="font-semibold text-neutral-900">
                                {formatPrice(order.subtotal)}
                            </span>
                        </div>
                        <div className="flex justify-between text-neutral-600">
                            <span>Shipping</span>
                            <span className="font-semibold text-emerald-600 uppercase text-xs">
                                Complimentary
                            </span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-neutral-900 border-t border-neutral-200 pt-3">
                            <span>Total</span>
                            <span>{formatPrice(order.total)}</span>
                        </div>
                    </div>

                    {/* Delivery & Payment details grid */}
                    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 border-t border-neutral-200 pt-6 text-xs">
                        <div>
                            <span className="font-bold uppercase tracking-wider text-neutral-500">
                                Shipping Address
                            </span>
                            <p className="mt-2 text-sm font-medium text-neutral-900">
                                {order.customer_name}
                            </p>
                            {order.shipping_address && (
                                <p className="text-neutral-600 leading-relaxed">
                                    {order.shipping_address.line1}
                                    <br />
                                    {order.shipping_address.city}
                                    {order.shipping_address.region && `, ${order.shipping_address.region}`}
                                    {order.shipping_address.postal_code && ` ${order.shipping_address.postal_code}`}
                                    <br />
                                    {order.shipping_address.country}
                                </p>
                            )}
                            <p className="mt-1 text-neutral-600">
                                Phone: {order.customer_phone ?? 'N/A'}
                            </p>
                        </div>

                        <div>
                            <span className="font-bold uppercase tracking-wider text-neutral-500">
                                Payment Details
                            </span>
                            <p className="mt-2 text-sm font-medium text-neutral-900 uppercase">
                                {order.payment_method?.replace(/_/g, ' ') ?? 'Cash on Delivery'}
                            </p>
                            <p className="mt-1 text-neutral-600">
                                Payment Status:{' '}
                                <span className="font-semibold capitalize text-neutral-900">
                                    {order.payment_status}
                                </span>
                            </p>
                            <p className="mt-1 text-neutral-600">
                                Fulfillment Status:{' '}
                                <span className="font-semibold capitalize text-neutral-900">
                                    {order.status_label}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
