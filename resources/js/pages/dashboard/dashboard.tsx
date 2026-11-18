import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Head, Link, router } from '@inertiajs/react';
import { Deferred } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    Clock,
    Download,
    ExternalLink,
    Package,
    ShoppingBag,
    TrendingUp,
    Users,
} from 'lucide-react';

type KpiMetrics = {
    total_revenue: number;
    recent_revenue: number;
    revenue_growth_pct: number;
    total_orders: number;
    recent_orders: number;
    orders_growth_pct: number;
    total_customers: number;
    recent_customers: number;
    customers_growth_pct: number;
    low_stock_count: number;
    currency_icon: string;
};

type ChartPoint = {
    date: string;
    label: string;
    revenue: number;
    orders: number;
};

type OrderStatusItem = {
    status: string;
    label: string;
    color: string;
    count: number;
    percentage: number;
};

type RecentOrder = {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    total: number;
    currency_icon: string;
    status: string;
    payment_status: string;
    created_at: string;
    created_at_human: string;
};

type TopProduct = {
    title: string;
    slug: string;
    image_url: string | null;
    units_sold: number;
    total_sales: number;
};

type InventoryAlert = {
    id: number;
    title: string;
    slug: string;
    sku: string | null;
    stock: number;
    price: number;
    image_url: string | null;
};

type Props = {
    metrics?: KpiMetrics;
    revenueChart?: ChartPoint[];
    orderDistribution?: OrderStatusItem[];
    recentOrders?: RecentOrder[];
    topProducts?: TopProduct[];
    inventoryAlerts?: InventoryAlert[];
};

