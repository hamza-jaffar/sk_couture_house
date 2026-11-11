<?php

use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia;
use Modules\Category\Models\Category;
use Modules\Gallery\Models\Media;
use Modules\Product\Models\Product;
use Modules\Product\Models\ProductVariant;
use Modules\User\Models\User;
use Spatie\Permission\Models\Permission;

function productManagerForTest(string ...$permissions): User
{
    $user = User::factory()->create();
    $user->givePermissionTo(
        collect($permissions)
            ->map(fn (string $permission) => Permission::findOrCreate($permission, 'web')),
    );

    return $user;
}

function productPayloadForTest(array $overrides = []): array
{
    return [
        'title' => 'Linen Shirt',
        'slug' => '',
        'short_description' => 'A breathable shirt.',
        'description' => '<p>Lightweight linen.</p>',
        'price' => '35.00',
        'sale_price' => null,
        'sale_start_at' => null,
        'sale_end_at' => null,
        'sku' => null,
        'stock' => 12,
        'type' => 'simple',
        'status' => 'draft',
        'is_featured' => false,
        'category_id' => null,
        'images' => [],
        'variant_options' => [],
        'variants' => [],
        'meta_title' => null,
        'meta_description' => null,
        'meta_keywords' => null,
        'canonical_url' => null,
        'og_title' => null,
        'og_description' => null,
        'og_image' => null,
        'robots_meta' => 'index, follow',
        ...$overrides,
    ];
}

function productGalleryImageForTest(string $name): Media
{
    return Media::query()->create([
        'uuid' => (string) Str::uuid(),
        'file_name' => $name,
        'original_file_name' => $name,
        'mime_type' => 'image/png',
        'disk' => 'public',
        'path' => 'gallery/'.$name,
        'size' => 100,
        'type' => 'image',
    ]);
}

function productCategoryForTest(string $name = 'Summer'): Category
{
    return Category::query()->create([
        'name' => $name,
        'slug' => Str::slug($name),
        'is_active' => true,
    ]);
}

function productRecordForTest(array $overrides = []): Product
{
    static $number = 0;
    $number++;
    $title = $overrides['title'] ?? 'Test product '.$number;

    return Product::query()->create([
        'title' => $title,
        'slug' => Str::slug($title),
        'price' => '20.00',
        'stock' => 4,
        'type' => 'simple',
        'status' => 'published',
        ...$overrides,
    ]);
}

it('serves filtered product results with server-side sorting and pagination', function () {
    $viewer = productManagerForTest('products.view');
    $category = productCategoryForTest();

    foreach (range(1, 12) as $number) {
        productRecordForTest([
            'title' => sprintf('Summer %02d', $number),
            'slug' => sprintf('summer-%02d', $number),
            'category_id' => $category->id,
            'type' => 'simple',
            'status' => 'published',
        ]);
    }

    productRecordForTest([
        'title' => 'Winter accessory',
        'slug' => 'winter-accessory',
        'status' => 'draft',
    ]);

    $this->actingAs($viewer)
        ->get(route('dashboard.product.index', [
            'search' => 'Summer',
            'category' => $category->slug,
            'type' => 'simple',
            'status' => 'published',
            'sort' => 'title',
            'direction' => 'desc',
            'page' => 2,
            'per_page' => 10,
        ]))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('dashboard/product/index')
            ->where('filters.category', $category->slug)
            ->where('filters.page', 2)
            ->loadDeferredProps(['product-list'], fn (AssertableInertia $page) => $page
                ->where('products.total', 12)
                ->where('products.current_page', 2)
                ->where('products.data.0.title', 'Summer 02')
                ->where('products.data.1.title', 'Summer 01')
                ->has('products.data', 2)));
});

it('renders dedicated create and edit pages with the product data needed by the form', function () {
    $creator = productManagerForTest('products.create');
    $editor = productManagerForTest('products.update');
    $image = productGalleryImageForTest('product-edit.png');
    $product = productRecordForTest([
        'title' => 'Product editing page',
        'slug' => 'product-editing-page',
        'images' => [$image->path],
        'variant_options' => [
            ['name' => 'Size', 'values' => ['M']],
        ],
    ]);
    $product->variants()->create([
        'sku' => 'product-edit-size-m',
        'name' => 'M',
        'stock' => 2,
        'attributes' => ['Size' => 'M'],
    ]);

    $this->actingAs($creator)
        ->get(route('dashboard.product.create'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('dashboard/product/create')
            ->has('formOptions.categories')
            ->has('formOptions.variant_presets'));

    $this->actingAs($editor)
        ->get(route('dashboard.product.edit', $product))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('dashboard/product/edit')
            ->where('product.slug', 'product-editing-page')
            ->where('product.images.0.path', $image->path)
            ->where('product.variants.0.name', 'M')
            ->has('formOptions.categories'));
});

