import type { CartItem } from '@/types/orders';
import { Link, router } from '@inertiajs/react';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    cartTotal: number;
    currencyIcon?: string;
}

export default function CartDrawer({
    isOpen,
    onClose,
    cart = [],
    cartTotal = 0,
    currencyIcon = 'Rs.',
}: Props) {
    const [updatingKey, setUpdatingKey] = useState<string | null>(null);

    const formatPrice = (amount: number) => {
        return `${currencyIcon}${amount.toLocaleString('en-PK', {
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

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
                onClick={onClose}
            />

            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
                <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="size-5 text-neutral-900" />
                            <h2 className="text-sm font-bold tracking-widest text-neutral-900 uppercase">
                                Shopping Bag ({cart.reduce((acc, i) => acc + i.quantity, 0)})
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1 text-neutral-400 hover:text-black transition-colors"
                            aria-label="Close bag"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Items List */}
                    <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-neutral-200">
                        {cart.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-center py-12">
                                <ShoppingBag className="size-12 text-neutral-300 stroke-[1.5]" />
                                <p className="mt-4 text-sm font-bold uppercase tracking-wider text-neutral-900">
                                    Your bag is empty
                                </p>
                                <p className="mt-1 text-xs text-neutral-500">
                                    Add your favorite luxury pieces to get started.
                                </p>
                                <Link
                                    href="/collections"
                                    onClick={onClose}
                                    className="mt-6 bg-neutral-900 px-6 py-2.5 text-xs font-bold tracking-widest text-white uppercase hover:bg-black transition-colors"
                                >
                                    Browse Collections
                                </Link>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div
                                    key={item.key}
                                    className={`flex gap-4 py-4 ${
                                        updatingKey === item.key ? 'opacity-60' : ''
                                    }`}
                                >
                                    <div className="size-20 shrink-0 overflow-hidden bg-neutral-100">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.product_title}
                                                className="h-full w-full object-cover object-top"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[9px] uppercase tracking-wider text-neutral-400">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-1 flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <Link
                                                    href={`/products/${item.product_slug}`}
                                                    onClick={onClose}
                                                    className="text-xs font-bold text-neutral-900 line-clamp-1 hover:underline"
                                                >
                                                    {item.product_title}
                                                </Link>
                                                <span className="text-xs font-bold text-neutral-900">
                                                    {formatPrice(item.total_price)}
                                                </span>
                                            </div>

                                            {item.selected_options &&
                                                Object.keys(item.selected_options).length > 0 && (
                                                    <p className="mt-0.5 text-[11px] text-neutral-500">
                                                        {Object.entries(item.selected_options)
                                                            .map(([k, v]) => `${k}: ${v}`)
                                                            .join(' | ')}
                                                    </p>
                                                )}
                                        </div>

                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center border border-neutral-300">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleUpdateQuantity(item.key, item.quantity, -1)
                                                    }
                                                    disabled={updatingKey === item.key}
                                                    className="flex size-6 items-center justify-center text-neutral-600 hover:bg-neutral-100"
                                                >
                                                    <Minus className="size-3" />
                                                </button>
                                                <span className="flex size-6 items-center justify-center text-[11px] font-semibold">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleUpdateQuantity(item.key, item.quantity, 1)
                                                    }
                                                    disabled={updatingKey === item.key}
                                                    className="flex size-6 items-center justify-center text-neutral-600 hover:bg-neutral-100"
                                                >
                                                    <Plus className="size-3" />
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(item.key)}
                                                className="text-[11px] text-neutral-400 hover:text-rose-600 flex items-center gap-1"
                                            >
                                                <Trash2 className="size-3" />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {cart.length > 0 && (
                        <div className="border-t border-neutral-200 bg-neutral-50 p-6 space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-neutral-600 uppercase text-xs tracking-wider">
                                    Subtotal
                                </span>
                                <span className="text-base font-bold text-neutral-900">
                                    {formatPrice(cartTotal)}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                <Link
                                    href="/checkout"
                                    onClick={onClose}
                                    className="flex w-full items-center justify-center gap-2 bg-neutral-900 py-3 text-xs font-bold tracking-widest text-white uppercase hover:bg-black transition-colors"
                                >
                                    Checkout
                                    <ArrowRight className="size-4" />
                                </Link>
                                <Link
                                    href="/cart"
                                    onClick={onClose}
                                    className="block w-full py-2.5 text-center text-xs font-semibold tracking-wider text-neutral-700 uppercase border border-neutral-300 hover:bg-white transition-colors"
                                >
                                    View Full Bag
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
