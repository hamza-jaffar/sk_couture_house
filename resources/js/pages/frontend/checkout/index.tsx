import Navbar from '@/components/frontend/navbar';
import SeoHead from '@/components/frontend/seo-head';
import type { PlatformSettings } from '@/types';
import type { CartItem } from '@/types/orders';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Lock, ShieldCheck, Tag, Truck, X } from 'lucide-react';
import { type FormEventHandler, useState } from 'react';

interface Props {
    cart: CartItem[];
    cart_total: number;
    cart_count: number;
    cart_discount: number;
    cart_final_total: number;
    applied_coupon?: {
        id: number;
        code: string;
        discount_type: string;
        discount_value: number;
        discount_amount: number;
    } | null;
    prefill?: {
        name: string;
        email: string;
        phone: string;
        shipping_address: {
            line1: string;
            city: string;
            region: string;
            postal_code: string;
            country: string;
        };
    } | null;
    currency_icon: string;
    currency: string;
    user?: {
        name: string;
        email: string;
    } | null;
}

export default function CheckoutIndex({
    cart,
    cart_total,
    cart_discount,
    cart_final_total,
    applied_coupon,
    prefill,
    currency_icon = 'Rs.',
    user,
}: Props) {
    const { settings } = usePage<{ settings?: PlatformSettings }>().props;
    const seoTitle = settings?.seo?.checkout_title || 'Checkout';
    const seoDescription = settings?.seo?.checkout_description;

    const { data, setData, post, processing, errors } = useForm({
        customer_name: prefill?.name ?? user?.name ?? '',
        customer_email: prefill?.email ?? user?.email ?? '',
        customer_phone: prefill?.phone ?? '',
        shipping_address: {
            line1: prefill?.shipping_address?.line1 ?? '',
            city: prefill?.shipping_address?.city ?? '',
            region: prefill?.shipping_address?.region ?? '',
            postal_code: prefill?.shipping_address?.postal_code ?? '',
            country: prefill?.shipping_address?.country ?? 'Pakistan',
        },
        payment_method: 'cash_on_delivery',
        notes: '',
    });

    const [couponCode, setCouponCode] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);
    const [couponError, setCouponError] = useState<string | null>(null);
    const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

    const formatPrice = (amount: number) => {
        return `${currency_icon}${amount.toLocaleString('en-PK', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        })}`;
    };

    const handleApplyCoupon = () => {
        if (!couponCode.trim()) {
            setCouponError('Please enter a promo code.');
            return;
        }
        setCouponError(null);
        setCouponSuccess(null);
        setApplyingCoupon(true);
        router.post(
            '/cart/coupon',
            {
                code: couponCode.trim(),
                email: data.customer_email || undefined,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setCouponSuccess('Promo code applied successfully!');
                    setCouponError(null);
                    setCouponCode('');
                },
                onError: (errs: any) => {
                    const msg = errs.code || errs.coupon || Object.values(errs)[0] || 'Unable to apply promo code.';
                    setCouponError(typeof msg === 'string' ? msg : 'Unable to apply promo code.');
                    setCouponSuccess(null);
                },
                onFinish: () => {
                    setApplyingCoupon(false);
                },
            }
        );
    };

    const handleRemoveCoupon = () => {
        setCouponError(null);
        setCouponSuccess(null);
        router.delete('/cart/coupon/remove', {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/checkout');
    };

    return (
        <div className="min-h-screen bg-neutral-50/50 text-neutral-900">
            <SeoHead title={seoTitle} description={seoDescription} robots="noindex, follow" />
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <nav className="mb-6 flex items-center text-xs tracking-wider text-neutral-500 uppercase">
                    <Link href="/cart" className="hover:text-black">
                        Bag
                    </Link>
                    <span className="mx-2 text-neutral-300">/</span>
                    <span className="text-black font-semibold">Checkout</span>
                    <span className="mx-2 text-neutral-300">/</span>
                    <span className="text-neutral-400">Confirmation</span>
                </nav>

                <h1 className="mb-8 text-2xl font-bold tracking-tight text-neutral-900 uppercase sm:text-3xl">
                    Secure Checkout
                </h1>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
                    {/* Checkout Form */}
                    <div className="lg:col-span-7">
                        <form onSubmit={submit} className="space-y-8 bg-white p-6 sm:p-8 border border-neutral-200">
                            {/* Contact Details */}
                            <div>
                                <h2 className="text-sm font-bold tracking-widest text-neutral-900 uppercase pb-3 border-b border-neutral-200">
                                    1. Contact Information
                                </h2>

                                <div className="mt-4 space-y-4">
                                    <div>
                                        <label
                                            htmlFor="customer_name"
                                            className="block text-xs font-semibold uppercase tracking-wider text-neutral-700"
                                        >
                                            Full Name *
                                        </label>
                                        <input
                                            id="customer_name"
                                            type="text"
                                            value={data.customer_name}
                                            onChange={(e) => setData('customer_name', e.target.value)}
                                            placeholder="Ayesha Khan"
                                            required
                                            className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
                                        />
                                        {errors.customer_name && (
                                            <p className="mt-1 text-xs text-rose-600">
                                                {errors.customer_name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="customer_email"
                                                className="block text-xs font-semibold uppercase tracking-wider text-neutral-700"
                                            >
                                                Email Address *
                                            </label>
                                            <input
                                                id="customer_email"
                                                type="email"
                                                value={data.customer_email}
                                                onChange={(e) => setData('customer_email', e.target.value)}
                                                placeholder="ayesha@example.com"
                                                required
                                                className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
                                            />
                                            {errors.customer_email && (
                                                <p className="mt-1 text-xs text-rose-600">
                                                    {errors.customer_email}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="customer_phone"
                                                className="block text-xs font-semibold uppercase tracking-wider text-neutral-700"
                                            >
                                                Phone Number *
                                            </label>
                                            <input
                                                id="customer_phone"
                                                type="tel"
                                                value={data.customer_phone}
                                                onChange={(e) => setData('customer_phone', e.target.value)}
                                                placeholder="0300 1234567"
                                                required
                                                className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
                                            />
                                            {errors.customer_phone && (
                                                <p className="mt-1 text-xs text-rose-600">
                                                    {errors.customer_phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Details */}
                            <div>
                                <h2 className="text-sm font-bold tracking-widest text-neutral-900 uppercase pb-3 border-b border-neutral-200">
                                    2. Delivery Address
                                </h2>

                                <div className="mt-4 space-y-4">
                                    <div>
                                        <label
                                            htmlFor="address_line1"
                                            className="block text-xs font-semibold uppercase tracking-wider text-neutral-700"
                                        >
                                            Street Address / House / Flat *
                                        </label>
                                        <input
                                            id="address_line1"
                                            type="text"
                                            value={data.shipping_address.line1}
                                            onChange={(e) =>
                                                setData('shipping_address', {
                                                    ...data.shipping_address,
                                                    line1: e.target.value,
                                                })
                                            }
                                            placeholder="House 12, Street 4, Phase 5, DHA"
                                            required
                                            className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
                                        />
                                        {errors['shipping_address.line1'] && (
                                            <p className="mt-1 text-xs text-rose-600">
                                                {errors['shipping_address.line1']}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="city"
                                                className="block text-xs font-semibold uppercase tracking-wider text-neutral-700"
                                            >
                                                City *
                                            </label>
                                            <input
                                                id="city"
                                                type="text"
                                                value={data.shipping_address.city}
                                                onChange={(e) =>
                                                    setData('shipping_address', {
                                                        ...data.shipping_address,
                                                        city: e.target.value,
                                                    })
                                                }
                                                placeholder="Lahore, Karachi, Islamabad..."
                                                required
                                                className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
                                            />
                                            {errors['shipping_address.city'] && (
                                                <p className="mt-1 text-xs text-rose-600">
                                                    {errors['shipping_address.city']}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="region"
                                                className="block text-xs font-semibold uppercase tracking-wider text-neutral-700"
                                            >
                                                State / Province
                                            </label>
                                            <input
                                                id="region"
                                                type="text"
                                                value={data.shipping_address.region ?? ''}
                                                onChange={(e) =>
                                                    setData('shipping_address', {
                                                        ...data.shipping_address,
                                                        region: e.target.value,
                                                    })
                                                }
                                                placeholder="Punjab, Sindh..."
                                                className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="postal_code"
                                                className="block text-xs font-semibold uppercase tracking-wider text-neutral-700"
                                            >
                                                Postal / ZIP Code
                                            </label>
                                            <input
                                                id="postal_code"
                                                type="text"
                                                value={data.shipping_address.postal_code ?? ''}
                                                onChange={(e) =>
                                                    setData('shipping_address', {
                                                        ...data.shipping_address,
                                                        postal_code: e.target.value,
                                                    })
                                                }
                                                placeholder="54000"
                                                className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="country"
                                                className="block text-xs font-semibold uppercase tracking-wider text-neutral-700"
                                            >
                                                Country
                                            </label>
                                            <input
                                                id="country"
                                                type="text"
                                                value={data.shipping_address.country}
                                                onChange={(e) =>
                                                    setData('shipping_address', {
                                                        ...data.shipping_address,
                                                        country: e.target.value,
                                                    })
                                                }
                                                className="mt-1 block w-full border border-neutral-300 bg-neutral-100 px-3 py-2 text-sm text-neutral-600 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <h2 className="text-sm font-bold tracking-widest text-neutral-900 uppercase pb-3 border-b border-neutral-200">
                                    3. Payment Method
                                </h2>

                                <div className="mt-4 space-y-3">
                                    <label
                                        className={`flex cursor-pointer items-center justify-between border p-4 transition-colors ${
                                            data.payment_method === 'cash_on_delivery'
                                                ? 'border-neutral-900 bg-neutral-50/50'
                                                : 'border-neutral-200 hover:border-neutral-400'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="payment_method"
                                                value="cash_on_delivery"
                                                checked={data.payment_method === 'cash_on_delivery'}
                                                onChange={(e) => setData('payment_method', e.target.value)}
                                                className="text-neutral-900 focus:ring-black"
                                            />
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                                                    Cash On Delivery (COD)
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    Pay in cash when your luxury parcel arrives at your doorstep.
                                                </p>
                                            </div>
                                        </div>
                                        <Truck className="size-5 text-neutral-600 shrink-0" />
                                    </label>

                                    <label
                                        className={`flex cursor-pointer items-center justify-between border p-4 transition-colors ${
                                            data.payment_method === 'bank_transfer'
                                                ? 'border-neutral-900 bg-neutral-50/50'
                                                : 'border-neutral-200 hover:border-neutral-400'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="payment_method"
                                                value="bank_transfer"
                                                checked={data.payment_method === 'bank_transfer'}
                                                onChange={(e) => setData('payment_method', e.target.value)}
                                                className="text-neutral-900 focus:ring-black"
                                            />
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                                                    Direct Bank Transfer
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    Transfer directly to our atelier account; details sent via email.
                                                </p>
                                            </div>
                                        </div>
                                        <ShieldCheck className="size-5 text-neutral-600 shrink-0" />
                                    </label>
                                </div>
                            </div>

                            {/* Order Notes */}
                            <div>
                                <label
                                    htmlFor="notes"
                                    className="block text-xs font-semibold uppercase tracking-wider text-neutral-700"
                                >
                                    Special Instructions / Notes (Optional)
                                </label>
                                <textarea
                                    id="notes"
                                    rows={2}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Notes about your order, e.g. custom delivery instructions or gift wrapping..."
                                    className="mt-1 block w-full border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex w-full items-center justify-center gap-2 bg-neutral-900 py-4 text-xs font-bold tracking-widest text-white uppercase hover:bg-black transition-colors disabled:opacity-50"
                                >
                                    <Lock className="size-4" />
                                    {processing ? 'Placing Order...' : `Place Order — ${formatPrice(cart_final_total)}`}
                                </button>
                                <p className="mt-3 text-center text-xs text-neutral-500">
                                    By placing your order, you agree to our Terms of Service & Privacy Policy.
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24 border border-neutral-200 bg-white p-6 sm:p-8">
                            <h2 className="text-sm font-bold tracking-widest text-neutral-900 uppercase pb-4 border-b border-neutral-200">
                                Bag Summary ({cart.length})
                            </h2>

                            {/* Items preview */}
                            <div className="mt-4 divide-y divide-neutral-200 max-h-80 overflow-y-auto pr-2">
                                {cart.map((item) => (
                                    <div key={item.key} className="flex gap-4 py-3">
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

                                        <div className="flex flex-1 flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <p className="text-xs font-bold text-neutral-900 line-clamp-1">
                                                    {item.product_title}
                                                </p>
                                                <span className="text-xs font-semibold text-neutral-900">
                                                    {formatPrice(item.total_price)}
                                                </span>
                                            </div>

                                            <p className="text-[11px] text-neutral-500">
                                                Qty: {item.quantity} &times; {formatPrice(item.unit_price)}
                                            </p>

                                            {item.selected_options && (
                                                <p className="text-[11px] text-neutral-400">
                                                    {Object.entries(item.selected_options)
                                                        .map(([k, v]) => `${k}: ${v}`)
                                                        .join(' | ')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Promo Code Section */}
                            <div className="mt-5 border-t border-neutral-200 pt-4">
                                <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-neutral-700">
                                    Promo Code
                                </p>

                                {applied_coupon ? (
                                    /* Applied coupon tag */
                                    <div className="flex items-center justify-between gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <Tag className="size-3.5 shrink-0 text-emerald-600" />
                                            <span className="text-xs font-bold tracking-wider text-emerald-700 uppercase">
                                                {applied_coupon.code}
                                            </span>
                                            <span className="text-xs text-emerald-600">
                                                −{formatPrice(cart_discount)}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveCoupon}
                                            className="shrink-0 text-emerald-500 hover:text-rose-600 transition-colors"
                                            aria-label="Remove coupon"
                                        >
                                            <X className="size-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    /* Coupon input with validation feedback */
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => {
                                                    setCouponCode(e.target.value.toUpperCase());
                                                    if (couponError) setCouponError(null);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleApplyCoupon();
                                                    }
                                                }}
                                                placeholder="ENTER PROMO CODE"
                                                className={`flex-1 border px-3 py-2 text-xs uppercase tracking-wider text-neutral-900 placeholder-neutral-400 focus:outline-none ${
                                                    couponError
                                                        ? 'border-rose-400 focus:border-rose-600'
                                                        : 'border-neutral-300 focus:border-neutral-900'
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleApplyCoupon}
                                                disabled={applyingCoupon || !couponCode.trim()}
                                                className="shrink-0 bg-neutral-900 px-4 py-2 text-xs font-bold tracking-widest text-white uppercase hover:bg-black transition-colors disabled:opacity-50"
                                            >
                                                {applyingCoupon ? '...' : 'Apply'}
                                            </button>
                                        </div>

                                        {couponError && (
                                            <p className="flex items-start gap-1.5 text-xs text-rose-600">
                                                <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                                                <span>{couponError}</span>
                                            </p>
                                        )}
                                        {couponSuccess && (
                                            <p className="flex items-center gap-1.5 text-xs text-emerald-600">
                                                <CheckCircle2 className="size-3.5 shrink-0" />
                                                <span>{couponSuccess}</span>
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Error from checkout submission if coupon was invalidated */}
                                {errors.coupon && (
                                    <p className="mt-2 flex items-start gap-1.5 border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
                                        <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                                        <span>{errors.coupon}</span>
                                    </p>
                                )}
                            </div>

                            {/* Totals */}
                            <div className="mt-6 border-t border-neutral-200 pt-4 space-y-2 text-sm">
                                <div className="flex justify-between text-neutral-600">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-neutral-900">
                                        {formatPrice(cart_total)}
                                    </span>
                                </div>
                                {applied_coupon && cart_discount > 0 && (
                                    <div className="flex justify-between text-rose-600">
                                        <span className="flex items-center gap-1.5">
                                            Discount
                                            <span className="inline-block rounded bg-rose-50 border border-rose-200 px-1.5 py-0.5 text-[10px] font-bold tracking-widest uppercase text-rose-600">
                                                {applied_coupon.code}
                                            </span>
                                        </span>
                                        <span className="font-semibold">−{formatPrice(cart_discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-neutral-600">
                                    <span>Delivery Charges</span>
                                    <span className="font-semibold text-emerald-600 uppercase text-xs">
                                        Complimentary
                                    </span>
                                </div>
                                <div className="border-t border-neutral-200 pt-3 flex justify-between text-base font-bold text-neutral-900">
                                    <span>Total Due</span>
                                    <span>{formatPrice(cart_final_total)}</span>
                                </div>
                            </div>

                            <div className="mt-6 border-t border-neutral-200 pt-4">
                                <div className="flex items-center gap-2 text-xs text-neutral-600">
                                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                                    <span>Guaranteed Authentic & Handcrafted</span>
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-xs text-neutral-600">
                                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                                    <span>Complimentary Insured Delivery</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
