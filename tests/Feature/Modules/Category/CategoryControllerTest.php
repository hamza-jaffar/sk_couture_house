<?php

use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia;
use Modules\Category\Models\Category;
use Modules\Gallery\Models\Media;
use Modules\User\Models\User;
use Spatie\Permission\Models\Permission;

function categoryManager(string ...$permissions): User
{
    $user = User::factory()->create();
    $user->givePermissionTo(
        collect($permissions)
            ->map(fn (string $permission) => Permission::findOrCreate($permission, 'web')),
    );

    return $user;
}

function categoryPayload(array $overrides = []): array
{
    return [
        'name' => 'Summer Dresses',
        'parent_id' => null,
        'description' => 'Seasonal styles',
        'is_active' => true,
        'is_featured' => false,
        'meta_title' => 'Summer Dresses',
        'meta_description' => 'Shop summer dresses',
        'meta_keywords' => 'summer, dresses',
        ...$overrides,
    ];
}

function categoryGalleryImage(string $name, string $type = 'image'): Media
{
    return Media::query()->create([
        'uuid' => (string) Str::uuid(),
        'file_name' => $name,
        'original_file_name' => $name,
        'mime_type' => $type === 'image' ? 'image/png' : 'application/pdf',
        'disk' => 'public',
        'path' => 'gallery/'.$name,
        'size' => 100,
        'type' => $type,
    ]);
}

it('defers category rows and filters children by selected parent with server pagination', function () {
    $viewer = categoryManager('collections.view');
    $parent = Category::query()->create([
        'name' => 'Clothing',
        'slug' => 'clothing',
    ]);
    $otherParent = Category::query()->create([
        'name' => 'Accessories',
        'slug' => 'accessories',
    ]);

    Category::query()->create([
        'name' => 'Summer dresses',
        'slug' => 'summer-dresses',
        'parent_id' => $parent->id,
    ]);
    Category::query()->create([
        'name' => 'Winter dresses',
        'slug' => 'winter-dresses',
        'parent_id' => $parent->id,
    ]);
    Category::query()->create([
        'name' => 'Summer bags',
        'slug' => 'summer-bags',
        'parent_id' => $otherParent->id,
    ]);
    foreach (range(1, 10) as $number) {
        Category::query()->create([
            'name' => 'Winter '.$number,
            'slug' => 'winter-'.$number,
            'parent_id' => $parent->id,
        ]);
    }

    $this->actingAs($viewer)
        ->get(route('dashboard.collection.index', [
            'parent' => $parent->slug,
            'sort' => 'name',
            'direction' => 'desc',
            'page' => 2,
            'per_page' => 10,
        ]))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('dashboard/collection')
            ->missing('categories')
            ->missing('parentOptions')
            ->where('filters.parent', $parent->slug)
            ->loadDeferredProps(['category-list'], fn (AssertableInertia $page) => $page
                ->where('categories.total', 12)
                ->where('categories.current_page', 2)
                ->where('categories.per_page', 10)
                ->where('categories.data.1.name', 'Summer dresses')
                ->where('categories.data.1.parent.name', 'Clothing')
                ->has('categories.data', 2)));
});

it('creates and updates categories and invalidates cached listings', function () {
    $manager = categoryManager(
        'collections.view',
        'collections.create',
        'collections.update',
    );
    $image = categoryGalleryImage('summer-dresses.png');
    $banner = categoryGalleryImage('summer-banner.png');

    $this->actingAs($manager)
        ->get(route('dashboard.collection.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->loadDeferredProps(['category-list'], fn (AssertableInertia $page) => $page
                ->where('categories.total', 0)));

    $this->post(route('dashboard.collection.store'), categoryPayload([
        'image_path' => $image->path,
        'banner_path' => $banner->path,
    ]))
        ->assertRedirect();

    $category = Category::query()->where('name', 'Summer Dresses')->firstOrFail();
    expect($category->slug)->toBe('summer-dresses');
    $this->assertDatabaseHas('categories', [
        'id' => $category->id,
        'image_path' => $image->path,
        'banner_path' => $banner->path,
    ]);

    $this->get(route('dashboard.collection.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->loadDeferredProps(['category-list'], fn (AssertableInertia $page) => $page
                ->where('categories.total', 1)
                ->where('categories.data.0.name', 'Summer Dresses')));

    $this->patch(
        route('dashboard.collection.update', $category),
        categoryPayload([
            'name' => 'Evening Dresses',
            'is_active' => false,
            'is_featured' => true,
            'image_path' => $image->path,
            'banner_path' => $banner->path,
        ]),
    )->assertRedirect();

    $this->assertDatabaseHas('categories', [
        'id' => $category->id,
        'slug' => 'evening-dresses',
        'image_path' => $image->path,
        'banner_path' => $banner->path,
        'is_active' => false,
        'is_featured' => true,
    ]);

    $this->get(route('dashboard.collection.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->loadDeferredProps(['category-list'], fn (AssertableInertia $page) => $page
                ->where('categories.data.0.name', 'Evening Dresses')));
});

