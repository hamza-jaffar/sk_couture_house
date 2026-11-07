<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia;
use Modules\User\Database\Seeders\UserDemoDataSeeder;
use Modules\User\Models\Role;
use Modules\User\Models\User;
use Spatie\Permission\Models\Permission;

function userIndexViewer(): User
{
    $user = User::factory()->create();
    $user->givePermissionTo(Permission::findOrCreate('users.view', 'web'));

    return $user;
}

function userManagementActor(string $permission): User
{
    $user = User::factory()->create();
    $user->givePermissionTo(Permission::findOrCreate($permission, 'web'));

    return $user;
}

function userManagementAdminRole(): Role
{
    return Role::query()->firstOrCreate(
        ['name' => 'admin', 'guard_name' => 'web'],
        ['is_system' => true],
    );
}

function userManagementAdministrator(): User
{
    $user = userManagementActor('users.delete');
    $user->assignRole(userManagementAdminRole());

    return $user;
}

it('searches, filters, sorts, and paginates internal users on the server', function () {
    $viewer = userIndexViewer();
    $staffRole = Role::create([
        'name' => 'staff',
        'guard_name' => 'web',
    ]);
    $customerRole = Role::create([
        'name' => 'customer',
        'guard_name' => 'web',
        'is_system' => true,
    ]);

    foreach (range(1, 12) as $number) {
        User::factory()
            ->create([
                'name' => sprintf('Staff %02d', $number),
                'email' => sprintf('staff%02d@example.test', $number),
            ])
            ->assignRole($staffRole);
    }

    User::factory()
        ->create([
            'name' => 'Customer Example',
            'email' => 'customer@example.test',
        ])
        ->assignRole($customerRole);

    $this->actingAs($viewer)
        ->get(route('settings.users', [
            'search' => 'Staff',
            'role_id' => $staffRole->id,
            'sort' => 'name',
            'direction' => 'desc',
            'page' => 2,
            'per_page' => 10,
        ]))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('settings/users')
            ->missing('users')
            ->where('isAdmin', false)
            ->where('filters.role_id', (string) $staffRole->id)
            ->loadDeferredProps(['user-list', 'user-roles'], fn (AssertableInertia $page) => $page
                ->where('users.total', 12)
                ->where('users.current_page', 2)
                ->where('users.per_page', 10)
                ->where('users.data.0.name', 'Staff 02')
                ->where('users.data.1.name', 'Staff 01')
                ->where('users.data.0.roles.0.name', 'staff')
                ->where('users.data.0.roles.0.is_system', false)
                ->has('roles', 1)
                ->where('roles.0.name', 'staff')
                ->where('roles.0.is_system', false)));
});

it('returns internal-user totals without counting customer role assignments', function () {
    $viewer = userIndexViewer();
    $staffRole = Role::create(['name' => 'staff', 'guard_name' => 'web']);
    $customerRole = Role::create([
        'name' => 'customer',
        'guard_name' => 'web',
        'is_system' => true,
    ]);

    User::factory()
        ->create(['name' => 'Staff Account'])
        ->assignRole($staffRole);
    User::factory()
        ->create(['name' => 'Customer Account'])
        ->assignRole($customerRole);
    User::factory()
        ->create(['name' => 'Customer With Staff Role'])
        ->assignRole($customerRole, $staffRole);

    $this->actingAs($viewer)
        ->get(route('settings.users', ['per_page' => 20]))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->loadDeferredProps(['user-list'], fn (AssertableInertia $page) => $page
                ->where('users.total', 2)
                ->has('users.data', 2)));
});

it('rejects invalid user filters', function (array $filters, string $field) {
    $viewer = userIndexViewer();

    $this->actingAs($viewer)
        ->from(route('settings.users'))
        ->get(route('settings.users', $filters))
        ->assertRedirect(route('settings.users'))
        ->assertSessionHasErrors($field);
})->with([
    'unknown sort column' => [['sort' => 'email;drop table users'], 'sort'],
    'unknown role id' => [['role_id' => 999999], 'role_id'],
]);

it('forbids authenticated users without the users view permission', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('settings.users'))
        ->assertForbidden();
});

it('redirects guests to login before showing users', function () {
    $this->get(route('settings.users'))
        ->assertRedirect(route('login'));
});

