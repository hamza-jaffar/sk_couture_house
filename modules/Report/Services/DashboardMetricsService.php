<?php

namespace Modules\Report\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Modules\Customer\Models\Customer;
use Modules\Order\Enum\OrderStatusEnum;
use Modules\Order\Models\Order;
use Modules\Order\Models\OrderItem;
use Modules\Product\Models\Product;

class DashboardMetricsService
{
    /**
     * Get primary KPI metrics and comparisons.
     *
     * @return array<string, mixed>
     */
    public function getKpiMetrics(): array
    {
        $now = Carbon::now();
        $thirtyDaysAgo = $now->copy()->subDays(30);
        $sixtyDaysAgo = $now->copy()->subDays(60);

        // Revenue
        $totalRevenue = (float) Order::query()
            ->where('status', '!=', OrderStatusEnum::CANCELLED->value)
            ->sum('total');

        $recentRevenue = (float) Order::query()
            ->where('status', '!=', OrderStatusEnum::CANCELLED->value)
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->sum('total');

        $previousRevenue = (float) Order::query()
            ->where('status', '!=', OrderStatusEnum::CANCELLED->value)
            ->whereBetween('created_at', [$sixtyDaysAgo, $thirtyDaysAgo])
            ->sum('total');

        $revenueGrowth = $previousRevenue > 0
            ? round((($recentRevenue - $previousRevenue) / $previousRevenue) * 100, 1)
            : ($recentRevenue > 0 ? 100.0 : 0.0);

        // Orders
        $totalOrders = Order::query()->count();
        $recentOrders = Order::query()->where('created_at', '>=', $thirtyDaysAgo)->count();
        $previousOrders = Order::query()->whereBetween('created_at', [$sixtyDaysAgo, $thirtyDaysAgo])->count();

        $ordersGrowth = $previousOrders > 0
            ? round((($recentOrders - $previousOrders) / $previousOrders) * 100, 1)
            : ($recentOrders > 0 ? 100.0 : 0.0);

        // Customers
        $totalCustomers = Customer::query()->count();
        $recentCustomers = Customer::query()->where('created_at', '>=', $thirtyDaysAgo)->count();
        $previousCustomers = Customer::query()->whereBetween('created_at', [$sixtyDaysAgo, $thirtyDaysAgo])->count();

        $customersGrowth = $previousCustomers > 0
            ? round((($recentCustomers - $previousCustomers) / $previousCustomers) * 100, 1)
            : ($recentCustomers > 0 ? 100.0 : 0.0);

        // Low stock count
        $lowStockCount = Product::query()->where('stock', '<=', 5)->count();

        return [
            'total_revenue' => $totalRevenue,
            'recent_revenue' => $recentRevenue,
            'revenue_growth_pct' => $revenueGrowth,
            'total_orders' => $totalOrders,
            'recent_orders' => $recentOrders,
            'orders_growth_pct' => $ordersGrowth,
            'total_customers' => $totalCustomers,
            'recent_customers' => $recentCustomers,
            'customers_growth_pct' => $customersGrowth,
            'low_stock_count' => $lowStockCount,
            'currency_icon' => 'Rs.',
        ];
    }

    /**
     * Get daily revenue & order data for the chart (last 30 days).
     *
     * @return array<int, array<string, mixed>>
     */
    public function getRevenueChartData(int $days = 30): array
    {
        $startDate = Carbon::now()->subDays($days - 1)->startOfDay();

        // Get daily aggregated data from orders
        $dailyData = Order::query()
            ->selectRaw('DATE(created_at) as order_date, SUM(CASE WHEN status != ? THEN total ELSE 0 END) as daily_revenue, COUNT(*) as daily_orders', [OrderStatusEnum::CANCELLED->value])
            ->where('created_at', '>=', $startDate)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->get()
            ->keyBy('order_date');

        $chart = [];
        for ($i = 0; $i < $days; $i++) {
            $currentDay = $startDate->copy()->addDays($i);
            $dateKey = $currentDay->format('Y-m-d');
            $row = $dailyData->get($dateKey);

            $chart[] = [
                'date' => $dateKey,
                'label' => $currentDay->format('M j'),
                'revenue' => (float) ($row->daily_revenue ?? 0.0),
                'orders' => (int) ($row->daily_orders ?? 0),
            ];
        }

        return $chart;
    }

    /**
     * Get distribution of orders by status.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getOrderStatusDistribution(): array
    {
        $counts = Order::query()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $total = array_sum($counts);

        $statuses = [
            'pending' => ['label' => 'Pending', 'color' => '#f59e0b'],
            'confirmed' => ['label' => 'Confirmed', 'color' => '#3b82f6'],
            'processing' => ['label' => 'Processing', 'color' => '#6366f1'],
            'shipped' => ['label' => 'Shipped', 'color' => '#06b6d4'],
            'delivered' => ['label' => 'Delivered', 'color' => '#10b981'],
            'cancelled' => ['label' => 'Cancelled', 'color' => '#ef4444'],
            'refunded' => ['label' => 'Refunded', 'color' => '#8b5cf6'],
        ];

        $distribution = [];
        foreach ($statuses as $key => $meta) {
            $count = $counts[$key] ?? 0;
            $percentage = $total > 0 ? round(($count / $total) * 100, 1) : 0;

            $distribution[] = [
                'status' => $key,
                'label' => $meta['label'],
                'color' => $meta['color'],
                'count' => $count,
                'percentage' => $percentage,
            ];
        }

        return $distribution;
    }

    /**
     * Get the latest orders for quick dashboard review.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getRecentOrders(int $limit = 6): array
    {
        return Order::query()
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(fn (Order $order): array => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'total' => (float) $order->total,
                'currency_icon' => $order->currency_icon ?? 'Rs.',
                'status' => $order->status,
                'payment_status' => $order->payment_status,
                'created_at' => $order->created_at->toISOString(),
                'created_at_human' => $order->created_at->diffForHumans(),
            ])
            ->all();
    }

    /**
     * Get top-selling products by quantity sold.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getTopProducts(int $limit = 5): array
    {
        return OrderItem::query()
            ->select('product_title', 'product_slug', 'image_url', DB::raw('SUM(quantity) as units_sold'), DB::raw('SUM(total_price) as total_sales'))
            ->groupBy('product_title', 'product_slug', 'image_url')
            ->orderByDesc('units_sold')
            ->limit($limit)
            ->get()
            ->map(fn ($item): array => [
                'title' => $item->product_title,
                'slug' => $item->product_slug,
                'image_url' => $item->image_url,
                'units_sold' => (int) $item->units_sold,
                'total_sales' => (float) $item->total_sales,
            ])
            ->all();
    }

    /**
     * Get low stock product alerts.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getLowStockAlerts(int $threshold = 5, int $limit = 5): array
    {
        return Product::query()
            ->where('stock', '<=', $threshold)
            ->orderBy('stock', 'asc')
            ->limit($limit)
            ->get(['id', 'title', 'slug', 'sku', 'stock', 'price', 'images'])
            ->map(fn (Product $p): array => [
                'id' => $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'sku' => $p->sku,
                'stock' => $p->stock,
                'price' => (float) $p->price,
                'image_url' => is_array($p->images) && count($p->images) > 0 ? $p->images[0] : null,
            ])
            ->all();
    }
}
