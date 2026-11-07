<?php

use Inertia\Testing\AssertableInertia;
use Modules\User\Models\Role;
use Modules\User\Models\User;
use Spatie\Permission\Models\Permission;

function customerIndexViewer(string $permission = 'customers.view'): User
{
    $user = User::factory()->create();
    $user->givePermissionTo(Permission::findOrCreate($permission, 'web'));

    return $user;
}

function customerIndexRole(): Role
{
    return Role::query()->firstOrCreate(
        ['name' => 'customer', 'guard_name' => 'web'],
        ['is_system' => true],
    );
}

it('searches, sorts, and paginates customers without including staff users', function () {
    $viewer = customerIndexViewer();
    $customerRole = customerIndexRole();

    foreach (range(1, 12) as $number) {
        $customer = User::factory()->create([
            'name' => sprintf('Customer %02d', $number),
            'email' => sprintf('customer%02d@example.test', $number),
        ]);
        $customer->assignRole($customerRole);
    }

    User::factory()
        ->create([
            'name' => 'Staff Account',
            'email' => 'staff@example.test',
        ])
        ->givePermissionTo(Permission::findOrCreate('users.view', 'web'));

    $this->actingAs($viewer)
        ->get(route('dashboard.customer.index', [
            'search' => 'Customer',
            'sort' => 'name',
            'direction' => 'desc',
            'page' => 2,
            'per_page' => 10,
        ]))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('dashboard/customer')
            ->missing('customers')
            ->where('filters.search', 'Customer')
            ->where('filters.page', 2)
            ->where('filters.per_page', 10)
            ->loadDeferredProps(['customer-list'], fn (AssertableInertia $page) => $page
                ->where('customers.total', 12)
                ->where('customers.current_page', 2)
                ->where('customers.per_page', 10)
                ->where('customers.data.0.name', 'Customer 02')
                ->where('customers.data.1.name', 'Customer 01')
                ->where('customers.data.0.roles.0.name', 'customer')));
});

it('returns the customer total for unfiltered pages without counting staff', function () {
    $viewer = customerIndexViewer();
    $customerRole = customerIndexRole();

    foreach (['Alice Customer', 'Zoe Customer'] as $name) {
        User::factory()
            ->create(['name' => $name])
            ->assignRole($customerRole);
    }

    User::factory()->create(['name' => 'Staff Account']);

    $this->actingAs($viewer)
        ->get(route('dashboard.customer.index', ['per_page' => 10]))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('dashboard/customer')
            ->loadDeferredProps(['customer-list'], fn (AssertableInertia $page) => $page
                ->where('customers.total', 2)
                ->where('customers.last_page', 1)
                ->where('customers.data.0.name', 'Alice Customer')
                ->where('customers.data.1.name', 'Zoe Customer')));
});

it('forbids authenticated users without the customers view permission', function () {
    $viewer = customerIndexViewer('users.view');

    $this->actingAs($viewer)
        ->get(route('dashboard.customer.index'))
        ->assertForbidden();
});

it('redirects guests to login before showing customers', function () {
    $this->get(route('dashboard.customer.index'))
        ->assertRedirect(route('login'));
});

it('rejects invalid customer filters', function (array $filters, string $field) {
    $viewer = customerIndexViewer();

    $this->actingAs($viewer)
        ->from(route('dashboard.customer.index'))
        ->get(route('dashboard.customer.index', $filters))
        ->assertRedirect(route('dashboard.customer.index'))
        ->assertSessionHasErrors($field);
})->with([
    'unknown sort column' => [['sort' => 'email;drop table users'], 'sort'],
    'invalid page size' => [['per_page' => 500], 'per_page'],
]);
