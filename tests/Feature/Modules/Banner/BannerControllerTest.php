<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Banner\Models\Banner;
use Modules\User\Database\Seeders\RolePermissionSeeder;
use Modules\User\Models\User;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(RolePermissionSeeder::class);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');
});

test('admin can access banners index in dashboard', function (): void {
    Banner::factory()->count(3)->create();

    $response = $this->actingAs($this->admin, 'web')
        ->get('/dashboard/banners');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard/banners')
        ->has('filters')
    );
});

test('admin can create a slider banner', function (): void {
    $response = $this->actingAs($this->admin, 'web')
        ->post('/dashboard/banners', [
            'title' => 'Haute Couture Spring 2026',
            'subtitle' => 'Handcrafted Excellence',
            'description' => 'A curated selection of artisanal gowns.',
            'media_type' => 'image',
            'media_path' => 'gallery/banners/spring.jpg',
            'button_text' => 'Shop Now',
            'button_url' => '/collections/spring',
            'secondary_button_text' => 'Lookbook',
            'secondary_button_url' => '/page/lookbook',
            'text_position' => 'left',
            'text_color' => 'light',
            'sort_order' => 1,
            'is_active' => true,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('banners', [
        'title' => 'Haute Couture Spring 2026',
        'media_type' => 'image',
        'button_text' => 'Shop Now',
    ]);
});

test('admin can update a banner', function (): void {
    $banner = Banner::factory()->create([
        'title' => 'Old Title',
        'media_path' => 'gallery/banners/old.jpg',
    ]);

    $response = $this->actingAs($this->admin, 'web')
        ->patch("/dashboard/banners/{$banner->id}", [
            'title' => 'Updated Banner Title',
            'subtitle' => 'Updated Subtitle',
            'description' => 'Updated description.',
            'media_type' => 'video',
            'media_path' => 'gallery/banners/video.mp4',
            'button_text' => 'Discover',
            'button_url' => '/collections',
            'text_position' => 'center',
            'text_color' => 'dark',
            'sort_order' => 2,
            'is_active' => true,
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('banners', [
        'id' => $banner->id,
        'title' => 'Updated Banner Title',
        'media_type' => 'video',
    ]);
});

test('admin can toggle active status of a banner', function (): void {
    $banner = Banner::factory()->create(['is_active' => true]);

    $response = $this->actingAs($this->admin, 'web')
        ->patch("/dashboard/banners/{$banner->id}/toggle-status");

    $response->assertRedirect();
    expect($banner->fresh()->is_active)->toBeFalse();
});

test('admin can delete and restore a banner', function (): void {
    $banner = Banner::factory()->create();

    $deleteResponse = $this->actingAs($this->admin, 'web')
        ->delete("/dashboard/banners/{$banner->id}");

    $deleteResponse->assertRedirect();
    expect($banner->fresh()->trashed())->toBeTrue();

    $restoreResponse = $this->actingAs($this->admin, 'web')
        ->post("/dashboard/banners/{$banner->id}/restore");

    $restoreResponse->assertRedirect();
    expect($banner->fresh()->trashed())->toBeFalse();
});
