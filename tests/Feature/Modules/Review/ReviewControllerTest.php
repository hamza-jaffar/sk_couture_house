<?php

use Illuminate\Support\Facades\Cache;
use Inertia\Testing\AssertableInertia;
use Modules\Product\Models\Product;
use Modules\Review\Enum\ReviewStatusEnum;
use Modules\Review\Models\Review;
use Modules\User\Models\User;
use Spatie\Permission\Models\Permission;

function reviewManager(string ...$permissions): User
{
    $user = User::factory()->create();
    $user->givePermissionTo(
        collect($permissions)
            ->map(fn (string $permission) => Permission::findOrCreate($permission, 'web')),
    );

    return $user;
}

it('requires authentication to access reviews', function () {
    $this->get(route('dashboard.reviews.index'))
        ->assertRedirect(route('login'));
});

it('forbids users without reviews.view permission', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard.reviews.index'))
        ->assertForbidden();
});

it('renders reviews page with deferred props and filters', function () {
    $viewer = reviewManager('reviews.view');
    $product = Product::factory()->create(['title' => 'Silk Dress']);

    Review::factory()->create([
        'product_id' => $product->id,
        'title' => 'Loved it',
        'rating' => 5,
        'status' => ReviewStatusEnum::Approved,
    ]);

    Review::factory()->create([
        'product_id' => $product->id,
        'title' => 'Average fit',
        'rating' => 3,
        'status' => ReviewStatusEnum::Pending,
    ]);

    $this->actingAs($viewer)
        ->get(route('dashboard.reviews.index', [
            'status' => 'approved',
            'rating' => '5',
            'sort' => 'rating',
            'direction' => 'desc',
        ]))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('dashboard/reviews')
            ->missing('reviews')
            ->where('filters.status', 'approved')
            ->where('filters.rating', '5')
            ->has('statusOptions')
            ->loadDeferredProps(['review-list'], fn (AssertableInertia $page) => $page
                ->has('reviews.data', 1)
                ->where('reviews.data.0.title', 'Loved it')
                ->where('reviews.data.0.rating', 5)
            )
        );
});

it('allows admin to respond to a customer review', function () {
    $admin = reviewManager('reviews.approve');
    $review = Review::factory()->create([
        'admin_response' => null,
    ]);

    $this->actingAs($admin)
        ->patch(route('dashboard.reviews.respond', $review), [
            'response' => 'Thank you for your feedback! We are thrilled you liked it.',
        ])
        ->assertRedirect();

    $review->refresh();
    expect($review->admin_response)->toBe('Thank you for your feedback! We are thrilled you liked it.')
        ->and($review->responded_at)->not->toBeNull()
        ->and($review->responded_by)->toBe($admin->id);
});

it('updates review status to approved or rejected', function () {
    $admin = reviewManager('reviews.approve');
    $review = Review::factory()->pending()->create();

    $this->actingAs($admin)
        ->patch(route('dashboard.reviews.status', $review), [
            'status' => 'approved',
        ])
        ->assertRedirect();

    $review->refresh();
    expect($review->status)->toBe(ReviewStatusEnum::Approved);

    $this->actingAs($admin)
        ->patch(route('dashboard.reviews.status', $review), [
            'status' => 'rejected',
        ])
        ->assertRedirect();

    $review->refresh();
    expect($review->status)->toBe(ReviewStatusEnum::Rejected);
});

it('bulk updates review status', function () {
    $admin = reviewManager('reviews.approve');
    $reviews = Review::factory()->pending()->count(3)->create();
    $ids = $reviews->pluck('id')->all();

    $this->actingAs($admin)
        ->post(route('dashboard.reviews.bulk-status'), [
            'ids' => $ids,
            'status' => 'approved',
        ])
        ->assertRedirect();

    foreach ($ids as $id) {
        expect(Review::query()->find($id)->status)->toBe(ReviewStatusEnum::Approved);
    }
});

it('soft deletes a review', function () {
    $deleter = reviewManager('reviews.delete');
    $review = Review::factory()->create();

    $this->actingAs($deleter)
        ->delete(route('dashboard.reviews.destroy', $review))
        ->assertRedirect();

    $this->assertSoftDeleted('product_reviews', ['id' => $review->id]);
});

it('bulk soft deletes reviews', function () {
    $deleter = reviewManager('reviews.delete');
    $reviews = Review::factory()->count(3)->create();
    $ids = $reviews->pluck('id')->all();

    $this->actingAs($deleter)
        ->delete(route('dashboard.reviews.bulk-destroy'), [
            'ids' => $ids,
        ])
        ->assertRedirect();

    foreach ($ids as $id) {
        $this->assertSoftDeleted('product_reviews', ['id' => $id]);
    }
});

it('restores and bulk restores reviews', function () {
    $deleter = reviewManager('reviews.delete');
    $reviews = Review::factory()->count(2)->create();
    foreach ($reviews as $review) {
        $review->delete();
    }

    $this->actingAs($deleter)
        ->post(route('dashboard.reviews.restore', $reviews->first()))
        ->assertRedirect();

    $this->assertNotSoftDeleted('product_reviews', ['id' => $reviews->first()->id]);

    $this->actingAs($deleter)
        ->post(route('dashboard.reviews.bulk-restore'), [
            'ids' => [$reviews->last()->id],
        ])
        ->assertRedirect();

    $this->assertNotSoftDeleted('product_reviews', ['id' => $reviews->last()->id]);
});

it('permanently deletes and bulk permanently deletes reviews', function () {
    $deleter = reviewManager('reviews.delete');
    $reviews = Review::factory()->count(2)->create();

    $this->actingAs($deleter)
        ->delete(route('dashboard.reviews.force-delete', $reviews->first()))
        ->assertRedirect();

    $this->assertDatabaseMissing('product_reviews', ['id' => $reviews->first()->id]);

    $this->actingAs($deleter)
        ->delete(route('dashboard.reviews.bulk-force-delete'), [
            'ids' => [$reviews->last()->id],
        ])
        ->assertRedirect();

    $this->assertDatabaseMissing('product_reviews', ['id' => $reviews->last()->id]);
});

it('invalidates cache when responding to review', function () {
    $admin = reviewManager('reviews.view', 'reviews.approve');
    $review = Review::factory()->create();

    $this->actingAs($admin)
        ->get(route('dashboard.reviews.index'))
        ->assertOk();

    $versionBefore = Cache::get('review-listings:version', 1);

    $this->actingAs($admin)
        ->patch(route('dashboard.reviews.respond', $review), [
            'response' => 'Admin response for cache test',
        ])
        ->assertRedirect();

    $versionAfter = Cache::get('review-listings:version');
    expect($versionAfter)->toBeGreaterThan($versionBefore);
});