it('keeps slugs unique across trashed categories and excludes the current category on update', function () {
    $manager = categoryManager('collections.create', 'collections.update');
    $trashedCategory = Category::query()->create([
        'name' => 'Summer Dresses',
        'slug' => 'summer-dresses',
    ]);
    $trashedCategory->delete();

    $category = Category::query()->create([
        'name' => 'Existing',
        'slug' => 'existing',
    ]);

    $this->actingAs($manager)
        ->post(route('dashboard.collection.store'), categoryPayload())
        ->assertRedirect();

    $this->assertDatabaseHas('categories', [
        'name' => 'Summer Dresses',
        'slug' => 'summer-dresses-2',
        'deleted_at' => null,
    ]);

    $this->patch(
        route('dashboard.collection.update', $category),
        categoryPayload(['name' => 'Existing']),
    )->assertRedirect();

    $this->assertDatabaseHas('categories', [
        'id' => $category->id,
        'slug' => 'existing',
    ]);
});

it('uses the category fallback when its name cannot produce a slug', function () {
    $manager = categoryManager('collections.create');

    $this->actingAs($manager)
        ->post(route('dashboard.collection.store'), categoryPayload([
            'name' => '!!!',
        ]))
        ->assertRedirect();

    $this->assertDatabaseHas('categories', [
        'name' => '!!!',
        'slug' => 'category',
    ]);
});

it('accepts only active public gallery images for category image paths', function () {
    $manager = categoryManager('collections.create');
    $document = categoryGalleryImage('guide.pdf', 'document');

    $this->actingAs($manager)
        ->post(route('dashboard.collection.store'), categoryPayload([
            'image_path' => $document->path,
        ]))
        ->assertSessionHasErrors('image_path');

    $this->assertDatabaseMissing('categories', [
        'name' => 'Summer Dresses',
    ]);

    $image = categoryGalleryImage('deleted-image.png');
    $image->delete();

    $this->post(route('dashboard.collection.store'), categoryPayload([
        'image_path' => $image->path,
    ]))
        ->assertSessionHasErrors('image_path');
});

it('validates parent categories and prevents circular hierarchies', function () {
    $manager = categoryManager('collections.create', 'collections.update');
    $parent = Category::query()->create([
        'name' => 'Clothing',
        'slug' => 'clothing',
    ]);
    $child = Category::query()->create([
        'name' => 'Dresses',
        'slug' => 'dresses',
        'parent_id' => $parent->id,
    ]);

    $this->actingAs($manager)
        ->post(route('dashboard.collection.store'), categoryPayload([
            'parent_id' => 99999,
        ]))
        ->assertSessionHasErrors('parent_id');

    $this->patch(
        route('dashboard.collection.update', $parent),
        categoryPayload([
            'name' => 'Clothing',
            'parent_id' => $child->id,
        ]),
    )
        ->assertRedirect()
        ->assertSessionHasErrors('parent_id');

    $this->assertDatabaseHas('categories', [
        'id' => $parent->id,
        'parent_id' => null,
    ]);
});

it('soft deletes and restores categories while keeping trash state out of active listings', function () {
    $manager = categoryManager('collections.view', 'collections.delete');
    $category = Category::query()->create([
        'name' => 'Seasonal',
        'slug' => 'seasonal',
    ]);

    $this->actingAs($manager)
        ->get(route('dashboard.collection.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->loadDeferredProps(['category-list'], fn (AssertableInertia $page) => $page
                ->where('categories.total', 1)));

    $this->delete(route('dashboard.collection.destroy', $category))
        ->assertRedirect();

    $this->assertSoftDeleted('categories', ['id' => $category->id]);

    $this->get(route('dashboard.collection.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->loadDeferredProps(['category-list'], fn (AssertableInertia $page) => $page
                ->where('categories.total', 0)));

    $this->post(route('dashboard.collection.restore', $category->slug))
        ->assertRedirect();

    $this->assertDatabaseHas('categories', [
        'id' => $category->id,
        'deleted_at' => null,
    ]);

    $this->delete(route('dashboard.collection.destroy', $category))
        ->assertRedirect();
    $this->delete(route('dashboard.collection.force-delete', $category->slug))
        ->assertRedirect();

    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});

