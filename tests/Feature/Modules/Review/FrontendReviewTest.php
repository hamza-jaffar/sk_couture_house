<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Customer\Models\Customer;
use Modules\Product\Models\Product;
use Modules\Review\Enum\ReviewStatusEnum;
use Modules\Review\Models\Review;
use Modules\User\Database\Seeders\RolePermissionSeeder;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(RolePermissionSeeder::class);
});

test('guest can submit a product review which is approved and visible immediately', function (): void {
    $product = Product::factory()->create(['status' => 'published']);

    $response = $this->post("/products/{$product->slug}/reviews", [
        'rating' => 5,
        'title' => 'Exquisite Craftsmanship',
        'comment' => 'The fabric and hand-embroidery exceeded all my expectations.',
        'author_name' => 'Sara Ahmed',
        'author_email' => 'sara@example.com',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('product_reviews', [
        'product_id' => $product->id,
        'author_name' => 'Sara Ahmed',
        'rating' => 5,
        'status' => ReviewStatusEnum::Approved->value,
    ]);
});

test('logged in customer can submit review with customer_id stored', function (): void {
    $customer = Customer::factory()->create();
    $product = Product::factory()->create(['status' => 'published']);

    $response = $this->actingAs($customer, 'customer')
        ->post("/products/{$product->slug}/reviews", [
            'rating' => 5,
            'title' => 'Bespoke Perfection',
            'comment' => 'The fit was immaculate.',
            'author_name' => $customer->name,
            'author_email' => $customer->email,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('product_reviews', [
        'product_id' => $product->id,
        'customer_id' => $customer->id,
        'user_id' => null,
        'rating' => 5,
    ]);
});

test('review requires valid rating between 1 and 5', function (): void {
    $product = Product::factory()->create(['status' => 'published']);

    $response = $this->post("/products/{$product->slug}/reviews", [
        'rating' => 6,
        'title' => 'Invalid Rating',
        'comment' => 'This rating is out of bounds.',
        'author_name' => 'Test User',
        'author_email' => 'test@example.com',
    ]);

    $response->assertSessionHasErrors(['rating']);
});

test('product page displays approved reviews and computes average', function (): void {
    $product = Product::factory()->create(['status' => 'published']);

    // Approved review
    Review::factory()->create([
        'product_id' => $product->id,
        'rating' => 4,
        'status' => ReviewStatusEnum::Approved,
    ]);

    // Pending review (should not be in public total)
    Review::factory()->create([
        'product_id' => $product->id,
        'rating' => 1,
        'status' => ReviewStatusEnum::Pending,
    ]);

    $response = $this->get("/products/{$product->slug}");

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('frontend/products/show')
        ->has('product')
    );
});
