import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCan } from '@/hooks/use-can';
import type { CustomerRow } from '@/types/customers';
import type { PaginatedOrders } from '@/types/orders';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Mail,
    MapPin,
    Package,
    Phone,
    ShoppingBag,
    ToggleLeft,
    ToggleRight,
    User,
} from 'lucide-react';

type Props = {
    customer: CustomerRow;
    orders: PaginatedOrders;
};

export default function CustomerShow({ customer, orders }: Props) {
    const can = useCan();

    const handleToggleStatus = () => {
        router.patch(
            `/dashboard/customers/${customer.id}/status`,
            { is_active: !customer.is_active },
            { preserveScroll: true },
        );
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title={`Customer - ${customer.name}`} />

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => router.visit('/dashboard/customers')}
                        aria-label="Back to customers"
                    >
                        <ArrowLeft className="size-4" />
                    </Button>
                    <Heading
                        variant="small"
                        title={customer.name}
                        description={`Member since ${customer.created_at_human ?? customer.created_at.slice(0, 10)}`}
                    />
                </div>

                {can('customers.update') && (
                    <Button
                        variant={customer.is_active ? 'outline' : 'default'}
                        onClick={handleToggleStatus}
                    >
                        {customer.is_active ? (
                            <>
                                <ToggleLeft className="mr-2 size-4" />
                                Deactivate Account
                            </>
                        ) : (
                            <>
                                <ToggleRight className="mr-2 size-4" />
                                Activate Account
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* Customer Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                        <User className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {customer.is_active ? (
                            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400">
                                Active
                            </span>
                        ) : (
                            <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-400">
                                Inactive
                            </span>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <Package className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{customer.orders_count}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        <ShoppingBag className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            Rs.{' '}
                            {customer.total_spent.toLocaleString('en-PK', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Profile Info & Address */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                            <Mail className="size-4 text-muted-foreground" />
                            <span>{customer.email}</span>
                        </div>
                        {customer.phone && (
                            <div className="flex items-center gap-3">
                                <Phone className="size-4 text-muted-foreground" />
                                <span>{customer.phone}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <Calendar className="size-4 text-muted-foreground" />
                            <span>Registered on {customer.created_at.slice(0, 10)}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Default Shipping Address</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {customer.shipping_address ? (
                            <div className="flex items-start gap-3">
                                <MapPin className="mt-0.5 size-4 text-muted-foreground shrink-0" />
                                <div>
                                    <p className="font-medium text-foreground">
                                        {customer.shipping_address.line1}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {[
                                            customer.shipping_address.city,
                                            customer.shipping_address.region,
                                            customer.shipping_address.postal_code,
                                        ]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {customer.shipping_address.country}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground italic">No address saved yet.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Order History */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Order History</CardTitle>
                </CardHeader>
                <CardContent>
                    {!orders?.data || orders.data.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            No orders placed yet.
                        </p>
                    ) : (
                        <div className="divide-y rounded-md border text-sm">
                            {orders.data.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/40"
                                >
                                    <div>
                                        <Link
                                            href={`/dashboard/orders/${order.order_number}`}
                                            className="font-mono font-semibold text-foreground hover:underline"
                                        >
                                            #{order.order_number}
                                        </Link>
                                        <p className="text-xs text-muted-foreground">
                                            {order.created_at_human ?? order.created_at.slice(0, 10)}
                                        </p>
                                    </div>

                                    <div className="text-xs text-muted-foreground">
                                        {order.items_count ?? order.items?.length ?? 0} item(s)
                                    </div>

                                    <span className="font-bold text-foreground">
                                        {order.currency_icon}
                                        {order.total.toLocaleString('en-PK', {
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>

                                    <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                        {order.status}
                                    </span>

                                    <Link
                                        href={`/dashboard/orders/${order.order_number}`}
                                        className="text-xs font-medium text-primary hover:underline"
                                    >
                                        View order &rarr;
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

CustomerShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Customers', href: '/dashboard/customers' },
        { title: 'Customer Details' },
    ],
};