it('creates an internal user with a hashed password and selected roles', function () {
    $actor = userManagementActor('users.create');
    $role = Role::create([
        'name' => 'manager',
        'guard_name' => 'web',
    ]);

    $this->actingAs($actor)
        ->post(route('settings.users.store'), [
            'name' => 'New Manager',
            'email' => 'manager@example.test',
            'password' => 'StrongPassword123!',
            'password_confirmation' => 'StrongPassword123!',
            'role_id' => (string) $role->id,
        ])
        ->assertRedirect(route('settings.users'));

    $user = User::query()->where('email', 'manager@example.test')->firstOrFail();

    $this->assertModelExists($user);
    expect(Hash::check('StrongPassword123!', $user->password))->toBeTrue()
        ->and($user->hasRole($role))->toBeTrue()
        ->and($user->roles)->toHaveCount(1);
});

it('rejects assigning multiple roles when creating a user', function () {
    $actor = userManagementActor('users.create');
    $firstRole = Role::create(['name' => 'manager', 'guard_name' => 'web']);
    $secondRole = Role::create(['name' => 'support', 'guard_name' => 'web']);

    $this->actingAs($actor)
        ->from(route('settings.users'))
        ->post(route('settings.users.store'), [
            'name' => 'Multi-role User',
            'email' => 'multi-role@example.test',
            'password' => 'StrongPassword123!',
            'password_confirmation' => 'StrongPassword123!',
            'role_id' => [$firstRole->id, $secondRole->id],
        ])
        ->assertRedirect(route('settings.users'))
        ->assertSessionHasErrors('role_id');

    $this->assertDatabaseMissing('users', ['email' => 'multi-role@example.test']);
});

it('rejects duplicate email addresses and weak passwords when creating a user', function () {
    $actor = userManagementActor('users.create');
    User::factory()->create(['email' => 'existing@example.test']);

    $this->actingAs($actor)
        ->from(route('settings.users'))
        ->post(route('settings.users.store'), [
            'name' => 'Duplicate User',
            'email' => 'existing@example.test',
            'password' => 'short',
            'password_confirmation' => 'different',
        ])
        ->assertRedirect(route('settings.users'))
        ->assertSessionHasErrors(['email', 'password']);
});

it('forbids users without create permission from creating users', function () {
    $actor = User::factory()->create();

    $this->actingAs($actor)
        ->post(route('settings.users.store'), [
            'name' => 'Unauthorized User',
            'email' => 'unauthorized@example.test',
            'password' => 'StrongPassword123!',
            'password_confirmation' => 'StrongPassword123!',
        ])
        ->assertForbidden();

    $this->assertDatabaseMissing('users', ['email' => 'unauthorized@example.test']);
});

it('prevents non-administrators from assigning the administrator role', function () {
    $actor = userManagementActor('users.create');
    $adminRole = userManagementAdminRole();

    $this->actingAs($actor)
        ->from(route('settings.users'))
        ->post(route('settings.users.store'), [
            'name' => 'Unexpected Admin',
            'email' => 'unexpected-admin@example.test',
            'password' => 'StrongPassword123!',
            'password_confirmation' => 'StrongPassword123!',
            'role_id' => $adminRole->id,
        ])
        ->assertRedirect(route('settings.users'))
        ->assertSessionHasErrors('role_id');

    $this->assertDatabaseMissing('users', ['email' => 'unexpected-admin@example.test']);
});

it('changes assigned roles without modifying user details', function () {
    $actor = userManagementActor('users.update');
    $oldRole = Role::create([
        'name' => 'support',
        'guard_name' => 'web',
    ]);
    $newRole = Role::create([
        'name' => 'manager',
        'guard_name' => 'web',
    ]);
    $user = User::factory()->create([
        'name' => 'Old Name',
        'email' => 'old-name@example.test',
    ]);
    $user->assignRole($oldRole);

    $this->actingAs($actor)
        ->patch(route('settings.users.update', $user), [
            'name' => 'Tampered Name',
            'email' => 'tampered@example.test',
            'role_id' => (string) $newRole->id,
        ])
        ->assertRedirect(route('settings.users'));

    $user->refresh();
    expect($user->name)->toBe('Old Name')
        ->and($user->email)->toBe('old-name@example.test')
        ->and($user->hasRole($newRole))->toBeTrue()
        ->and($user->hasRole($oldRole))->toBeFalse()
        ->and($user->roles)->toHaveCount(1);
});

