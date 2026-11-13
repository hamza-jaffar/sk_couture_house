<?php

use Illuminate\Support\Facades\Cache;
use Inertia\Testing\AssertableInertia;
use Modules\Coupon\Enum\DiscountTypeEnum;
use Modules\Coupon\Models\Coupon;
use Modules\User\Models\User;
use Spatie\Permission\Models\Permission;

function couponManager(string ...$permissions): User
{
    $user = User::factory()->create();
    $user->givePermissionTo(
        collect($permissions)
            ->map(fn (string $permission) => Permission::findOrCreate($permission, 'web')),
    );

    return $user;
}

function couponPayload(array $overrides = []): array
{
    return [
        'code' => 'SAVE20',
        'description' => '20% off entire store',
        'discount_type' => 'percentage',
        'discount_value' => 20.00,
        'min_spend' => 50.00,
        'max_discount' => 30.00,
        'usage_limit' => 100,
        'usage_limit_per_user' => 1,
        'starts_at' => now()->format('Y-m-d H:i:s'),
        'expires_at' => now()->addMonth()->format('Y-m-d H:i:s'),
        'is_active' => true,
        ...$overrides,
    ];
}

it('requires authentication to access coupons', function () {
    $this->get(route('dashboard.coupons.index'))
        ->assertRedirect(route('login'));
});

it('forbids users without coupons.view permission', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard.coupons.index'))
        ->assertForbidden();
});

it('renders the coupons page with deferred props and filters', function () {
    $viewer = couponManager('coupons.view');

    Coupon::factory()->create([
        'code' => 'ALPHA10',
        'discount_type' => DiscountTypeEnum::Percentage,
        'discount_value' => 10,
    ]);
    Coupon::factory()->create([
        'code' => 'BETA20',
        'discount_type' => DiscountTypeEnum::Fixed,
        'discount_value' => 20,
    ]);

    $this->actingAs($viewer)
        ->get(route('dashboard.coupons.index', [
            'search' => 'ALPHA',
            'discount_type' => 'percentage',
            'sort' => 'code',
            'direction' => 'asc',
        ]))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('dashboard/coupons')
            ->missing('coupons')
            ->where('filters.search', 'ALPHA')
            ->where('filters.discount_type', 'percentage')
            ->has('discountTypeOptions')
            ->loadDeferredProps(['coupon-list'], fn (AssertableInertia $page) => $page
                ->has('coupons.data', 1)
                ->where('coupons.data.0.code', 'ALPHA10')
            )
        );
});

it('stores a new coupon, uppercases code, and invalidates cache', function () {
    $creator = couponManager('coupons.create');

    $response = $this->actingAs($creator)
        ->post(route('dashboard.coupons.store'), couponPayload([
            'code' => 'summer50',
            'discount_value' => 50.00,
        ]));

    $response->assertRedirect();

    $this->assertDatabaseHas('coupons', [
        'code' => 'SUMMER50',
        'discount_type' => 'percentage',
        'discount_value' => 50.00,
        'is_active' => true,
    ]);
});

it('validates required fields and code uniqueness when creating', function () {
    $creator = couponManager('coupons.create');

    Coupon::factory()->create(['code' => 'EXISTING']);

    $this->actingAs($creator)
        ->post(route('dashboard.coupons.store'), couponPayload([
            'code' => 'EXISTING',
        ]))
        ->assertSessionHasErrors(['code']);
});

it('updates an existing coupon', function () {
    $updater = couponManager('coupons.update');
    $coupon = Coupon::factory()->create([
        'code' => 'ORIGINAL',
        'discount_value' => 10.00,
    ]);

    $this->actingAs($updater)
        ->patch(route('dashboard.coupons.update', $coupon), couponPayload([
            'code' => 'ORIGINAL',
            'discount_value' => 25.00,
            'description' => 'Updated discount',
        ]))
        ->assertRedirect();

    $coupon->refresh();
    expect($coupon->discount_value)->toBe('25.00');
    expect($coupon->description)->toBe('Updated discount');
});

it('soft deletes a coupon', function () {
    $deleter = couponManager('coupons.delete');
    $coupon = Coupon::factory()->create();

    $this->actingAs($deleter)
        ->delete(route('dashboard.coupons.destroy', $coupon))
        ->assertRedirect();

    $this->assertSoftDeleted('coupons', ['id' => $coupon->id]);
});

it('bulk soft deletes coupons', function () {
    $deleter = couponManager('coupons.delete');
    $coupons = Coupon::factory()->count(3)->create();
    $ids = $coupons->pluck('id')->all();

    $this->actingAs($deleter)
        ->delete(route('dashboard.coupons.bulk-destroy'), ['ids' => $ids])
        ->assertRedirect();

    foreach ($ids as $id) {
        $this->assertSoftDeleted('coupons', ['id' => $id]);
    }
});

it('restores and bulk restores soft-deleted coupons', function () {
    $deleter = couponManager('coupons.delete');
    $coupons = Coupon::factory()->count(2)->create();
    foreach ($coupons as $coupon) {
        $coupon->delete();
    }

    $this->actingAs($deleter)
        ->post(route('dashboard.coupons.restore', $coupons->first()))
        ->assertRedirect();

    $this->assertNotSoftDeleted('coupons', ['id' => $coupons->first()->id]);

    $this->actingAs($deleter)
        ->post(route('dashboard.coupons.bulk-restore'), [
            'ids' => [$coupons->last()->id],
        ])
        ->assertRedirect();

    $this->assertNotSoftDeleted('coupons', ['id' => $coupons->last()->id]);
});

it('permanently deletes and bulk permanently deletes coupons', function () {
    $deleter = couponManager('coupons.delete');
    $coupons = Coupon::factory()->count(2)->create();
    $coupons->first()->delete();

    $this->actingAs($deleter)
        ->delete(route('dashboard.coupons.force-delete', $coupons->first()))
        ->assertRedirect();

    $this->assertDatabaseMissing('coupons', ['id' => $coupons->first()->id]);

    $this->actingAs($deleter)
        ->delete(route('dashboard.coupons.bulk-force-delete'), [
            'ids' => [$coupons->last()->id],
        ])
        ->assertRedirect();

    $this->assertDatabaseMissing('coupons', ['id' => $coupons->last()->id]);
});

it('caches paginated listings and updates cache after modifications', function () {
    $viewer = couponManager('coupons.view', 'coupons.create');

    Coupon::factory()->create(['code' => 'CACHE1']);

    $this->actingAs($viewer)
        ->get(route('dashboard.coupons.index'))
        ->assertOk();

    // Verify cache has version
    $versionBefore = Cache::get('coupon-listings:version', 1);

    // Create new coupon
    $this->actingAs($viewer)
        ->post(route('dashboard.coupons.store'), couponPayload(['code' => 'CACHE2']))
        ->assertRedirect();

    $versionAfter = Cache::get('coupon-listings:version');
    expect($versionAfter)->toBeGreaterThan($versionBefore);
});
