<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Customer\Models\Customer;
use Modules\Order\Models\Order;
use Modules\Product\Models\Product;
use Modules\User\Database\Seeders\RolePermissionSeeder;
use Modules\User\Models\User;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(RolePermissionSeeder::class);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');
});

test('admin can access dashboard and receives deferred metrics', function (): void {
    $response = $this->actingAs($this->admin, 'web')
        ->get('/dashboard');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard/dashboard')
    );
});

test('admin can access reports page', function (): void {
    $response = $this->actingAs($this->admin, 'web')
        ->get('/dashboard/reports');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard/reports/index')
        ->has('filters')
    );
});

test('admin can export orders as csv stream', function (): void {
    Order::factory()->count(2)->create();

    $response = $this->actingAs($this->admin, 'web')
        ->get('/dashboard/reports/export/orders');

    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');

    ob_start();
    $response->sendContent();
    $content = ob_get_clean();

    expect($content)->toContain('Order Number');
});

test('admin can export sales as csv stream', function (): void {
    Order::factory()->count(2)->create();

    $response = $this->actingAs($this->admin, 'web')
        ->get('/dashboard/reports/export/sales');

    $response->assertOk();

    ob_start();
    $response->sendContent();
    $content = ob_get_clean();

    expect($content)->toContain('Order Number');
});

test('admin can export coupons as csv stream', function (): void {
    $response = $this->actingAs($this->admin, 'web')
        ->get('/dashboard/reports/export/coupons');

    $response->assertOk();

    ob_start();
    $response->sendContent();
    $content = ob_get_clean();

    expect($content)->toContain('Code');
});

test('admin can export customers as csv stream', function (): void {
    Customer::factory()->count(2)->create();

    $response = $this->actingAs($this->admin, 'web')
        ->get('/dashboard/reports/export/customers');

    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');

    ob_start();
    $response->sendContent();
    $content = ob_get_clean();

    expect($content)->toContain('Email');
});

test('admin can export products as csv stream', function (): void {
    Product::factory()->count(2)->create();

    $response = $this->actingAs($this->admin, 'web')
        ->get('/dashboard/reports/export/products');

    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');

    ob_start();
    $response->sendContent();
    $content = ob_get_clean();

    expect($content)->toContain('Title');
});
