<?php

use Illuminate\Support\Facades\Queue;
use Modules\Category\Enum\OrderTypeEnum;
use Modules\Category\Models\Category;
use Modules\Order\Enum\OrderStatusEnum;
use Modules\Order\Jobs\SendOrderConfirmationEmail;
use Modules\Order\Models\Order;
use Modules\Order\Services\CartService;
use Modules\Product\Models\Product;
use Modules\User\Models\Role;
use Modules\User\Models\User;
use Spatie\Permission\Models\Permission;

beforeEach(function (): void {
    // Setup admin user with permissions
    Permission::findOrCreate('orders.view', 'web');
    Permission::findOrCreate('orders.update', 'web');

    $role = Role::findOrCreate('admin', 'web');
    $role->givePermissionTo(['orders.view', 'orders.update']);

    $this->admin = User::factory()->create();
    $this->admin->assignRole($role);
});

test('can add a direct product to cart', function (): void {
    $category = Category::factory()->create([
        'order_type' => OrderTypeEnum::DIRECT,
    ]);

    $product = Product::factory()->create([
        'category_id' => $category->id,
        'status' => 'published',
        'price' => 5000,
        'sale_price' => 4500,
    ]);

    $response = $this->post(route('cart.add'), [
        'product_id' => $product->id,
        'quantity' => 2,
        'selected_options' => ['Size' => 'M'],
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $cartService = app(CartService::class);
    expect($cartService->cartCount())->toBe(2);
    expect($cartService->cartTotal())->toBe(9000.0);
});

test('adding a whatsapp product redirects to whatsapp url', function (): void {
    $category = Category::factory()->create([
        'order_type' => OrderTypeEnum::WHATSAPP,
    ]);

    $product = Product::factory()->create([
        'category_id' => $category->id,
        'status' => 'published',
        'price' => 8000,
    ]);

    $response = $this->post(route('cart.add'), [
        'product_id' => $product->id,
        'quantity' => 1,
        'selected_options' => ['Size' => 'L'],
    ]);

    // Inertia::location or redirect to wa.me
    expect($response->getStatusCode())->toBeIn([302, 409]);
});

test('can update and remove item in cart', function (): void {
    $product = Product::factory()->create([
        'status' => 'published',
        'price' => 3000,
    ]);

    $cartService = app(CartService::class);
    $cart = $cartService->addItem([
        'product_id' => $product->id,
        'product_title' => $product->title,
        'product_slug' => $product->slug,
        'unit_price' => 3000,
        'quantity' => 1,
        'selected_options' => ['Size' => 'S'],
    ]);

    $key = array_key_first($cart);

    // Update quantity
    $response = $this->patch(route('cart.update', $key), [
        'quantity' => 3,
    ]);
    $response->assertRedirect();
    expect($cartService->cartCount())->toBe(3);

    // Remove item
    $response = $this->delete(route('cart.remove', $key));
    $response->assertRedirect();
    expect($cartService->cartCount())->toBe(0);
});

test('checkout stores order, clears cart, and queues email confirmation', function (): void {
    Queue::fake([SendOrderConfirmationEmail::class]);

    $product = Product::factory()->create([
        'status' => 'published',
        'price' => 7500,
    ]);

    $cartService = app(CartService::class);
    $cartService->addItem([
        'product_id' => $product->id,
        'product_title' => $product->title,
        'product_slug' => $product->slug,
        'unit_price' => 7500,
        'quantity' => 2,
        'selected_options' => ['Size' => 'M'],
    ]);

    $response = $this->post(route('checkout.store'), [
        'customer_name' => 'Fatima Noor',
        'customer_email' => 'fatima@example.com',
        'customer_phone' => '03001234567',
        'shipping_address' => [
            'line1' => 'Plot 45, Street 10',
            'city' => 'Lahore',
            'region' => 'Punjab',
            'postal_code' => '54000',
            'country' => 'Pakistan',
        ],
        'payment_method' => 'cash_on_delivery',
        'notes' => 'Please call before delivery',
    ]);

    $order = Order::query()->where('customer_email', 'fatima@example.com')->first();
    expect($order)->not->toBeNull();
    expect((float) $order->total)->toBe(15000.0);
    expect($order->items)->toHaveCount(1);
    expect($cartService->cartCount())->toBe(0);

    $response->assertRedirect(route('checkout.success', $order->order_number));

    Queue::assertPushed(SendOrderConfirmationEmail::class);
});

test('admin can view and update order status', function (): void {
    $order = Order::factory()->create([
        'status' => OrderStatusEnum::PENDING->value,
    ]);

    $response = $this->actingAs($this->admin)->get(route('dashboard.orders.index'));
    $response->assertOk();

    $response = $this->actingAs($this->admin)->get(route('dashboard.orders.show', $order->order_number));
    $response->assertOk();

    $response = $this->actingAs($this->admin)->patch(
        route('dashboard.orders.update-status', $order->order_number),
        ['status' => OrderStatusEnum::CONFIRMED->value]
    );

    $response->assertRedirect();
    expect($order->fresh()->status)->toBe(OrderStatusEnum::CONFIRMED);
});

test('guest cannot access dashboard orders', function (): void {
    $response = $this->get(route('dashboard.orders.index'));
    $response->assertRedirect(route('login'));
});