it('does not alter existing multiple role assignments when a multi-role update is rejected', function () {
    $actor = userManagementActor('users.update');
    $firstRole = Role::create(['name' => 'support', 'guard_name' => 'web']);
    $secondRole = Role::create(['name' => 'manager', 'guard_name' => 'web']);
    $user = User::factory()->create();
    $user->assignRole($firstRole, $secondRole);

    $this->actingAs($actor)
        ->from(route('settings.users'))
        ->patch(route('settings.users.update', $user), [
            'role_id' => [$firstRole->id, $secondRole->id],
        ])
        ->assertRedirect(route('settings.users'))
        ->assertSessionHasErrors('role_id');

    expect($user->fresh()->roles)->toHaveCount(2);
});

it('allows clearing every role without changing the user profile', function () {
    $actor = userManagementActor('users.update');
    $role = Role::create([
        'name' => 'support',
        'guard_name' => 'web',
    ]);
    $user = User::factory()->create([
        'name' => 'Support User',
        'email' => 'support@example.test',
    ]);
    $user->assignRole($role);

    $this->actingAs($actor)
        ->patch(route('settings.users.update', $user), [])
        ->assertRedirect(route('settings.users'));

    $user->refresh();
    expect($user->name)->toBe('Support User')
        ->and($user->email)->toBe('support@example.test')
        ->and($user->hasRole($role))->toBeFalse();
});

it('forbids users without update permission from changing user roles', function () {
    $actor = User::factory()->create();
    $user = User::factory()->create();
    $role = Role::create([
        'name' => 'manager',
        'guard_name' => 'web',
    ]);

    $this->actingAs($actor)
        ->patch(route('settings.users.update', $user), [
            'role_id' => $role->id,
        ])
        ->assertForbidden();

    expect($user->fresh()->hasRole($role))->toBeFalse();
});

it('prevents non-administrators from assigning admin role while updating users', function () {
    $actor = userManagementActor('users.update');
    $user = User::factory()->create();

    $this->actingAs($actor)
        ->from(route('settings.users'))
        ->patch(route('settings.users.update', $user), [
            'role_id' => userManagementAdminRole()->id,
        ])
        ->assertRedirect(route('settings.users'))
        ->assertSessionHasErrors('role_id');

    expect($user->fresh()->hasRole('admin'))->toBeFalse();
});

it('allows administrators to assign the administrator role to another user', function () {
    $actor = userManagementActor('users.update');
    $actor->assignRole(userManagementAdminRole());
    $user = User::factory()->create();

    $this->actingAs($actor)
        ->patch(route('settings.users.update', $user), [
            'role_id' => userManagementAdminRole()->id,
        ])
        ->assertRedirect(route('settings.users'));

    expect($user->fresh()->hasRole('admin'))->toBeTrue();
});

it('prevents the current user from changing their own role', function () {
    $actor = userManagementActor('users.update');
    $role = Role::create(['name' => 'manager', 'guard_name' => 'web']);
    $actor->assignRole($role);

    $this->actingAs($actor)
        ->patch(route('settings.users.update', $actor), [
            'role_id' => null,
        ])
        ->assertForbidden();

    expect($actor->fresh()->hasRole($role))->toBeTrue();
});

it('prevents non-administrators from modifying administrator accounts', function () {
    $actor = userManagementActor('users.update');
    $admin = User::factory()->create();
    $admin->assignRole(userManagementAdminRole());

    $this->actingAs($actor)
        ->patch(route('settings.users.update', $admin), [
            'role_id' => null,
        ])
        ->assertForbidden();

    expect($admin->fresh()->name)->toBe($admin->name)
        ->and($admin->fresh()->hasRole('admin'))->toBeTrue();
});

it('deletes another non-administrator user', function () {
    $actor = userManagementActor('users.delete');
    $user = User::factory()->create();

    $this->actingAs($actor)
        ->delete(route('settings.users.destroy', $user))
        ->assertRedirect(route('settings.users'));

    $this->assertDatabaseMissing('users', ['id' => $user->id]);
});

it('prevents users from deleting their own account', function () {
    $actor = userManagementActor('users.delete');

    $this->actingAs($actor)
        ->delete(route('settings.users.destroy', $actor))
        ->assertForbidden();

    $this->assertModelExists($actor);
});

it('forbids users without delete permission from deleting users individually or in bulk', function () {
    $actor = User::factory()->create();
    $individualTarget = User::factory()->create();
    $bulkTarget = User::factory()->create();

    $this->actingAs($actor)
        ->delete(route('settings.users.destroy', $individualTarget))
        ->assertForbidden();

    $this->actingAs($actor)
        ->delete(route('settings.users.bulk-destroy'), [
            'ids' => [$bulkTarget->id],
        ])
        ->assertForbidden();

    $this->assertModelExists($individualTarget);
    $this->assertModelExists($bulkTarget);
});

