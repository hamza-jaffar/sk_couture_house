<?php

namespace Modules\Report\Services;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Modules\Coupon\Models\Coupon;
use Modules\Customer\Models\Customer;
use Modules\Order\Enum\OrderStatusEnum;
use Modules\Order\Models\Order;
use Modules\Order\Models\OrderItem;
use Modules\Product\Models\Product;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportExportService
{
    /**
     * Get aggregate summaries for reports dashboard.
     *
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function getReportSummaries(array $filters = []): array
    {
        $days = (int) ($filters['days'] ?? 30);
        $startDate = $days > 0 ? Carbon::now()->subDays($days)->startOfDay() : null;

        $ordersQuery = Order::query();
        if ($startDate) {
            $ordersQuery->where('created_at', '>=', $startDate);
        }

        $totalOrders = (clone $ordersQuery)->count();
        $totalSales = (float) (clone $ordersQuery)
            ->where('status', '!=', OrderStatusEnum::CANCELLED->value)
            ->sum('total');

        $totalDiscounts = (float) (clone $ordersQuery)->sum('discount_amount');
        $avgOrderValue = $totalOrders > 0 ? round($totalSales / $totalOrders, 2) : 0.0;

        $totalCustomers = Customer::query()->count();
        $totalProducts = Product::query()->count();
        $totalCoupons = Coupon::query()->count();

        // Monthly breakdown for table (database-agnostic for MySQL & SQLite)
        $driver = DB::connection()->getDriverName();
        $monthSql = $driver === 'sqlite'
            ? "strftime('%Y-%m', created_at)"
            : "DATE_FORMAT(created_at, '%Y-%m')";

        $monthlyPerformance = Order::query()
            ->selectRaw("{$monthSql} as month, COUNT(*) as orders_count, SUM(CASE WHEN status != 'cancelled' THEN total ELSE 0 END) as revenue, SUM(discount_amount) as discounts")
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get()
            ->map(fn ($row): array => [
                'period' => $row->month,
                'orders_count' => (int) $row->orders_count,
                'revenue' => (float) ($row->revenue ?? 0.0),
                'discounts' => (float) ($row->discounts ?? 0.0),
                'avg_value' => $row->orders_count > 0 ? round(((float) $row->revenue) / ((int) $row->orders_count), 2) : 0.0,
            ])
            ->all();

        return [
            'total_sales' => $totalSales,
            'total_orders' => $totalOrders,
            'total_discounts' => $totalDiscounts,
            'avg_order_value' => $avgOrderValue,
            'total_customers' => $totalCustomers,
            'total_products' => $totalProducts,
            'total_coupons' => $totalCoupons,
            'monthly_performance' => $monthlyPerformance,
            'currency_icon' => 'Rs.',
        ];
    }

    /**
     * Stream CSV export for Orders.
     *
     * @param  array<string, mixed>  $filters
     */
    public function exportOrders(array $filters = []): StreamedResponse
    {
        $filename = 'orders_export_'.Carbon::now()->format('Y-m-d_His').'.csv';

        return response()->streamDownload(function () use ($filters): void {
            $handle = fopen('php://output', 'w');

            // Header
            fputcsv($handle, [
                'Order Number',
                'Date',
                'Customer Name',
                'Customer Email',
                'Customer Phone',
                'Type',
                'Status',
                'Payment Status',
                'Payment Method',
                'Subtotal',
                'Discount Code',
                'Discount Amount',
                'Total Amount',
            ]);

            $query = Order::query()->latest('created_at');

            if (! empty($filters['status']) && $filters['status'] !== 'all') {
                $query->where('status', $filters['status']);
            }

            if (! empty($filters['from'])) {
                $query->whereDate('created_at', '>=', $filters['from']);
            }

            if (! empty($filters['to'])) {
                $query->whereDate('created_at', '<=', $filters['to']);
            }

            $query->chunk(200, function ($orders) use ($handle): void {
                foreach ($orders as $order) {
                    $status = $order->status instanceof \BackedEnum ? $order->status->value : (string) $order->status;
                    $type = $order->type instanceof \BackedEnum ? $order->type->value : (string) $order->type;

                    fputcsv($handle, [
                        $order->order_number,
                        $order->created_at->format('Y-m-d H:i:s'),
                        $order->customer_name,
                        $order->customer_email,
                        $order->customer_phone ?? '',
                        $type,
                        $status,
                        $order->payment_status,
                        $order->payment_method ?? 'N/A',
                        number_format((float) $order->subtotal, 2, '.', ''),
                        $order->coupon_code ?? '',
                        number_format((float) $order->discount_amount, 2, '.', ''),
                        number_format((float) $order->total, 2, '.', ''),
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Stream CSV export for Sales with item details.
     *
     * @param  array<string, mixed>  $filters
     */
    public function exportSales(array $filters = []): StreamedResponse
    {
        $filename = 'sales_items_export_'.Carbon::now()->format('Y-m-d_His').'.csv';

        return response()->streamDownload(function () use ($filters): void {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Order Number',
                'Order Date',
                'Order Status',
                'Customer Email',
                'Product Title',
                'Product SKU',
                'Quantity',
                'Unit Price',
                'Total Price',
            ]);

            $query = OrderItem::query()
                ->with(['order'])
                ->whereHas('order', function (Builder $b) use ($filters): void {
                    if (! empty($filters['from'])) {
                        $b->whereDate('created_at', '>=', $filters['from']);
                    }
                    if (! empty($filters['to'])) {
                        $b->whereDate('created_at', '<=', $filters['to']);
                    }
                })
                ->latest('id');

            $query->chunk(200, function ($items) use ($handle): void {
                foreach ($items as $item) {
                    $order = $item->order;
                    $status = $order?->status instanceof \BackedEnum ? $order->status->value : (string) ($order?->status ?? '');

                    fputcsv($handle, [
                        $order?->order_number ?? '',
                        $order?->created_at?->format('Y-m-d H:i:s') ?? '',
                        $status,
                        $order?->customer_email ?? '',
                        $item->product_title,
                        $item->sku ?? '',
                        $item->quantity,
                        number_format((float) $item->unit_price, 2, '.', ''),
                        number_format((float) $item->total_price, 2, '.', ''),
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Stream CSV export for Customers.
     *
     * @param  array<string, mixed>  $filters
     */
    public function exportCustomers(array $filters = []): StreamedResponse
    {
        $filename = 'customers_export_'.Carbon::now()->format('Y-m-d_His').'.csv';

        return response()->streamDownload(function (): void {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'ID',
                'Name',
                'Email',
                'Phone',
                'Status',
                'Orders Count',
                'Total Spent',
                'Registered Date',
            ]);

            $query = Customer::query()
                ->withCount('orders')
                ->withSum(['orders' => function (Builder $b): void {
                    $b->where('status', '!=', OrderStatusEnum::CANCELLED->value);
                }], 'total')
                ->latest('id');

            $query->chunk(200, function ($customers) use ($handle): void {
                foreach ($customers as $customer) {
                    fputcsv($handle, [
                        $customer->id,
                        $customer->name,
                        $customer->email,
                        $customer->phone ?? '',
                        $customer->is_active ? 'Active' : 'Inactive',
                        $customer->orders_count ?? 0,
                        number_format((float) ($customer->orders_sum_total ?? 0.0), 2, '.', ''),
                        $customer->created_at->format('Y-m-d H:i:s'),
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Stream CSV export for Products.
     *
     * @param  array<string, mixed>  $filters
     */
    public function exportProducts(array $filters = []): StreamedResponse
    {
        $filename = 'products_inventory_export_'.Carbon::now()->format('Y-m-d_His').'.csv';

        return response()->streamDownload(function (): void {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'ID',
                'Title',
                'SKU',
                'Price',
                'Sale Price',
                'Stock Quantity',
                'Type',
                'Status',
                'Created At',
            ]);

            $query = Product::query()->latest('id');

            $query->chunk(200, function ($products) use ($handle): void {
                foreach ($products as $product) {
                    fputcsv($handle, [
                        $product->id,
                        $product->title,
                        $product->sku ?? '',
                        number_format((float) $product->price, 2, '.', ''),
                        $product->sale_price ? number_format((float) $product->sale_price, 2, '.', '') : '',
                        $product->stock,
                        $product->type,
                        $product->status,
                        $product->created_at->format('Y-m-d H:i:s'),
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Stream CSV export for Coupons.
     *
     * @param  array<string, mixed>  $filters
     */
    public function exportCoupons(array $filters = []): StreamedResponse
    {
        $filename = 'coupons_export_'.Carbon::now()->format('Y-m-d_His').'.csv';

        return response()->streamDownload(function (): void {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Code',
                'Type',
                'Value',
                'Min Spend',
                'Max Discount',
                'Times Used',
                'Usage Limit',
                'Usage Limit Per User',
                'Is Active',
                'Expires At',
                'Created At',
            ]);

            $query = Coupon::query()->latest('id');

            $query->chunk(200, function ($coupons) use ($handle): void {
                foreach ($coupons as $coupon) {
                    $discountType = $coupon->discount_type instanceof \BackedEnum
                        ? $coupon->discount_type->value
                        : (string) $coupon->discount_type;

                    fputcsv($handle, [
                        $coupon->code,
                        $discountType,
                        $coupon->discount_value,
                        $coupon->min_spend ?? 'None',
                        $coupon->max_discount ?? 'None',
                        $coupon->times_used,
                        $coupon->usage_limit ?? 'Unlimited',
                        $coupon->usage_limit_per_user ?? 'Unlimited',
                        $coupon->is_active ? 'Yes' : 'No',
                        $coupon->expires_at ? $coupon->expires_at->format('Y-m-d H:i:s') : 'Never',
                        $coupon->created_at->format('Y-m-d H:i:s'),
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
