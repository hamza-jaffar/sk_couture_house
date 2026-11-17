import Navbar from '@/components/frontend/navbar';
import type { CartItem } from '@/types/orders';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    Minus,
    Plus,
    ShoppingBag,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    cart: CartItem[];
    cart_total: number;
    cart_count: number;
    currency_icon: string;
    currency: string;
}

export default function CartIndex({
    cart,
    cart_total,
    cart_count,
    currency_icon = 'Rs.',
}: Props) {
    const [updatingKey, setUpdatingKey] = useState<string | null>(null);

    const formatPrice = (amount: number) => {
        return `${currency_icon}${amount.toLocaleString('en-PK', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        })}`;
    };

    const handleUpdateQuantity = (key: string, currentQty: number, change: number) => {
        const newQty = currentQty + change;
        if (newQty < 1) {
            handleRemoveItem(key);
            return;
        }

        setUpdatingKey(key);
        router.patch(
            `/cart/${key}`,
            { quantity: newQty },
            {
                preserveScroll: true,
                onFinish: () => setUpdatingKey(null),
            }
        );
    };

    const handleRemoveItem = (key: string) => {
        setUpdatingKey(key);
        router.delete(`/cart/${key}`, {
            preserveScroll: true,
            onFinish: () => setUpdatingKey(null),
        });
    };

    const handleClearCart = () => {
        if (confirm('Are you sure you want to clear your shopping bag?')) {
            router.delete('/cart', {
                preserveScroll: true,
            });
        }
    };

    return (
        <div className="min-h-screen bg-white text-neutral-900">
            <Head title="Shopping Bag" />
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <nav className="mb-6 flex items-center text-xs tracking-wider text-neutral-500 uppercase">
                    <Link href="/" className="hover:text-black">
                        Home
                    </Link>
                    <span className="mx-2 text-neutral-300">/</span>
                    <span className="text-black">Shopping Bag</span>
                </nav>

                <div className="mb-8 flex items-end justify-between border-b border-neutral-200 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 uppercase sm:text-3xl">
                            Shopping Bag
                        </h1>
                        <p className="mt-1 text-xs tracking-widest text-neutral-500 uppercase">
                            {cart_count} {cart_count === 1 ? 'Item' : 'Items'}
                        </p>
                    </div>

                    {cart.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClearCart}
                            className="text-xs font-semibold tracking-wider text-neutral-500 uppercase hover:text-rose-600 transition-colors"
                        >
                            Clear Bag
                        </button>
                    )}
                </div>

                {cart.length === 0 ? (
                    /* Empty State */
                    <div className="my-16 flex flex-col items-center justify-center text-center">
                        <div className="flex size-20 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                            <ShoppingBag className="size-10 stroke-[1.5]" />
                        </div>
                        <h2 className="mt-6 text-xl font-bold tracking-tight text-neutral-900 uppercase">
                            Your Bag Is Empty
                        </h2>
                        <p className="mt-2 max-w-md text-sm text-neutral-500">
                            Looks like you haven't added anything to your shopping bag yet. Explore our latest luxury collections.
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
                    /* Cart Table & Summary */
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                        {/* Items List */}
                        <div className="lg:col-span-8">
                            <div className="divide-y divide-neutral-200">
                                {cart.map((item) => (
                                    <div
                                        key={item.key}
                                        className={`flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:gap-6 ${
                                            updatingKey === item.key ? 'opacity-60' : ''
                                        }`}
                                    >
                                        {/* Product Image */}
                                        <div className="size-24 shrink-0 overflow-hidden bg-neutral-100 sm:size-28">
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

                                        {/* Details */}
                                        <div className="flex flex-1 flex-col justify-between">
                                            <div>
                                                <div className="flex items-start justify-between">
                                                    <Link
                                                        href={`/products/${item.product_slug}`}
                                                        className="text-base font-semibold text-neutral-900 hover:underline"
                                                    >
                                                        {item.product_title}
                                                    </Link>
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
                                                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-neutral-600">
                                                            {Object.entries(item.selected_options).map(
                                                                ([key, val]) => (
                                                                    <span
                                                                        key={key}
                                                                        className="inline-block bg-neutral-100 px-2 py-0.5"
                                                                    >
                                                                        {key}: <strong className="text-neutral-900">{val}</strong>
                                                                    </span>
                                                                )
                                                            )}
                                                        </div>
                                                    )}

                                                <p className="mt-1 text-xs text-neutral-500">
                                                    Unit Price: {formatPrice(item.unit_price)}
                                                </p>
                                            </div>

                                            {/* Quantity and Remove */}
                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="flex items-center border border-neutral-300">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleUpdateQuantity(item.key, item.quantity, -1)
                                                        }
                                                        disabled={updatingKey === item.key}
                                                        className="flex size-8 items-center justify-center text-neutral-600 hover:bg-neutral-100 hover:text-black transition-colors disabled:opacity-50"
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <Minus className="size-3.5" />
                                                    </button>
                                                    <span className="flex size-8 items-center justify-center text-xs font-semibold text-neutral-900">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleUpdateQuantity(item.key, item.quantity, 1)
                                                        }
                                                        disabled={updatingKey === item.key}
                                                        className="flex size-8 items-center justify-center text-neutral-600 hover:bg-neutral-100 hover:text-black transition-colors disabled:opacity-50"
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus className="size-3.5" />
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(item.key)}
                                                    disabled={updatingKey === item.key}
                                                    className="flex items-center gap-1 text-xs text-neutral-400 hover:text-rose-600 transition-colors"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                    <span>Remove</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8">
                                <Link
                                    href="/collections"
                                    className="text-xs font-semibold tracking-wider text-neutral-600 uppercase underline hover:text-black"
                                >
                                    &larr; Continue Shopping
                                </Link>
                            </div>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-4">
                            <div className="border border-neutral-200 bg-neutral-50/50 p-6">
                                <h2 className="text-sm font-bold tracking-widest text-neutral-900 uppercase">
                                    Order Summary
                                </h2>

                                <div className="mt-6 space-y-3 text-sm">
                                    <div className="flex justify-between text-neutral-600">
                                        <span>Subtotal</span>
                                        <span className="font-semibold text-neutral-900">
                                            {formatPrice(cart_total)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-neutral-600">
                                        <span>Shipping</span>
                                        <span className="font-semibold text-emerald-600 uppercase text-xs">
                                            Complimentary
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-neutral-600">
                                        <span>Estimated Delivery</span>
                                        <span className="text-xs text-neutral-500">
                                            3-5 Business Days
                                        </span>
                                    </div>

                                    <div className="border-t border-neutral-200 pt-4">
                                        <div className="flex justify-between text-base font-bold text-neutral-900">
                                            <span>Total</span>
                                            <span>{formatPrice(cart_total)}</span>
                                        </div>
                                        <p className="mt-1 text-[11px] text-neutral-400">
                                            Includes all applicable taxes and handling.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3">
                                    <Link
                                        href="/checkout"
                                        className="flex w-full items-center justify-center gap-2 bg-neutral-900 py-3.5 text-center text-xs font-bold tracking-widest text-white uppercase hover:bg-black transition-colors"
                                    >
                                        Proceed to Checkout
                                        <ArrowRight className="size-4" />
                                    </Link>
                                    <p className="text-center text-[11px] text-neutral-400">
                                        Cash on Delivery & Secure Payments
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