it('allows only administrators to delete administrator accounts', function () {
    $actor = userManagementActor('users.delete');
    $admin = User::factory()->create();
    $admin->assignRole(userManagementAdminRole());

    $this->actingAs($actor)
        ->delete(route('settings.users.destroy', $admin))
        ->assertForbidden();

    $this->assertModelExists($admin);
});

it('allows administrators to delete other administrator accounts', function () {
    $actor = userManagementAdministrator();
    $admin = User::factory()->create();
    $admin->assignRole(userManagementAdminRole());

    $this->actingAs($actor)
        ->delete(route('settings.users.destroy', $admin))
        ->assertRedirect(route('settings.users'));

    $this->assertDatabaseMissing('users', ['id' => $admin->id]);
});

it('allows administrators to bulk delete administrator and non-administrator accounts', function () {
    $actor = userManagementAdministrator();
    $admin = User::factory()->create();
    $admin->assignRole(userManagementAdminRole());
    $user = User::factory()->create();

    $this->actingAs($actor)
        ->delete(route('settings.users.bulk-destroy'), [
            'ids' => [$admin->id, $user->id],
        ])
        ->assertRedirect(route('settings.users'));

    $this->assertDatabaseMissing('users', ['id' => $admin->id]);
    $this->assertDatabaseMissing('users', ['id' => $user->id]);
});

it('bulk deletes selected users', function () {
    $actor = userManagementActor('users.delete');
    $users = User::factory()->count(2)->create();

    $this->actingAs($actor)
        ->delete(route('settings.users.bulk-destroy'), [
            'ids' => $users->modelKeys(),
        ])
        ->assertRedirect(route('settings.users'));

    foreach ($users as $user) {
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }
});

it('rejects bulk deletion containing the current user without deleting any selected users', function () {
    $actor = userManagementActor('users.delete');
    $other = User::factory()->create();

    $this->actingAs($actor)
        ->delete(route('settings.users.bulk-destroy'), [
            'ids' => [$actor->id, $other->id],
        ])
        ->assertForbidden();

    $this->assertModelExists($actor);
    $this->assertModelExists($other);
});

it('rejects non-administrator bulk deletion containing an administrator account', function () {
    $actor = userManagementActor('users.delete');
    $admin = User::factory()->create();
    $admin->assignRole(userManagementAdminRole());
    $other = User::factory()->create();

    $this->actingAs($actor)
        ->delete(route('settings.users.bulk-destroy'), [
            'ids' => [$admin->id, $other->id],
        ])
        ->assertForbidden();

    $this->assertModelExists($admin);
    $this->assertModelExists($other);
});

it('seeds demo roles, staff users, and customers idempotently', function () {
    $this->seed(UserDemoDataSeeder::class);

    $demoRoleNames = [
        'Store Manager',
        'Sales Associate',
        'Inventory Specialist',
        'Order Coordinator',
        'Customer Support',
        'Marketing Specialist',
        'Content Editor',
        'Product Curator',
        'Finance Assistant',
        'Operations Lead',
        'Warehouse Associate',
        'Returns Specialist',
        'Catalog Manager',
        'Analytics Viewer',
        'Promotion Manager',
    ];
    $sampleStaffUser = User::query()
        ->where('email', 'like', '%.staff%@example.test')
        ->firstOrFail();

    expect(Role::query()->whereIn('name', $demoRoleNames)->count())->toBe(15)
        ->and(User::query()->where('email', 'like', '%.staff%@example.test')->count())->toBe(1000)
        ->and(User::query()->where('email', 'like', '%.customer%@example.test')->count())->toBe(100_000)
        ->and($sampleStaffUser->name)->toContain(' ')
        ->and($sampleStaffUser->email)->toContain('.staff')
        ->and($sampleStaffUser->email)->toEndWith('@example.test')
        ->and(DB::table('model_has_roles')
            ->where('model_type', (new User)->getMorphClass())
            ->count())->toBe(101_000);

    $this->seed(UserDemoDataSeeder::class);

    expect(Role::query()->whereIn('name', $demoRoleNames)->count())->toBe(15)
        ->and(User::query()->where('email', 'like', '%.staff%@example.test')->count())->toBe(1000)
        ->and(User::query()->where('email', 'like', '%.customer%@example.test')->count())->toBe(100_000);
});

it('refuses to seed demo data outside local and testing environments', function () {
    $this->app->detectEnvironment(static fn (): string => 'production');

    expect(fn () => app(UserDemoDataSeeder::class)->run())
        ->toThrow(RuntimeException::class);
});