it('requires child categories to be trashed and permanently deleted before their parent', function () {
    $manager = categoryManager('collections.delete');
    $parent = Category::query()->create([
        'name' => 'Clothing',
        'slug' => 'clothing',
    ]);
    $child = Category::query()->create([
        'name' => 'Dresses',
        'slug' => 'dresses',
        'parent_id' => $parent->id,
    ]);

    $this->actingAs($manager)
        ->delete(route('dashboard.collection.destroy', $parent))
        ->assertSessionHasErrors('ids');

    $this->delete(route('dashboard.collection.destroy', $child))
        ->assertRedirect();
    $this->delete(route('dashboard.collection.destroy', $parent))
        ->assertRedirect();

    $this->post(route('dashboard.collection.restore', $child->slug))
        ->assertSessionHasErrors('ids');
    $this->post(route('dashboard.collection.restore', $parent->slug))
        ->assertRedirect();
    $this->post(route('dashboard.collection.restore', $child->slug))
        ->assertRedirect();

    $this->delete(route('dashboard.collection.destroy', $child))
        ->assertRedirect();
    $this->delete(route('dashboard.collection.destroy', $parent))
        ->assertRedirect();
    $this->delete(route('dashboard.collection.force-delete', $parent->slug))
        ->assertSessionHasErrors('ids');
    $this->delete(route('dashboard.collection.force-delete', $child->slug))
        ->assertRedirect();
    $this->delete(route('dashboard.collection.force-delete', $parent->slug))
        ->assertRedirect();

    $this->assertDatabaseMissing('categories', ['id' => $parent->id]);
    $this->assertDatabaseMissing('categories', ['id' => $child->id]);
});

it('bulk deletes, restores, and force deletes a selected category subtree', function () {
    $manager = categoryManager('collections.delete');
    $parent = Category::query()->create([
        'name' => 'Clothing',
        'slug' => 'clothing',
    ]);
    $child = Category::query()->create([
        'name' => 'Dresses',
        'slug' => 'dresses',
        'parent_id' => $parent->id,
    ]);

    $this->actingAs($manager)
        ->delete(route('dashboard.collection.bulk-destroy'), [
            'ids' => [$parent->id, $child->id],
        ])
        ->assertRedirect();

    $this->assertSoftDeleted('categories', ['id' => $parent->id]);
    $this->assertSoftDeleted('categories', ['id' => $child->id]);

    $this->post(route('dashboard.collection.bulk-restore'), [
        'ids' => [$child->id, $parent->id],
    ])->assertRedirect();

    $this->assertDatabaseHas('categories', [
        'id' => $parent->id,
        'deleted_at' => null,
    ]);
    $this->assertDatabaseHas('categories', [
        'id' => $child->id,
        'deleted_at' => null,
    ]);

    $this->delete(route('dashboard.collection.bulk-destroy'), [
        'ids' => [$parent->id, $child->id],
    ])->assertRedirect();
    $this->delete(route('dashboard.collection.bulk-force-delete'), [
        'ids' => [$parent->id, $child->id],
    ])->assertRedirect();

    $this->assertDatabaseMissing('categories', ['id' => $parent->id]);
    $this->assertDatabaseMissing('categories', ['id' => $child->id]);
});

it('denies access without collection permissions and rejects invalid server filters', function () {
    $viewer = User::factory()->create();

    $this->actingAs($viewer)
        ->get(route('dashboard.collection.index'))
        ->assertForbidden();

    $manager = categoryManager('collections.view');
    $this->actingAs($manager)
        ->get(route('dashboard.collection.index', [
            'sort' => 'name;drop table categories',
        ]))
        ->assertRedirect(route('dashboard.collection.index'))
        ->assertSessionHasErrors('sort');

    $this->get(route('dashboard.collection.index', [
        'parent' => '99999',
    ]))
        ->assertSessionHasErrors('parent');
});

it('returns a category 404 for guests', function () {
    $this->get(route('dashboard.collection.index'))
        ->assertRedirect(route('login'));
});
