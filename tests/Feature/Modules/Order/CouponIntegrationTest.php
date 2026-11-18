<?php

use Illuminate\Support\Facades\Queue;
use Modules\Category\Enum\OrderTypeEnum;
use Modules\Category\Models\Category;
use Modules\Coupon\Enum\DiscountTypeEnum;
use Modules\Coupon\Models\Coupon;
use Modules\Customer\Models\Customer;
use Modules\Order\Models\Order;
use Modules\Order\Services\CartService;
use Modules\Product\Models\Product;

beforeEach(function (): void {
    Queue::fake();

    $this->category = Category::factory()->create([
        'order_type' => OrderTypeEnum::DIRECT,
    ]);

    $this->product = Product::factory()->create([
        'category_id' => $this->category->id,
        'status' => 'published',
        'price' => 10000,
        'sale_price' => 10000,
    ]);
});

test('can apply a valid percentage coupon to cart', function (): void {
    $cartService = app(CartService::class);
    $cartService->clearCart();

    // Add item to cart (10,000)
    $this->post(route('cart.add'), [
        'product_id' => $this->product->id,
        'quantity' => 1,
    ]);

    $coupon = Coupon::factory()->create([
        'code' => 'SAVE20',
        'discount_type' => DiscountTypeEnum::Percentage,
        'discount_value' => 20.0,
        'max_discount' => null,
        'is_active' => true,
        'starts_at' => now()->subDay(),
        'expires_at' => now()->addDays(10),
    ]);

    $response = $this->post(route('cart.coupon.apply'), [
        'code' => 'SAVE20',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect($cartService->cartDiscount())->toBe(2000.0)
        ->and($cartService->cartFinalTotal())->toBe(8000.0);
});

test('can apply a valid fixed amount coupon to cart', function (): void {
    $cartService = app(CartService::class);
    $cartService->clearCart();

    $this->post(route('cart.add'), [
        'product_id' => $this->product->id,
        'quantity' => 1,
    ]);

    Coupon::factory()->create([
        'code' => 'FLAT1500',
        'discount_type' => DiscountTypeEnum::Fixed,
        'discount_value' => 1500.0,
        'is_active' => true,
        'starts_at' => now()->subDay(),
        'expires_at' => now()->addDays(10),
    ]);

    $response = $this->post(route('cart.coupon.apply'), [
        'code' => 'FLAT1500',
    ]);

    $response->assertRedirect();

    expect($cartService->cartDiscount())->toBe(1500.0)
        ->and($cartService->cartFinalTotal())->toBe(8500.0);
});

test('cannot apply expired or inactive coupon', function (): void {
    $cartService = app(CartService::class);
    $cartService->clearCart();

    $this->post(route('cart.add'), [
        'product_id' => $this->product->id,
        'quantity' => 1,
    ]);

    Coupon::factory()->create([
        'code' => 'EXPIRED50',
        'discount_type' => DiscountTypeEnum::Percentage,
        'discount_value' => 50.0,
        'is_active' => true,
        'expires_at' => now()->subDay(),
    ]);

    $response = $this->post(route('cart.coupon.apply'), [
        'code' => 'EXPIRED50',
    ]);

    $response->assertSessionHasErrors('code');
    expect($cartService->cartDiscount())->toBe(0.0);
});

test('cannot apply coupon if cart subtotal is below minimum spend', function (): void {
    $cartService = app(CartService::class);
    $cartService->clearCart();

    $this->post(route('cart.add'), [
        'product_id' => $this->product->id,
        'quantity' => 1,
    ]);

    Coupon::factory()->create([
        'code' => 'BIGSPENDER',
        'discount_type' => DiscountTypeEnum::Percentage,
        'discount_value' => 10.0,
        'min_spend' => 50000.0,
        'is_active' => true,
    ]);

    $response = $this->post(route('cart.coupon.apply'), [
        'code' => 'BIGSPENDER',
    ]);

    $response->assertSessionHasErrors('code');
    expect($cartService->cartDiscount())->toBe(0.0);
});

test('can remove applied coupon from cart', function (): void {
    $cartService = app(CartService::class);
    $cartService->clearCart();

    $this->post(route('cart.add'), [
        'product_id' => $this->product->id,
        'quantity' => 1,
    ]);

    Coupon::factory()->create([
        'code' => 'REMOVE_ME',
        'discount_type' => DiscountTypeEnum::Fixed,
        'discount_value' => 500.0,
        'is_active' => true,
    ]);

    $this->post(route('cart.coupon.apply'), ['code' => 'REMOVE_ME']);
    expect($cartService->cartDiscount())->toBe(500.0);

    $response = $this->delete(route('cart.coupon.remove'));
    $response->assertRedirect();

    expect($cartService->cartDiscount())->toBe(0.0)
        ->and($cartService->getAppliedCoupon())->toBeNull();
});

test('checkout processes discount and associates customer and increments coupon usage', function (): void {
    $cartService = app(CartService::class);
    $cartService->clearCart();

    $customer = Customer::factory()->create([
        'email' => 'hina@example.com',
        'name' => 'Hina Altaf',
    ]);

    $coupon = Coupon::factory()->create([
        'code' => 'DISCOUNT25',
        'discount_type' => DiscountTypeEnum::Percentage,
        'discount_value' => 25.0,
        'max_discount' => null,
        'times_used' => 2,
        'is_active' => true,
    ]);

    // Add item (Rs. 10,000)
    $this->post(route('cart.add'), [
        'product_id' => $this->product->id,
        'quantity' => 1,
    ]);

    // Apply coupon (25% of 10,000 = 2,500 discount)
    $this->post(route('cart.coupon.apply'), [
        'code' => 'DISCOUNT25',
    ]);

    // Submit checkout as authenticated customer
    $response = $this->actingAs($customer, 'customer')->post(route('checkout.store'), [
        'customer_name' => 'Hina Altaf',
        'customer_email' => 'hina@example.com',
        'customer_phone' => '+923001234567',
        'shipping_address' => [
            'line1' => 'House 14, Street 2',
            'city' => 'Karachi',
            'region' => 'Sindh',
            'postal_code' => '75000',
            'country' => 'Pakistan',
        ],
        'payment_method' => 'cash_on_delivery',
        'notes' => 'Handle with care',
    ]);

    $response->assertRedirect();

    // Verify order in database
    $order = Order::query()->where('customer_email', 'hina@example.com')->first();
    expect($order)->not->toBeNull()
        ->and((int) $order->customer_id)->toBe($customer->id)
        ->and($order->coupon_code)->toBe('DISCOUNT25')
        ->and((float) $order->subtotal)->toBe(10000.0)
        ->and((float) $order->discount_amount)->toBe(2500.0)
        ->and((float) $order->total)->toBe(7500.0);

    // Verify coupon usage incremented
    $coupon->refresh();
    expect($coupon->times_used)->toBe(3);

    // Verify cart cleared
    expect($cartService->cartCount())->toBe(0)
        ->and($cartService->getAppliedCoupon())->toBeNull();
});

test('enforces usage_limit_per_user so customer cannot reuse single-use coupon', function (): void {
    $cartService = app(CartService::class);
    $cartService->clearCart();

    $customer = Customer::factory()->create([
        'email' => 'sarah@example.com',
    ]);

    $coupon = Coupon::factory()->create([
        'code' => 'ONCEONLY',
        'discount_type' => DiscountTypeEnum::Fixed,
        'discount_value' => 1000.0,
        'usage_limit_per_user' => 1,
        'times_used' => 1,
        'is_active' => true,
    ]);

    // An order already exists for this customer with this coupon
    Order::factory()->create([
        'customer_id' => $customer->id,
        'customer_email' => 'sarah@example.com',
        'coupon_code' => 'ONCEONLY',
        'status' => 'pending',
    ]);

    // Add item to cart
    $this->post(route('cart.add'), [
        'product_id' => $this->product->id,
        'quantity' => 1,
    ]);

    // Try applying coupon as this customer
    $response = $this->actingAs($customer, 'customer')->post(route('cart.coupon.apply'), [
        'code' => 'ONCEONLY',
    ]);

    $response->assertSessionHasErrors('code');
    expect($cartService->cartDiscount())->toBe(0.0);
});
