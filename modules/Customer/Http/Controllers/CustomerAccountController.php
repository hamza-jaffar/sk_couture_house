<?php

namespace Modules\Customer\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Customer\Http\Requests\CustomerPasswordRequest;
use Modules\Customer\Http\Requests\CustomerProfileRequest;
use Modules\Customer\Models\Customer;
use Modules\Customer\Services\CustomerAuthService;
use Modules\Customer\Services\CustomerOrderService;

class CustomerAccountController
{
    public function __construct(
        protected CustomerAuthService $authService,
        protected CustomerOrderService $orderService,
    ) {}

    /**
     * Show customer account dashboard and profile overview.
     */
    public function account(Request $request): Response
    {
        /** @var Customer $customer */
        $customer = $request->user('customer');

        $stats = $this->orderService->getCustomerStats($customer);
        $recentOrders = $this->orderService->getCustomerOrders($customer, ['per_page' => 5]);

        return Inertia::render('frontend/customer/account', [
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'shipping_address' => $customer->shipping_address,
                'created_at' => $customer->created_at?->toISOString(),
            ],
            'stats' => $stats,
            'recent_orders' => $recentOrders->items(),
        ]);
    }

    /**
     * Update customer profile information and default address.
     */
    public function updateProfile(CustomerProfileRequest $request): RedirectResponse
    {
        /** @var Customer $customer */
        $customer = $request->user('customer');

        $this->authService->updateProfile($customer, $request->validated());

        return redirect()->back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Update customer account password.
     */
    public function updatePassword(CustomerPasswordRequest $request): RedirectResponse
    {
        /** @var Customer $customer */
        $customer = $request->user('customer');

        $this->authService->updatePassword(
            $customer,
            $request->validated('current_password'),
            $request->validated('password'),
        );

        return redirect()->back()->with('success', 'Password updated successfully.');
    }

    /**
     * Show customer full order history with pagination.
     */
    public function orders(Request $request): Response
    {
        /** @var Customer $customer */
        $customer = $request->user('customer');

        $orders = $this->orderService->getCustomerOrders($customer, [
            'per_page' => 10,
            'page' => $request->query('page', 1),
        ]);

        return Inertia::render('frontend/customer/orders', [
            'orders' => $orders,
        ]);
    }

    /**
     * Show single order details for customer.
     */
    public function orderDetail(string $orderNumber, Request $request): Response
    {
        /** @var Customer $customer */
        $customer = $request->user('customer');

        $order = $this->orderService->getCustomerOrderDetail($customer, $orderNumber);

        return Inertia::render('frontend/customer/order-show', [
            'order' => $order,
        ]);
    }
}