it('creates products with gallery paths, unique slugs, and variant inventory', function () {
    $manager = productManagerForTest('products.create');
    $category = productCategoryForTest('Outerwear');
    $image = productGalleryImageForTest('wool-coat.png');
    $existing = productRecordForTest([
        'title' => 'Wool Coat',
        'slug' => 'wool-coat',
    ]);
    $existing->delete();

    $payload = productPayloadForTest([
        'title' => 'Wool Coat',
        'type' => 'variable',
        'category_id' => $category->id,
        'price' => '80.00',
        'stock' => 5,
        'images' => [$image->path],
        'variant_options' => [
            ['name' => 'Size', 'values' => ['S', 'M']],
        ],
        'variants' => [
            [
                'attributes' => ['Size' => 'S'],
            ],
            [
                'attributes' => ['Size' => 'M'],
            ],
        ],
    ]);

    $this->actingAs($manager)
        ->post(route('dashboard.product.store'), $payload)
        ->assertRedirect();

    $product = Product::query()->where('title', 'Wool Coat')->firstOrFail();

    expect($product->slug)->toBe('wool-coat-2')
        ->and($product->images)->toBe([$image->path])
        ->and($product->variant_options)->toBe([
            ['name' => 'Size', 'values' => ['S', 'M']],
        ])
        ->and($product->stock)->toBe(5)
        ->and($product->variants)->toHaveCount(2)
        ->and($product->variants->pluck('attributes')->all())->toBe([
            ['Size' => 'S'],
            ['Size' => 'M'],
        ]);

    $this->assertModelExists($product);
    $this->assertDatabaseHas('product_variants', [
        'product_id' => $product->id,
        'name' => 'M',
    ]);
});

it('updates products through their slug route and regenerates a unique slug', function () {
    $manager = productManagerForTest('products.update');
    $product = productRecordForTest([
        'title' => 'Original name',
        'slug' => 'original-name',
    ]);

    $this->actingAs($manager)
        ->patch(route('dashboard.product.update', $product), productPayloadForTest([
            'title' => 'Updated name',
            'status' => 'published',
        ]))
        ->assertRedirect();

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'slug' => 'updated-name',
        'status' => 'published',
    ]);
});

it('rejects gallery paths outside the public image gallery without saving a product', function () {
    $manager = productManagerForTest('products.create');

    $this->actingAs($manager)
        ->from(route('dashboard.product.index'))
        ->post(route('dashboard.product.store'), productPayloadForTest([
            'images' => ['private/not-in-gallery.png'],
        ]))
        ->assertSessionHasErrors('images.0');

    $this->assertDatabaseMissing('products', [
        'title' => 'Linen Shirt',
    ]);
});

it('rejects sale prices that are not below the regular price', function () {
    $manager = productManagerForTest('products.create');

    $this->actingAs($manager)
        ->from(route('dashboard.product.index'))
        ->post(route('dashboard.product.store'), productPayloadForTest([
            'price' => '20.00',
            'sale_price' => '20.00',
        ]))
        ->assertSessionHasErrors([
            'sale_price' => 'Sale price must be lower than the regular price.',
        ]);

    $this->assertDatabaseMissing('products', [
        'title' => 'Linen Shirt',
    ]);
});

it('protects product listing and creation with their respective permissions', function () {
    $user = productManagerForTest();
    $product = productRecordForTest([
        'title' => 'Protected product',
        'slug' => 'protected-product',
    ]);

    $this->actingAs($user)
        ->get(route('dashboard.product.index'))
        ->assertForbidden();

    $this->get(route('dashboard.product.create'))
        ->assertForbidden();

    $this->get(route('dashboard.product.edit', $product))
        ->assertForbidden();

    $this->actingAs($user)
        ->post(route('dashboard.product.store'), productPayloadForTest())
        ->assertForbidden();

    $this->patch(
        route('dashboard.product.update', $product),
        productPayloadForTest(['title' => 'Unauthorized update']),
    )->assertForbidden();

    $this->delete(route('dashboard.product.destroy', $product))
        ->assertForbidden();

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'title' => 'Protected product',
        'deleted_at' => null,
    ]);
});

it('moves products to trash, restores them by slug, and permanently deletes them', function () {
    $manager = productManagerForTest('products.delete', 'products.view');
    $product = productRecordForTest([
        'title' => 'Archived item',
        'slug' => 'archived-item',
    ]);
    $product->variants()->create([
        'sku' => 'archive-variant-1',
        'name' => 'Default',
        'stock' => 1,
        'attributes' => ['Size' => 'M'],
    ]);

    $this->actingAs($manager)
        ->patch(route('dashboard.product.restore', $product))
        ->assertNotFound();

    $this->delete(route('dashboard.product.forceDelete', $product))
        ->assertNotFound();

    $this->actingAs($manager)
        ->delete(route('dashboard.product.destroy', $product))
        ->assertRedirect();

    $this->assertSoftDeleted('products', [
        'id' => $product->id,
    ]);

    $this->get(route('dashboard.product.index', ['status' => 'deleted']))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->loadDeferredProps(['product-list'], fn (AssertableInertia $page) => $page
                ->where('products.total', 1)
                ->where('products.data.0.slug', 'archived-item')));

    $this->patch(route('dashboard.product.restore', $product))
        ->assertRedirect();

    $this->assertDatabaseHas('products', [
        'id' => $product->id,
        'deleted_at' => null,
    ]);

    $this->delete(route('dashboard.product.destroy', $product))
        ->assertRedirect();

    $this->delete(route('dashboard.product.forceDelete', $product))
        ->assertRedirect();

    $this->assertDatabaseMissing('products', [
        'id' => $product->id,
    ]);
    expect(ProductVariant::query()->where('product_id', $product->id)->exists())->toBeFalse();
});
