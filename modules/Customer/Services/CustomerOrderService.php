<?php

namespace Modules\Customer\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Modules\Customer\Models\Customer;
use Modules\Order\Models\Order;
use Modules\Order\Services\OrderService;

class CustomerOrderService
{
    public function __construct(
        protected OrderService $orderService,
    ) {}

    /**
     * Get paginated orders for a customer.
     *
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function getCustomerOrders(Customer $customer, array $filters = []): LengthAwarePaginator
    {
        $perPage = max(5, min(50, (int) ($filters['per_page'] ?? 10)));
        $page = max(1, (int) ($filters['page'] ?? request()->input('page', 1)));

        $query = Order::query()
            ->where(function ($q) use ($customer): void {
                $q->where('customer_id', $customer->id)
                    ->orWhere('customer_email', $customer->email);
            })
            ->with(['items'])
            ->withCount('items')
            ->orderBy('created_at', 'desc');

        $paginator = $query->paginate($perPage, ['*'], 'page', $page)->withQueryString();

        return $paginator->through(fn (Order $order): array => $this->orderService->presentOrder($order));
    }

    /**
     * Get single order detail belonging to this customer.
     *
     * @return array<string, mixed>
     */
    public function getCustomerOrderDetail(Customer $customer, string $orderNumber): array
    {
        /** @var Order $order */
        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->where(function ($q) use ($customer): void {
                $q->where('customer_id', $customer->id)
                    ->orWhere('customer_email', $customer->email);
            })
            ->with(['items'])
            ->firstOrFail();

        return $this->orderService->presentOrder($order);
    }

    /**
     * Get summary metrics for customer account.
     *
     * @return array{
     *     total_orders: int,
     *     total_spent: float,
     *     pending_orders: int,
     *     completed_orders: int
     * }
     */
    public function getCustomerStats(Customer $customer): array
    {
        $orders = Order::query()
            ->where(function ($q) use ($customer): void {
                $q->where('customer_id', $customer->id)
                    ->orWhere('customer_email', $customer->email);
            })
            ->get(['status', 'total']);

        $totalOrders = $orders->count();
        $totalSpent = (float) $orders->sum('total');
        $pending = $orders->whereIn('status', ['pending', 'processing', 'confirmed'])->count();
        $completed = $orders->where('status', 'delivered')->count();

        return [
            'total_orders' => $totalOrders,
            'total_spent' => round($totalSpent, 2),
            'pending_orders' => $pending,
            'completed_orders' => $completed,
        ];
    }
}
