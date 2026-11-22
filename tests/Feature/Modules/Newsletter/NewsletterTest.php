<?php

use Modules\Newsletter\Models\NewsletterSubscriber;
use Modules\User\Models\User;
use Spatie\Permission\Models\Permission;

function newsletterUser(string ...$permissions): User
{
    $user = User::factory()->create();
    $user->givePermissionTo(
        collect($permissions)
            ->map(fn (string $permission) => Permission::findOrCreate($permission, 'web')),
    );

    return $user;
}

// ── Public Storefront Subscription ──────────────────────────────────────────

it('allows a visitor to subscribe with a valid email', function () {
    $response = $this->post(route('newsletter.subscribe'), [
        'email' => 'client@skcouture.com',
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('newsletter_subscribers', [
        'email' => 'client@skcouture.com',
        'status' => 'subscribed',
    ]);
});

it('rejects invalid email formats during subscription', function () {
    $response = $this->from('/')->post(route('newsletter.subscribe'), [
        'email' => 'not-an-email',
    ]);

    $response->assertRedirect('/');
    $response->assertSessionHasErrors(['email']);
    $this->assertDatabaseMissing('newsletter_subscribers', [
        'email' => 'not-an-email',
    ]);
});

it('handles duplicate subscription gracefully without creating duplicates', function () {
    NewsletterSubscriber::create([
        'email' => 'vip@skcouture.com',
        'status' => 'subscribed',
        'subscribed_at' => now(),
    ]);

    $response = $this->post(route('newsletter.subscribe'), [
        'email' => 'vip@skcouture.com',
    ]);

    $response->assertRedirect();
    expect(NewsletterSubscriber::where('email', 'vip@skcouture.com')->count())->toBe(1);
});

it('reactivates a previously unsubscribed user upon subscribing again', function () {
    $subscriber = NewsletterSubscriber::create([
        'email' => 'return@skcouture.com',
        'status' => 'unsubscribed',
        'subscribed_at' => now()->subMonths(3),
        'unsubscribed_at' => now()->subMonth(),
    ]);

    $response = $this->post(route('newsletter.subscribe'), [
        'email' => 'return@skcouture.com',
    ]);

    $response->assertRedirect();
    $subscriber->refresh();
    expect($subscriber->status)->toBe('subscribed')
        ->and($subscriber->unsubscribed_at)->toBeNull();
});

// ── Dashboard Permissions & Listing ─────────────────────────────────────────

it('requires authentication to access newsletter subscribers dashboard', function () {
    $this->get(route('dashboard.subscribers.index'))
        ->assertRedirect(route('login'));
});

it('forbids users without newsletter.view permission from accessing the dashboard', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard.subscribers.index'))
        ->assertForbidden();
});

it('allows users with newsletter.view to view the subscribers listing', function () {
    $user = newsletterUser('newsletter.view');

    NewsletterSubscriber::create([
        'email' => 'subscriber1@skcouture.com',
        'status' => 'subscribed',
        'subscribed_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('dashboard.subscribers.index'))
        ->assertOk();
});

// ── Status Toggle & Deletion ────────────────────────────────────────────────

it('allows toggling subscriber status', function () {
    $user = newsletterUser('newsletter.view');
    $subscriber = NewsletterSubscriber::create([
        'email' => 'toggle@skcouture.com',
        'status' => 'subscribed',
        'subscribed_at' => now(),
    ]);

    $this->actingAs($user)
        ->patch(route('dashboard.subscribers.toggle-status', $subscriber))
        ->assertRedirect();

    expect($subscriber->fresh()->status)->toBe('unsubscribed');

    $this->actingAs($user)
        ->patch(route('dashboard.subscribers.toggle-status', $subscriber))
        ->assertRedirect();

    expect($subscriber->fresh()->status)->toBe('subscribed');
});

it('allows deleting a subscriber', function () {
    $user = newsletterUser('newsletter.view', 'newsletter.delete');
    $subscriber = NewsletterSubscriber::create([
        'email' => 'delete-me@skcouture.com',
        'status' => 'subscribed',
        'subscribed_at' => now(),
    ]);

    $this->actingAs($user)
        ->delete(route('dashboard.subscribers.destroy', $subscriber))
        ->assertRedirect();

    expect(NewsletterSubscriber::find($subscriber->id))->toBeNull()
        ->and(NewsletterSubscriber::withTrashed()->find($subscriber->id))->not->toBeNull();
});

it('allows bulk deleting subscribers', function () {
    $user = newsletterUser('newsletter.view', 'newsletter.delete');
    $sub1 = NewsletterSubscriber::create([
        'email' => 'bulk1@skcouture.com',
        'status' => 'subscribed',
        'subscribed_at' => now(),
    ]);
    $sub2 = NewsletterSubscriber::create([
        'email' => 'bulk2@skcouture.com',
        'status' => 'subscribed',
        'subscribed_at' => now(),
    ]);

    $this->actingAs($user)
        ->delete(route('dashboard.subscribers.bulk-destroy'), [
            'ids' => [$sub1->id, $sub2->id],
        ])
        ->assertRedirect();

    expect(NewsletterSubscriber::whereIn('id', [$sub1->id, $sub2->id])->count())->toBe(0);
});

// ── CSV Export ──────────────────────────────────────────────────────────────

it('forbids users without newsletter.export from exporting CSV', function () {
    $user = newsletterUser('newsletter.view');

    $this->actingAs($user)
        ->get(route('dashboard.subscribers.export'))
        ->assertForbidden();
});

it('allows users with newsletter.export to download CSV of subscribers', function () {
    $user = newsletterUser('newsletter.view', 'newsletter.export');

    NewsletterSubscriber::create([
        'email' => 'export1@skcouture.com',
        'status' => 'subscribed',
        'subscribed_at' => now(),
        'ip_address' => '127.0.0.1',
    ]);

    NewsletterSubscriber::create([
        'email' => 'export2@skcouture.com',
        'status' => 'unsubscribed',
        'subscribed_at' => now()->subDays(5),
        'unsubscribed_at' => now(),
        'ip_address' => '127.0.0.1',
    ]);

    $response = $this->actingAs($user)
        ->get(route('dashboard.subscribers.export'));

    $response->assertOk();
    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');

    // Capture streamed response content
    ob_start();
    $response->sendContent();
    $content = ob_get_clean();

    expect($content)->toContain('Email')
        ->and($content)->toContain('export1@skcouture.com')
        ->and($content)->toContain('export2@skcouture.com')
        ->and($content)->toContain('Subscribed')
        ->and($content)->toContain('Unsubscribed');
});
