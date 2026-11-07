<?php

use Inertia\Testing\AssertableInertia;
use Modules\User\Database\Seeders\RolePermissionSeeder;
use Modules\User\Models\Role;
use Modules\User\Models\User;
use Spatie\Permission\Models\Permission;

function rolePermissionsManager(): User
{
    $user = User::factory()->create();
    $permissions = collect([
        'roles.view',
        'roles.create',
        'roles.update',
        'roles.delete',
    ])->map(
        fn (string $name): Permission => Permission::findOrCreate($name, 'web'),
    );

    $user->givePermissionTo($permissions);

    return $user;
}

it('returns only matching roles and defers the permission catalog', function () {
    $manager = rolePermissionsManager();
    $permission = Permission::create([
        'name' => 'inventory.view',
        'guard_name' => 'web',
    ]);

    $matchingRole = Role::create([
        'name' => 'Inventory manager',
        'guard_name' => 'web',
    ]);
    $matchingRole->givePermissionTo($permission);

    Role::create([
        'name' => 'Customer',
        'guard_name' => 'web',
    ]);

    $this->actingAs($manager)
        ->get(route('settings.roles', [
            'search' => 'manager',
            'permission_id' => $permission->id,
            'sort' => 'name',
            'direction' => 'asc',
        ]))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('settings/roles/index')
            ->missing('roles')
            ->missing('abilities')
            ->has('auth.permissions', 4)
            ->where('auth.permissions.0', 'roles.create')
            ->loadDeferredProps(['role-list', 'role-permissions'], function (AssertableInertia $page): void {
                $page->where('roles.total', 1)
                    ->where('roles.data.0.name', 'Inventory manager')
                    ->has('permissions', 5)
                    ->where('permissions.0.name', 'inventory.view')
                    ->reloadOnly(['roles', 'filters'], fn (AssertableInertia $page) => $page
                        ->missing('permissions'));
            }));
});

it('updates a custom role and replaces its permissions', function () {
    $manager = rolePermissionsManager();
    $oldPermission = Permission::create([
        'name' => 'reports.view',
        'guard_name' => 'web',
    ]);
    $newPermission = Permission::create([
        'name' => 'reports.export',
        'guard_name' => 'web',
    ]);
    $role = Role::create([
        'name' => 'reporter',
        'guard_name' => 'web',
    ]);
    $role->givePermissionTo($oldPermission);

    $this->actingAs($manager)
        ->from(route('settings.roles'))
        ->patch(route('settings.roles.update', $role), [
            'name' => 'report manager',
            'permission_ids' => [$newPermission->id],
        ])
        ->assertRedirect(route('settings.roles'));

    $role->refresh();
    expect($role->name)->toBe('report manager');
    expect($role->hasPermissionTo($oldPermission))->toBeFalse();
    expect($role->hasPermissionTo($newPermission))->toBeTrue();
});

it('paginates and sorts roles on the server', function () {
    $manager = rolePermissionsManager();

    foreach (range(1, 12) as $number) {
        Role::create([
            'name' => sprintf('Role %02d', $number),
            'guard_name' => 'web',
        ]);
    }

    $this->actingAs($manager)
        ->get(route('settings.roles', [
            'page' => 2,
            'per_page' => 10,
            'sort' => 'name',
            'direction' => 'desc',
        ]))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->missing('roles')
            ->loadDeferredProps('role-list', fn (AssertableInertia $page) => $page
                ->where('roles.current_page', 2)
                ->where('roles.last_page', 2)
                ->where('roles.data.0.name', 'Role 02')
                ->where('roles.total', 12)));
});

it('denies access to users without the roles view permission', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('settings.roles'))
        ->assertForbidden();
});

it('redirects guests to login before showing roles', function () {
    $this->get(route('settings.roles'))
        ->assertRedirect(route('login'));
});

it('denies role creation without the roles create permission', function () {
    $viewer = User::factory()->create();
    $viewer->givePermissionTo(Permission::findOrCreate('roles.view', 'web'));

    $this->actingAs($viewer)
        ->post(route('settings.roles.store'), ['name' => 'Unauthorized'])
        ->assertForbidden();

    $this->assertDatabaseCount('roles', 0);
});

