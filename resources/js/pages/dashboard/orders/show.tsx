import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Order, OrderStatusOption } from '@/types/orders';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    Clock,
    CreditCard,
    FileText,
    Mail,
    MapPin,
    Phone,
    ShoppingBag,
    User,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    order: Order;
    statusOptions: OrderStatusOption[];
}

export default function OrderShow({ order, statusOptions }: Props) {
    const [selectedStatus, setSelectedStatus] = useState<string>(order.status);
    const { patch, processing } = useForm({
        status: order.status,
    });

    const formatPrice = (amount: number) => {
        return `${order.currency_icon ?? 'Rs.'}${amount.toLocaleString('en-PK', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        })}`;
    };

    const handleStatusUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        router.patch(
            `/dashboard/orders/${order.order_number}/status`,
            { status: selectedStatus },
            {
                preserveScroll: true,
            }
        );
    };

    const getStatusBadge = (status: string, label?: string) => {
        const option = statusOptions.find((o) => o.value === status);
        const color = option?.color ?? 'neutral';

        const styles: Record<string, string> = {
            amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
            blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900',
            indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900',
            cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-900',
            emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900',
            rose: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900',
            orange: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900',
        };

        return (
            <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                    styles[color] ?? 'bg-neutral-100 text-neutral-700 border-neutral-200'
                }`}
            >
                {label ?? option?.label ?? status}
            </span>
        );
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            <Head title={`Order #${order.order_number}`} />

            {/* Back button & Title */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        render={<Link href="/dashboard/orders" />}
                        title="Back to Orders"
                    >
                        <ArrowLeft className="size-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Order #{order.order_number}
                            </h1>
                            {getStatusBadge(order.status, order.status_label)}
                            <span
                                className={`rounded-xs px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                                    order.type === 'whatsapp'
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                        : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                                }`}
                            >
                                {order.type === 'whatsapp' ? 'WhatsApp Order' : 'Direct Checkout'}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
                            <Clock className="size-3.5" />
                            Placed on {new Date(order.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Status Update Quick Form */}
                <form
                    onSubmit={handleStatusUpdate}
                    className="flex items-center gap-2 rounded-lg border bg-card p-2"
                >
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
                        Status:
                    </span>
                    <div className="w-44">
                        <Select
                            items={statusOptions}
                            value={selectedStatus}
                            onValueChange={(val) => setSelectedStatus(val)}
                        >
                            <SelectTrigger className="h-8 text-xs font-medium">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={selectedStatus === order.status || processing}
                    >
                        Save
                    </Button>
                </form>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left: Items list & Notes */}
                <div className="space-y-6 lg:col-span-8">
                    {/* Items Table Card */}
                    <div className="rounded-lg border bg-card overflow-hidden">
                        <div className="border-b px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="size-4 text-muted-foreground" />
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
                                    Ordered Items ({order.items.length})
                                </h2>
                            </div>
                        </div>

                        <div className="divide-y">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-6 transition-colors hover:bg-muted/30"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.product_title}
                                                    className="h-full w-full object-cover object-top"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                                                    No Img
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <p className="font-semibold text-foreground">
                                                {item.product_title}
                                            </p>
                                            {item.sku && (
                                                <p className="text-xs text-muted-foreground">
                                                    SKU: {item.sku}
                                                </p>
                                            )}
                                            {item.selected_options &&
                                                Object.keys(item.selected_options).length > 0 && (
                                                    <div className="mt-1 flex flex-wrap gap-1 text-xs text-muted-foreground">
                                                        {Object.entries(item.selected_options).map(
                                                            ([k, v]) => (
                                                                <span
                                                                    key={k}
                                                                    className="rounded-xs bg-muted px-1.5 py-0.5"
                                                                >
                                                                    {k}: {v}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Qty: {item.quantity} &times; {formatPrice(item.unit_price)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right font-bold text-foreground">
                                        {formatPrice(item.total_price)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary Footer */}
                        <div className="border-t bg-muted/20 p-6 space-y-2 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span className="font-semibold text-foreground">
                                    {formatPrice(order.subtotal)}
                                </span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Shipping</span>
                                <span className="font-semibold text-emerald-600 uppercase text-xs">
                                    Complimentary
                                </span>
                            </div>
                            <div className="border-t pt-3 flex justify-between text-base font-bold text-foreground">
                                <span>Grand Total</span>
                                <span>{formatPrice(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Notes Card */}
                    {order.notes && (
                        <div className="rounded-lg border bg-card p-6">
                            <div className="flex items-center gap-2 pb-3 border-b text-sm font-semibold uppercase tracking-wider text-foreground">
                                <FileText className="size-4 text-muted-foreground" />
                                Customer Instructions / Notes
                            </div>
                            <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line">
                                {order.notes}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right: Customer & Delivery Info */}
                <div className="space-y-6 lg:col-span-4">
                    {/* Customer Information Card */}
                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center gap-2 pb-3 border-b text-sm font-semibold uppercase tracking-wider text-foreground">
                            <User className="size-4 text-muted-foreground" />
                            Customer
                        </div>

                        <div className="mt-4 space-y-3 text-sm">
                            <p className="font-semibold text-foreground text-base">
                                {order.customer_name}
                            </p>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="size-3.5 shrink-0" />
                                <a
                                    href={`mailto:${order.customer_email}`}
                                    className="hover:underline text-foreground"
                                >
                                    {order.customer_email}
                                </a>
                            </div>
                            {order.customer_phone && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Phone className="size-3.5 shrink-0" />
                                    <a
                                        href={`tel:${order.customer_phone}`}
                                        className="hover:underline text-foreground"
                                    >
                                        {order.customer_phone}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Shipping Address Card */}
                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center gap-2 pb-3 border-b text-sm font-semibold uppercase tracking-wider text-foreground">
                            <MapPin className="size-4 text-muted-foreground" />
                            Shipping Address
                        </div>

                        {order.shipping_address ? (
                            <div className="mt-4 text-sm text-muted-foreground leading-relaxed">
                                <p className="font-medium text-foreground">
                                    {order.shipping_address.line1}
                                </p>
                                <p>
                                    {order.shipping_address.city}
                                    {order.shipping_address.region && `, ${order.shipping_address.region}`}
                                    {order.shipping_address.postal_code && ` ${order.shipping_address.postal_code}`}
                                </p>
                                <p className="font-semibold text-foreground mt-1">
                                    {order.shipping_address.country}
                                </p>
                            </div>
                        ) : (
                            <p className="mt-4 text-xs text-muted-foreground">
                                No shipping address recorded.
                            </p>
                        )}
                    </div>

                    {/* Payment Information Card */}
                    <div className="rounded-lg border bg-card p-6">
                        <div className="flex items-center gap-2 pb-3 border-b text-sm font-semibold uppercase tracking-wider text-foreground">
                            <CreditCard className="size-4 text-muted-foreground" />
                            Payment Information
                        </div>

                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Method</span>
                                <span className="font-semibold text-foreground uppercase text-xs">
                                    {order.payment_method?.replace(/_/g, ' ') ?? 'Cash on Delivery'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Payment Status</span>
                                <span className="font-semibold text-foreground capitalize">
                                    {order.payment_status}
                                </span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="text-muted-foreground">Amount</span>
                                <span className="font-bold text-foreground">
                                    {formatPrice(order.total)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

OrderShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Orders', href: '/dashboard/orders' },
    ],
};
