<?php

namespace Modules\Order\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Customer\Models\Customer;
use Modules\Order\Http\Requests\CheckoutRequest;
use Modules\Order\Models\Order;
use Modules\Order\Services\CartService;
use Modules\Order\Services\OrderService;
use Modules\Setting\Services\SiteSettingService;

class CheckoutController
{
    public function __construct(
        protected CartService $cartService,
        protected OrderService $orderService,
        protected SiteSettingService $settings,
    ) {}

    /**
     * Show the checkout page.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $cart = $this->cartService->getCart();

        if (empty($cart)) {
            return redirect()->route('cart.index')->with('error', 'Your shopping bag is empty.');
        }

        $platformSettings = $this->settings->all();

        /** @var Customer|null $customer */
        $customer = $request->user('customer');
        $appliedCoupon = $this->cartService->getAppliedCoupon();

        return Inertia::render('frontend/checkout/index', [
            'cart' => array_values($cart),
            'cart_total' => $this->cartService->cartTotal(),
            'cart_count' => $this->cartService->cartCount(),
            'cart_discount' => $this->cartService->cartDiscount(),
            'cart_final_total' => $this->cartService->cartFinalTotal(),
            'applied_coupon' => $appliedCoupon,
            'currency_icon' => $platformSettings['general']['currency_icon'] ?? 'Rs.',
            'currency' => $platformSettings['general']['currency'] ?? 'PKR',
            'user' => $request->user('web'),
            'prefill' => $customer ? [
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'shipping_address' => $customer->shipping_address,
            ] : null,
        ]);
    }

    /**
     * Process checkout and create the order.
     */
    public function store(CheckoutRequest $request): RedirectResponse
    {
        $cart = $this->cartService->getCart();

        if (empty($cart)) {
            return redirect()->route('cart.index')->with('error', 'Your shopping bag is empty.');
        }

        /** @var Customer|null $customer */
        $customer = $request->user('customer');
        $appliedCoupon = $this->cartService->getAppliedCoupon();

        $order = $this->orderService->createOrder(
            $request->validated(),
            $cart,
            $request->user('web')?->id,
            $customer?->id,
            $appliedCoupon,
        );

        $this->cartService->clearCart();

        return redirect()->route('checkout.success', $order->order_number);
    }

    /**
     * Show the order confirmation / success page.
     */
    public function success(Order $order): Response
    {
        $order->load(['items']);

        return Inertia::render('frontend/checkout/success', [
            'order' => $this->orderService->presentOrder($order),
        ]);
    }
}