function formatCurrency(amount: number, icon = 'Rs.') {
    return `${icon} ${amount.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function GrowthBadge({ pct }: { pct: number }) {
    const isPositive = pct >= 0;
    return (
        <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
        >
            {isPositive ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
            {Math.abs(pct)}%
        </span>
    );
}

function MiniBarChart({ data }: { data: ChartPoint[] }) {
    const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
    const last7 = data.slice(-14);

    return (
        <div className="mt-2 flex items-end gap-0.5" style={{ height: 48 }}>
            {last7.map((point, i) => (
                <div
                    key={i}
                    className="group relative flex flex-1 items-end"
                    title={`${point.label}: Rs.${Math.round(point.revenue).toLocaleString()}`}
                >
                    <div
                        className="w-full rounded-sm bg-primary/30 group-hover:bg-primary/70 transition-colors"
                        style={{ height: `${Math.max(4, (point.revenue / maxRevenue) * 48)}px` }}
                    />
                </div>
            ))}
        </div>
    );
}

function RevenueLineChart({ data }: { data: ChartPoint[] }) {
    const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
    const width = 600;
    const height = 180;
    const pad = 8;
    const plotW = width - pad * 2;
    const plotH = height - pad * 2;

    const points = data.map((d, i) => {
        const x = pad + (i / (data.length - 1)) * plotW;
        const y = pad + plotH - (d.revenue / maxRevenue) * plotH;
        return { x, y, ...d };
    });

    const pathD = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
        .join(' ');

    const areaD = `${pathD} L ${points.at(-1)!.x.toFixed(2)} ${(pad + plotH).toFixed(2)} L ${pad} ${(pad + plotH).toFixed(2)} Z`;

    const ticks = [
        data[0],
        data[Math.floor(data.length / 4)],
        data[Math.floor(data.length / 2)],
        data[Math.floor((3 * data.length) / 4)],
        data[data.length - 1],
    ];

    return (
        <div className="relative overflow-hidden">
            <svg
                viewBox={`0 0 ${width} ${height + 20}`}
                className="h-[180px] w-full"
                preserveAspectRatio="none"
            >
                {/* Gradient fill */}
                <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
                    </linearGradient>
                </defs>
                <path d={areaD} fill="url(#revenueGradient)" />
                <path
                    d={pathD}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* X-axis labels */}
                {ticks.map((tick, i) => {
                    const point = points.find((p) => p.date === tick.date);
                    if (!point) return null;
                    return (
                        <text
                            key={i}
                            x={point.x}
                            y={height + 16}
                            textAnchor="middle"
                            fontSize="10"
                            fill="currentColor"
                            opacity="0.5"
                        >
                            {tick.label}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}

export default function Dashboard({
    metrics,
    revenueChart,
    orderDistribution,
    recentOrders,
    topProducts,
    inventoryAlerts,
}: Props) {
    const ci = metrics?.currency_icon ?? 'Rs.';

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title="Dashboard" />

            <div className="flex flex-wrap items-center justify-between gap-4">
                <Heading
                    variant="small"
                    title="Dashboard"
                    description="Your business at a glance — sales, orders, and inventory."
                />
                <Link href="/dashboard/reports">
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 size-4" />
                        Reports & Exports
                    </Button>
                </Link>
            </div>

            {/* KPI Cards */}
            <Deferred
                data="metrics"
                fallback={
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Card key={i}>
                                <CardHeader className="pb-2">
                                    <Skeleton className="h-4 w-28" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-32 mb-1" />
                                    <Skeleton className="h-3 w-24" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                }
            >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <TrendingUp className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {formatCurrency(metrics?.total_revenue ?? 0, ci)}
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                <GrowthBadge pct={metrics?.revenue_growth_pct ?? 0} />
                                <span>vs. prev 30 days</span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                            <ShoppingBag className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {(metrics?.total_orders ?? 0).toLocaleString()}
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                <GrowthBadge pct={metrics?.orders_growth_pct ?? 0} />
                                <span>vs. prev 30 days</span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                            <Users className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">
                                {(metrics?.total_customers ?? 0).toLocaleString()}
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                <GrowthBadge pct={metrics?.customers_growth_pct ?? 0} />
                                <span>vs. prev 30 days</span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                            <AlertTriangle className="size-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <p
                                className={`text-2xl font-bold ${(metrics?.low_stock_count ?? 0) > 0 ? 'text-amber-600 dark:text-amber-400' : ''}`}
                            >
                                {metrics?.low_stock_count ?? 0}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Products with stock ≤ 5
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </Deferred>

            {/* Revenue Chart */}
            <Deferred
                data="revenueChart"
                fallback={
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-5 w-48" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-44 w-full" />
                        </CardContent>
                    </Card>
                }
            >
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <CardTitle className="text-base">Revenue — Last 30 Days</CardTitle>
                        {revenueChart && (
                            <span className="text-xs text-muted-foreground">
                                Peak: {formatCurrency(Math.max(...revenueChart.map((d) => d.revenue)), ci)}
                            </span>
                        )}
                    </CardHeader>
                    <CardContent>
                        {revenueChart && revenueChart.length > 0 ? (
                            <RevenueLineChart data={revenueChart} />
                        ) : (
                            <p className="py-10 text-center text-sm text-muted-foreground">
                                No revenue data yet.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </Deferred>

            {/* Order Distribution + Recent Orders */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Order Status Distribution */}
                <Deferred
                    data="orderDistribution"
                    fallback={
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-5 w-40" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-6 w-full" />
                                ))}
                            </CardContent>
                        </Card>
                    }
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Order Status Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2.5">
                            {(orderDistribution ?? []).map((item) => (
                                <div key={item.status}>
                                    <div className="mb-1 flex items-center justify-between text-xs">
                                        <span className="font-medium text-foreground">{item.label}</span>
                                        <span className="text-muted-foreground">
                                            {item.count} ({item.percentage}%)
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full transition-all"
                                            style={{
                                                width: `${item.percentage}%`,
                                                backgroundColor: item.color,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {(!orderDistribution || orderDistribution.every((o) => o.count === 0)) && (
                                <p className="py-6 text-center text-sm text-muted-foreground">
                                    No order data yet.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </Deferred>

                {/* Recent Orders */}
                <Deferred
                    data="recentOrders"
                    fallback={
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-5 w-36" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-10 w-full" />
                                ))}
                            </CardContent>
                        </Card>
                    }
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-4">
                            <CardTitle className="text-base">Recent Orders</CardTitle>
                            <Link
                                href="/dashboard/orders"
                                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                            >
                                View all
                                <ExternalLink className="size-3" />
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            {(recentOrders ?? []).length === 0 ? (
                                <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                                    No orders yet.
                                </p>
                            ) : (
                                <div className="divide-y text-sm">
                                    {(recentOrders ?? []).map((order) => (
                                        <div
                                            key={order.id}
                                            className="flex flex-wrap items-center justify-between gap-2 px-6 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/40"
                                        >
                                            <div>
                                                <Link
                                                    href={`/dashboard/orders/${order.order_number}`}
                                                    className="font-mono font-semibold text-foreground hover:underline"
                                                >
                                                    #{order.order_number}
                                                </Link>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {order.customer_name}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-0.5">
                                                <span className="font-bold text-foreground">
                                                    {formatCurrency(order.total, order.currency_icon)}
                                                </span>
                                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                                    <Clock className="size-3" />
                                                    {order.created_at_human}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </Deferred>
            </div>

            {/* Top Products + Inventory Alerts */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Products */}
                <Deferred
                    data="topProducts"
                    fallback={
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-5 w-36" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-10 w-full" />
                                ))}
                            </CardContent>
                        </Card>
                    }
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Top Selling Products</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {(topProducts ?? []).length === 0 ? (
                                <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                                    No sales data yet.
                                </p>
                            ) : (
                                <div className="divide-y text-sm">
                                    {(topProducts ?? []).map((product, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-3 px-6 py-3"
                                        >
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground text-xs font-bold">
                                                {i + 1}
                                            </div>
                                            {product.image_url && (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.title}
                                                    className="size-10 rounded-md object-cover"
                                                />
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium text-foreground">
                                                    {product.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {product.units_sold} units sold
                                                </p>
                                            </div>
                                            <span className="font-bold text-foreground">
                                                {formatCurrency(product.total_sales, ci)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </Deferred>

                {/* Inventory Alerts */}
                <Deferred
                    data="inventoryAlerts"
                    fallback={
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-5 w-40" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-10 w-full" />
                                ))}
                            </CardContent>
                        </Card>
                    }
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between gap-4">
                            <CardTitle className="text-base">Low Stock Alerts</CardTitle>
                            <Link
                                href="/dashboard/product"
                                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                            >
                                Manage inventory
                                <ExternalLink className="size-3" />
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            {(inventoryAlerts ?? []).length === 0 ? (
                                <p className="px-6 py-8 text-center text-sm text-emerald-600 dark:text-emerald-400">
                                    All products are well stocked.
                                </p>
                            ) : (
                                <div className="divide-y text-sm">
                                    {(inventoryAlerts ?? []).map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center gap-3 px-6 py-3"
                                        >
                                            <Package className="size-5 shrink-0 text-amber-500" />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium text-foreground">
                                                    {product.title}
                                                </p>
                                                {product.sku && (
                                                    <p className="text-[11px] text-muted-foreground font-mono">
                                                        SKU: {product.sku}
                                                    </p>
                                                )}
                                            </div>
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                    product.stock === 0
                                                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                                }`}
                                            >
                                                {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </Deferred>
            </div>
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }],
};
