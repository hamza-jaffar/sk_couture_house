<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Customer\Models\Customer;
use Modules\User\Database\Seeders\RolePermissionSeeder;
use Modules\User\Models\User;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(RolePermissionSeeder::class);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');
});

test('admin can access customers index in dashboard', function (): void {
    Customer::factory()->count(3)->create();

    $response = $this->actingAs($this->admin, 'web')
        ->get('/dashboard/customers');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard/customers/index')
        ->has('filters')
    );
});

test('admin can search customers in dashboard', function (): void {
    $john = Customer::factory()->create(['name' => 'John Doe', 'email' => 'john@example.com']);
    $jane = Customer::factory()->create(['name' => 'Jane Smith', 'email' => 'jane@example.com']);

    $response = $this->actingAs($this->admin, 'web')
        ->get('/dashboard/customers?search=John');

    $response->assertOk();
});

test('admin can view single customer details', function (): void {
    $customer = Customer::factory()->create();

    $response = $this->actingAs($this->admin, 'web')
        ->get("/dashboard/customers/{$customer->id}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard/customers/show')
        ->has('customer')
        ->has('orders')
    );
});

test('admin can toggle customer active status', function (): void {
    $customer = Customer::factory()->create(['is_active' => true]);

    $response = $this->actingAs($this->admin, 'web')
        ->patch("/dashboard/customers/{$customer->id}/status", [
            'is_active' => false,
        ]);

    $response->assertRedirect();
    expect($customer->fresh()->is_active)->toBeFalse();
});

test('unauthenticated user cannot access dashboard customers', function (): void {
    $response = $this->get('/dashboard/customers');

    $response->assertRedirect('/login');
});
