import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Deferred, Head, router } from '@inertiajs/react';
import {
    Download,
    FileText,
    Package,
    ShoppingBag,
    Tag,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useState } from 'react';

type MonthlyRow = {
    period: string;
    orders_count: number;
    revenue: number;
    discounts: number;
    avg_value: number;
};

type ReportSummary = {
    total_sales: number;
    total_orders: number;
    total_discounts: number;
    avg_order_value: number;
    total_customers: number;
    total_products: number;
    total_coupons: number;
    monthly_performance: MonthlyRow[];
    currency_icon: string;
};

type Props = {
    filters: {
        days: number;
        status: string;
        from: string | null;
        to: string | null;
    };
    summary?: ReportSummary;
};

const exportTypes = [
    {
        type: 'orders',
        label: 'Export Orders',
        description: 'Full order list with customer, payment, and discount details.',
        icon: ShoppingBag,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
        type: 'sales',
        label: 'Export Sales (Line Items)',
        description: 'Product-level sales with quantities and per-item totals.',
        icon: TrendingUp,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
        type: 'customers',
        label: 'Export Customers',
        description: 'All registered customers with order count and total spend.',
        icon: Users,
        color: 'text-violet-600 dark:text-violet-400',
        bg: 'bg-violet-50 dark:bg-violet-950/30',
    },
    {
        type: 'products',
        label: 'Export Products',
        description: 'Product catalog with stock, pricing, and status.',
        icon: Package,
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
        type: 'coupons',
        label: 'Export Coupons',
        description: 'Coupon codes, usage stats, limits, and expiry details.',
        icon: Tag,
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-50 dark:bg-rose-950/30',
    },
];

function fmt(amount: number, icon = 'Rs.') {
    return `${icon} ${amount.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function ReportsIndex({ filters, summary }: Props) {
    const [selectedDays, setSelectedDays] = useState(String(filters.days ?? 30));

    const visitWithDays = (days: string) => {
        setSelectedDays(days);
        router.get(
            '/dashboard/reports',
            { days },
            { preserveScroll: true, only: ['filters', 'summary'] },
        );
    };

    const handleExport = (type: string) => {
        window.location.href = `/dashboard/reports/export/${type}`;
    };

    const ci = summary?.currency_icon ?? 'Rs.';

    const dayOptions = [
        { label: 'Last 7 days', value: '7' },
        { label: 'Last 30 days', value: '30' },
        { label: 'Last 90 days', value: '90' },
        { label: 'All time', value: '0' },
    ];

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title="Reports" />

            <div className="flex flex-wrap items-start justify-between gap-4">
                <Heading
                    variant="small"
                    title="Reports & Exports"
                    description="Platform analytics overview and CSV data exports for all modules."
                />

                {/* Period Switcher */}
                <div className="flex flex-wrap gap-2">
                    {dayOptions.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => visitWithDays(opt.value)}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                selectedDays === opt.value
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary KPI Cards */}
            <Deferred
                data="summary"
                fallback={
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Card key={i}>
                                <CardHeader className="pb-2">
                                    <Skeleton className="h-4 w-28" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-32" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                }
            >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                            <TrendingUp className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{fmt(summary?.total_sales ?? 0, ci)}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{summary?.total_orders ?? 0} orders</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                            <ShoppingBag className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{fmt(summary?.avg_order_value ?? 0, ci)}</p>
                            <p className="mt-1 text-xs text-muted-foreground">per order</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Discounts Given</CardTitle>
                            <TrendingDown className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{fmt(summary?.total_discounts ?? 0, ci)}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{summary?.total_coupons ?? 0} coupons active</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Platform Overview</CardTitle>
                            <Users className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="mt-1 space-y-0.5 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Customers</span>
                                    <span className="font-semibold">{summary?.total_customers ?? 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Products</span>
                                    <span className="font-semibold">{summary?.total_products ?? 0}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </Deferred>

            {/* Monthly Performance Table */}
            <Deferred
                data="summary"
                fallback={
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-5 w-48" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-48 w-full" />
                        </CardContent>
                    </Card>
                }
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Monthly Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {!summary?.monthly_performance?.length ? (
                            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                                No monthly data available.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
                                            <th className="px-6 py-3 text-left font-medium">Period</th>
                                            <th className="px-6 py-3 text-right font-medium">Orders</th>
                                            <th className="px-6 py-3 text-right font-medium">Revenue</th>
                                            <th className="px-6 py-3 text-right font-medium">Discounts</th>
                                            <th className="px-6 py-3 text-right font-medium">Avg Order</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {summary.monthly_performance.map((row, i) => (
                                            <tr
                                                key={i}
                                                className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                                            >
                                                <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                                                    {row.period}
                                                </td>
                                                <td className="px-6 py-3 text-right">{row.orders_count}</td>
                                                <td className="px-6 py-3 text-right font-semibold text-foreground">
                                                    {fmt(row.revenue, ci)}
                                                </td>
                                                <td className="px-6 py-3 text-right text-rose-600 dark:text-rose-400">
                                                    {row.discounts > 0 ? `-${fmt(row.discounts, ci)}` : '—'}
                                                </td>
                                                <td className="px-6 py-3 text-right text-muted-foreground">
                                                    {fmt(row.avg_value, ci)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </Deferred>

            {/* CSV Exports */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Data Exports (CSV)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {exportTypes.map((exp) => {
                            const Icon = exp.icon;
                            return (
                                <div
                                    key={exp.type}
                                    className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/30"
                                >
                                    <div className={`mt-0.5 rounded-md p-2 ${exp.bg}`}>
                                        <Icon className={`size-4 ${exp.color}`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-foreground">
                                            {exp.label}
                                        </p>
                                        <p className="mt-0.5 text-xs text-muted-foreground">
                                            {exp.description}
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() => handleExport(exp.type)}
                                        >
                                            <Download className="mr-1.5 size-3" />
                                            Download CSV
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground">
                <FileText className="mr-1 inline size-3" />
                CSV exports are streamed directly — large datasets may take a moment to generate.
            </p>
        </div>
    );
}

ReportsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Reports', href: '/dashboard/reports' },
    ],
};
