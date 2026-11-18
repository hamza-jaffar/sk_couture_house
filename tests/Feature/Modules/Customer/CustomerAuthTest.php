<?php

use Illuminate\Support\Facades\Hash;
use Modules\Customer\Models\Customer;
use Modules\Order\Models\Order;
use Modules\Order\Models\OrderItem;

test('a guest can view the customer registration page', function (): void {
    $response = $this->get(route('customer.register'));

    $response->assertOk();
});

test('a guest can register as a customer', function (): void {
    $response = $this->post(route('customer.register.post'), [
        'name' => 'Fatima Noor',
        'email' => 'fatima@example.com',
        'phone' => '+923001234567',
        'password' => 'secret1234',
        'password_confirmation' => 'secret1234',
    ]);

    $response->assertRedirect(route('customer.account'));
    $this->assertAuthenticated('customer');

    $this->assertDatabaseHas('customers', [
        'email' => 'fatima@example.com',
        'name' => 'Fatima Noor',
        'phone' => '+923001234567',
    ]);
});

test('cannot register with an existing customer email', function (): void {
    Customer::factory()->create(['email' => 'existing@example.com']);

    $response = $this->post(route('customer.register.post'), [
        'name' => 'Another Customer',
        'email' => 'existing@example.com',
        'password' => 'secret1234',
        'password_confirmation' => 'secret1234',
    ]);

    $response->assertSessionHasErrors('email');
});

test('a customer can login with valid credentials', function (): void {
    $customer = Customer::factory()->create([
        'email' => 'zainab@example.com',
        'password' => Hash::make('password123'),
        'is_active' => true,
    ]);

    $response = $this->post(route('customer.login.post'), [
        'email' => 'zainab@example.com',
        'password' => 'password123',
    ]);

    $response->assertRedirect(route('customer.account'));
    $this->assertAuthenticatedAs($customer, 'customer');
});

test('a customer cannot login with invalid credentials', function (): void {
    Customer::factory()->create([
        'email' => 'zainab@example.com',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->post(route('customer.login.post'), [
        'email' => 'zainab@example.com',
        'password' => 'wrong-password',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest('customer');
});

test('authenticated customer can view account dashboard', function (): void {
    $customer = Customer::factory()->create();

    $response = $this->actingAs($customer, 'customer')->get(route('customer.account'));

    $response->assertOk();
});

test('authenticated customer can update profile and default shipping address', function (): void {
    $customer = Customer::factory()->create([
        'name' => 'Original Name',
        'phone' => '03000000000',
    ]);

    $response = $this->actingAs($customer, 'customer')->patch(route('customer.profile.update'), [
        'name' => 'Updated Name',
        'phone' => '03111111111',
        'shipping_address' => [
            'line1' => 'Street 5, Phase 6 DHA',
            'city' => 'Lahore',
            'region' => 'Punjab',
            'postal_code' => '54000',
            'country' => 'Pakistan',
        ],
    ]);

    $response->assertRedirect();
    $customer->refresh();

    expect($customer->name)->toBe('Updated Name')
        ->and($customer->phone)->toBe('03111111111')
        ->and($customer->shipping_address['city'])->toBe('Lahore');
});

test('authenticated customer can update password', function (): void {
    $customer = Customer::factory()->create([
        'password' => Hash::make('oldpassword123'),
    ]);

    $response = $this->actingAs($customer, 'customer')->put(route('customer.password.update'), [
        'current_password' => 'oldpassword123',
        'password' => 'newpassword456',
        'password_confirmation' => 'newpassword456',
    ]);

    $response->assertRedirect();
    $customer->refresh();

    expect(Hash::check('newpassword456', $customer->password))->toBeTrue();
});

test('authenticated customer can view their order history and order details', function (): void {
    $customer = Customer::factory()->create();

    $order = Order::factory()->create([
        'customer_id' => $customer->id,
        'order_number' => 'ORD-TEST-12345',
        'customer_email' => $customer->email,
        'total' => 15000,
    ]);

    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_title' => 'Silk Velvet Ensemble',
        'unit_price' => 15000,
        'total_price' => 15000,
        'quantity' => 1,
    ]);

    // View orders list
    $response = $this->actingAs($customer, 'customer')->get(route('customer.orders'));
    $response->assertOk();

    // View single order
    $detailResponse = $this->actingAs($customer, 'customer')->get(route('customer.orders.show', 'ORD-TEST-12345'));
    $detailResponse->assertOk();
});

test('customer can logout', function (): void {
    $customer = Customer::factory()->create();

    $response = $this->actingAs($customer, 'customer')->post(route('customer.logout'));

    $response->assertRedirect(route('home'));
    $this->assertGuest('customer');
});

test('guest is redirected to customer login when visiting customer protected pages', function (): void {
    $response = $this->get(route('customer.account'));

    $response->assertRedirect(route('customer.login'));
});