it('rejects unapproved sort columns', function () {
    $manager = rolePermissionsManager();

    $this->actingAs($manager)
        ->from(route('settings.roles'))
        ->get(route('settings.roles', ['sort' => 'name;drop table roles']))
        ->assertRedirect(route('settings.roles'))
        ->assertSessionHasErrors('sort');
});

it('creates a role and synchronizes its selected permissions', function () {
    $manager = rolePermissionsManager();
    $permission = Permission::create([
        'name' => 'orders.view',
        'guard_name' => 'web',
    ]);

    $this->actingAs($manager)
        ->from(route('settings.roles'))
        ->post(route('settings.roles.store'), [
            'name' => 'Order manager',
            'permission_ids' => [$permission->id],
        ])
        ->assertRedirect(route('settings.roles'));

    $role = Role::findByName('Order manager', 'web');

    $this->assertModelExists($role);
    expect($role->is_system)->toBeFalse();
    expect($role->hasPermissionTo($permission))->toBeTrue();
});

it('rejects duplicate role names', function () {
    $manager = rolePermissionsManager();
    Role::create(['name' => 'Manager', 'guard_name' => 'web']);

    $this->actingAs($manager)
        ->from(route('settings.roles'))
        ->post(route('settings.roles.store'), ['name' => 'Manager'])
        ->assertRedirect(route('settings.roles'))
        ->assertSessionHasErrors('name');

    $this->assertDatabaseCount('roles', 1);
});

it('does not allow a system role to be edited', function () {
    $manager = rolePermissionsManager();
    $role = Role::create([
        'name' => 'admin',
        'guard_name' => 'web',
        'is_system' => true,
    ]);

    $this->actingAs($manager)
        ->patch(route('settings.roles.update', $role), [
            'name' => 'renamed-admin',
        ])
        ->assertForbidden();

    expect($role->fresh()->name)->toBe('admin');
});

it('does not allow a system role to be deleted', function () {
    $manager = rolePermissionsManager();
    $role = Role::create([
        'name' => 'admin',
        'guard_name' => 'web',
        'is_system' => true,
    ]);

    $this->actingAs($manager)
        ->delete(route('settings.roles.destroy', $role))
        ->assertForbidden();

    $this->assertModelExists($role);
});

it('rejects a bulk delete containing a system role without deleting any roles', function () {
    $manager = rolePermissionsManager();
    $customRole = Role::create([
        'name' => 'manager',
        'guard_name' => 'web',
    ]);
    $systemRole = Role::create([
        'name' => 'admin',
        'guard_name' => 'web',
        'is_system' => true,
    ]);

    $this->actingAs($manager)
        ->delete(route('settings.roles.bulk-destroy'), [
            'ids' => [$customRole->id, $systemRole->id],
        ])
        ->assertSessionHasErrors('ids');

    $this->assertModelExists($customRole);
    $this->assertModelExists($systemRole);
});

it('deletes selected custom roles in one operation', function () {
    $manager = rolePermissionsManager();
    $roles = collect(['editor', 'support'])->map(
        fn (string $name): Role => Role::create([
            'name' => $name,
            'guard_name' => 'web',
        ]),
    );

    $this->actingAs($manager)
        ->from(route('settings.roles'))
        ->delete(route('settings.roles.bulk-destroy'), [
            'ids' => $roles->map(fn (Role $role): int => (int) $role->id)->all(),
        ])
        ->assertRedirect(route('settings.roles'));

    $roles->each(fn (Role $role) => $this->assertModelMissing($role));
});

it('marks the seeded administrator role as system and grants role management permissions', function () {
    $this->seed(RolePermissionSeeder::class);

    $adminRole = Role::findByName('admin', 'web');

    expect($adminRole->is_system)->toBeTrue();
    expect($adminRole->hasPermissionTo('roles.view'))->toBeTrue();
    expect($adminRole->hasPermissionTo('roles.delete'))->toBeTrue();
});
