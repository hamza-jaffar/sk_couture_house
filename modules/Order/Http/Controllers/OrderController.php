<?php

namespace Modules\Order\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Order\Enum\OrderStatusEnum;
use Modules\Order\Http\Requests\OrderIndexRequest;
use Modules\Order\Http\Requests\UpdateOrderStatusRequest;
use Modules\Order\Models\Order;
use Modules\Order\Services\OrderService;

class OrderController
{
    public function __construct(
        protected OrderService $orderService,
    ) {}

    /**
     * Display a listing of orders for the dashboard.
     */
    public function index(OrderIndexRequest $request): Response
    {
        $filters = $request->validated();

        return Inertia::render('dashboard/orders/index', [
            'orders' => Inertia::defer(
                fn () => $this->orderService->paginateOrders($filters),
                'order-list',
            ),
            'statusOptions' => Inertia::defer(
                fn () => OrderStatusEnum::options(),
                'order-options',
            ),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? 'all',
                'type' => $filters['type'] ?? 'all',
                'payment_status' => $filters['payment_status'] ?? 'all',
                'sort' => $filters['sort'] ?? 'created_at',
                'direction' => $filters['direction'] ?? 'desc',
                'per_page' => (int) ($filters['per_page'] ?? 15),
                'page' => (int) ($filters['page'] ?? 1),
            ],
        ]);
    }

    /**
     * Display the specified order details.
     */
    public function show(Order $order): Response
    {
        $order->load(['items', 'user']);

        return Inertia::render('dashboard/orders/show', [
            'order' => $this->orderService->presentOrder($order),
            'statusOptions' => OrderStatusEnum::options(),
        ]);
    }

    /**
     * Update the status of an order.
     */
    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): RedirectResponse
    {
        $this->orderService->updateStatus($order, $request->validated('status'));

        return redirect()->back()->with('success', "Order #{$order->order_number} status updated.");
    }
}
