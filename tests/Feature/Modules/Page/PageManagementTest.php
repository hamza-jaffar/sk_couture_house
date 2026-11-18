<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Modules\Page\Database\Seeders\PageSeeder;
use Modules\Page\Models\Page;
use Modules\User\Database\Seeders\RolePermissionSeeder;
use Modules\User\Models\User;

uses(RefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(RolePermissionSeeder::class);
    $this->seed(PageSeeder::class);

    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');
});

test('admin can access pages index in dashboard', function (): void {
    $response = $this->actingAs($this->admin, 'web')
        ->get('/dashboard/pages');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard/pages/index')
        ->has('filters')
    );
});

test('admin can create a custom page with seo details', function (): void {
    $response = $this->actingAs($this->admin, 'web')
        ->post('/dashboard/pages', [
            'title' => 'Special Summer Lookbook',
            'slug' => 'summer-lookbook',
            'content' => '<p>Lookbook details</p>',
            'is_active' => true,
            'meta_title' => 'Summer Lookbook 2026',
            'meta_description' => 'Browse our latest collection',
            'meta_keywords' => 'summer, lookbook, couture',
        ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('pages', [
        'slug' => 'summer-lookbook',
        'is_system' => false,
        'meta_title' => 'Summer Lookbook 2026',
    ]);
});

test('system page slug cannot be modified on update', function (): void {
    $privacyPage = Page::query()->where('slug', 'privacy-policy')->firstOrFail();

    $response = $this->actingAs($this->admin, 'web')
        ->patch("/dashboard/pages/{$privacyPage->id}", [
            'title' => 'Privacy Policy Updated',
            'slug' => 'attempted-slug-change',
            'content' => '<h2>Updated Privacy Content</h2>',
            'is_active' => true,
        ]);

    $response->assertRedirect();
    $privacyPage->refresh();

    expect($privacyPage->slug)->toBe('privacy-policy');
    expect($privacyPage->content)->toContain('Updated Privacy Content');
});

test('system pages cannot be deleted', function (): void {
    $privacyPage = Page::query()->where('slug', 'privacy-policy')->firstOrFail();

    $response = $this->actingAs($this->admin, 'web')
        ->delete("/dashboard/pages/{$privacyPage->id}");

    $response->assertForbidden();
    expect($privacyPage->fresh()->trashed())->toBeFalse();
});

test('custom pages can be deleted', function (): void {
    $customPage = Page::factory()->create([
        'title' => 'Custom Promo',
        'is_system' => false,
    ]);

    $response = $this->actingAs($this->admin, 'web')
        ->delete("/dashboard/pages/{$customPage->id}");

    $response->assertRedirect();
    expect($customPage->fresh()->trashed())->toBeTrue();
});

test('public user can view active page at /page/{slug}', function (): void {
    $response = $this->get('/page/privacy-policy');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('frontend/page/show')
        ->where('page.slug', 'privacy-policy')
        ->has('page.content')
        ->has('page.meta_title')
    );
});
