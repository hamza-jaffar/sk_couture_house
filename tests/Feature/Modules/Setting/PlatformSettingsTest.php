<?php

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia;
use Modules\Gallery\Models\Media;
use Modules\Setting\Models\SiteSetting;
use Modules\User\Models\User;
use Spatie\Permission\Models\Permission;

function platformSettingsActor(string ...$permissions): User
{
    $user = User::factory()->create();

    foreach ($permissions as $permission) {
        $user->givePermissionTo(Permission::findOrCreate($permission, 'web'));
    }

    return $user;
}

function platformSettingsGalleryImage(string $filename): Media
{
    return Media::query()->create([
        'uuid' => (string) Str::uuid(),
        'file_name' => $filename,
        'original_file_name' => $filename,
        'mime_type' => 'image/png',
        'disk' => 'public',
        'path' => "gallery/{$filename}",
        'size' => 12,
        'type' => 'image',
    ]);
}

it('shows platform settings to users with view permission', function () {
    $actor = platformSettingsActor('settings.view');

    $this->actingAs($actor)
        ->get(route('settings.platform.index', ['selected_tag' => 'contact']))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('settings/settings')
            ->where('selectedTab', 'contact')
            ->has('settings.general')
            ->has('settings.contact')
            ->has('settings.social')
            ->has('settings.mail')
            ->has('settings.variants'));
});

it('falls back to the general settings tab for an invalid tab query', function () {
    $actor = platformSettingsActor('settings.view');

    $this->actingAs($actor)
        ->get(route('settings.platform.index', ['selected_tag' => 'unknown']))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('selectedTab', 'general'));
});

it('reuses cached settings between requests and refreshes the cache after a save', function () {
    config(['cache.default' => 'array']);
    Cache::forget('platform-settings');
    $actor = platformSettingsActor('settings.view', 'settings.update');
    $settingsReads = 0;

    DB::listen(function ($query) use (&$settingsReads): void {
        $sql = strtolower($query->sql);

        if (
            str_starts_with(ltrim($sql), 'select')
            && str_contains($sql, 'site_settings')
            && ! str_contains($sql, ' where ')
        ) {
            $settingsReads++;
        }
    });

    $this->actingAs($actor)->get(route('settings.platform.index'))->assertOk();
    $this->actingAs($actor)->get(route('settings.platform.index'))->assertOk();

    expect($settingsReads)->toBe(1);

    $this->actingAs($actor)
        ->patch(route('settings.platform.update', 'contact'), [
            'email' => 'fresh@example.test',
        ])
        ->assertRedirect();

    $this->actingAs($actor)
        ->get(route('settings.platform.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('settings.contact.email', 'fresh@example.test'));
    $this->actingAs($actor)->get(route('settings.platform.index'))->assertOk();

    expect($settingsReads)->toBe(2);
});

it('forbids users without platform settings permission', function () {
    $actor = User::factory()->create();

    $this->actingAs($actor)
        ->get(route('settings.platform.index'))
        ->assertForbidden();
});

it('requires update permission to change platform settings', function () {
    $actor = platformSettingsActor('settings.view');

    $this->actingAs($actor)
        ->patch(route('settings.platform.update', 'contact'), [
            'email' => 'hello@example.test',
        ])
        ->assertForbidden();
});

it('saves general settings using gallery image paths', function () {
    Storage::fake('public');
    $actor = platformSettingsActor('settings.view', 'settings.update');
    $logo = platformSettingsGalleryImage('store-logo.png');
    $favicon = platformSettingsGalleryImage('store-favicon.png');
    Storage::disk('public')->put($logo->path, 'logo image');
    Storage::disk('public')->put($favicon->path, 'favicon image');

    $this->actingAs($actor)
        ->from(route('settings.platform.index'))
        ->patch(route('settings.platform.update', 'general'), [
            'name' => 'Atelier Store',
            'tagline' => 'Made for you',
            'description' => 'Thoughtful clothing and accessories.',
            'website_url' => 'https://example.test',
            'timezone' => 'UTC',
            'currency' => 'USD',
            'currency_icon' => '$',
            'logo_path' => $logo->path,
            'favicon_path' => $favicon->path,
        ])
        ->assertRedirect(route('settings.platform.index'));

    $payload = SiteSetting::query()->where('group', 'general')->firstOrFail()->payload;

    expect($payload)->toMatchArray([
        'name' => 'Atelier Store',
        'currency' => 'USD',
        'currency_icon' => '$',
        'logo_path' => $logo->path,
        'favicon_path' => $favicon->path,
    ]);

    Storage::disk('public')->assertExists($logo->path);
    Storage::disk('public')->assertExists($favicon->path);
});

it('clears selected gallery paths without deleting shared media', function () {
    Storage::fake('public');
    $actor = platformSettingsActor('settings.view', 'settings.update');
    $logo = platformSettingsGalleryImage('shared-logo.png');
    $favicon = platformSettingsGalleryImage('shared-favicon.png');
    Storage::disk('public')->put($logo->path, 'logo image');
    Storage::disk('public')->put($favicon->path, 'favicon image');

    $this->actingAs($actor)
        ->patch(route('settings.platform.update', 'general'), [
            'name' => 'Atelier Store',
            'tagline' => '',
            'description' => '',
            'website_url' => '',
            'timezone' => 'UTC',
            'currency' => 'USD',
            'currency_icon' => '$',
            'logo_path' => $logo->path,
            'favicon_path' => $favicon->path,
        ]);

    $this->actingAs($actor)
        ->from(route('settings.platform.index'))
        ->patch(route('settings.platform.update', 'general'), [
            'name' => 'Atelier Store',
            'tagline' => '',
            'description' => '',
            'website_url' => '',
            'timezone' => 'UTC',
            'currency' => 'USD',
            'currency_icon' => '$',
            'logo_path' => '',
            'favicon_path' => '',
        ])
        ->assertRedirect(route('settings.platform.index'));

    $payload = SiteSetting::query()->where('group', 'general')->firstOrFail()->payload;

    expect($payload['logo_path'])->toBeNull()
        ->and($payload['favicon_path'])->toBeNull();
    $this->assertDatabaseHas('media', ['id' => $logo->id]);
    $this->assertDatabaseHas('media', ['id' => $favicon->id]);
    Storage::disk('public')->assertExists($logo->path);
    Storage::disk('public')->assertExists($favicon->path);
});

it('rejects gallery paths that do not point to an active image', function () {
    $actor = platformSettingsActor('settings.view', 'settings.update');

    $this->actingAs($actor)
        ->from(route('settings.platform.index'))
        ->patch(route('settings.platform.update', 'general'), [
            'name' => 'Atelier Store',
            'timezone' => 'UTC',
            'currency' => 'USD',
            'currency_icon' => '$',
            'logo_path' => '../../outside.png',
        ])
        ->assertRedirect(route('settings.platform.index'))
        ->assertSessionHasErrors('logo_path');

    $this->assertDatabaseMissing('site_settings', ['group' => 'general']);
});

it('saves contact and social details', function () {
    $actor = platformSettingsActor('settings.view', 'settings.update');

    $this->actingAs($actor)
        ->from(route('settings.platform.index'))
        ->patch(route('settings.platform.update', 'contact'), [
            'email' => 'hello@example.test',
            'phone' => '+1 555 0100',
            'alternate_phone' => '',
            'address' => '1 Market Street',
            'address_line_2' => '',
            'city' => 'My Custom City',
            'region' => 'My Custom Region',
            'postal_code' => '94105',
            'country' => 'My Custom Country',
            'business_hours' => 'Mon–Fri, 9 AM–5 PM',
        ])
        ->assertRedirect(route('settings.platform.index'));

    $this->actingAs($actor)
        ->from(route('settings.platform.index'))
        ->patch(route('settings.platform.update', 'social'), [
            'facebook' => 'https://facebook.com/example',
            'instagram' => 'https://instagram.com/example',
            'tiktok' => '',
            'youtube' => '',
            'pinterest' => '',
            'linkedin' => '',
            'x' => '',
        ])
        ->assertRedirect(route('settings.platform.index'));

    expect(SiteSetting::query()->where('group', 'contact')->firstOrFail()->payload)
        ->toMatchArray([
            'email' => 'hello@example.test',
            'city' => 'My Custom City',
            'region' => 'My Custom Region',
            'country' => 'My Custom Country',
        ])
        ->and(SiteSetting::query()->where('group', 'social')->firstOrFail()->payload)
        ->toMatchArray([
            'facebook' => 'https://facebook.com/example',
            'instagram' => 'https://instagram.com/example',
        ]);
});

it('encrypts the smtp password and applies the saved mail configuration', function () {
    $actor = platformSettingsActor('settings.view', 'settings.update');

    $this->actingAs($actor)
        ->from(route('settings.platform.index'))
        ->patch(route('settings.platform.update', 'mail'), [
            'host' => 'smtp.example.test',
            'port' => 465,
            'encryption' => 'ssl',
            'username' => 'mailer@example.test',
            'password' => 'do-not-expose-this',
            'from_address' => 'store@example.test',
            'from_name' => 'Atelier Store',
        ])
        ->assertRedirect(route('settings.platform.index'));

    $storedPassword = SiteSetting::query()->where('group', 'mail')->firstOrFail()->payload['password'];

    expect($storedPassword)->not->toBe('do-not-expose-this')
        ->and(Crypt::decryptString($storedPassword))->toBe('do-not-expose-this')
        ->and(Config::get('mail.default'))->toBe('smtp')
        ->and(Config::get('mail.mailers.smtp.host'))->toBe('smtp.example.test')
        ->and(Config::get('mail.mailers.smtp.scheme'))->toBe('smtps')
        ->and(Config::get('mail.mailers.smtp.auto_tls'))->toBeTrue()
        ->and(Config::get('mail.mailers.smtp.password'))->toBe('do-not-expose-this');

    $this->actingAs($actor)
        ->get(route('settings.platform.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('settings.mail.has_password', true)
            ->missing('settings.mail.password'));
});

it('preserves the stored smtp password when the password field is left blank', function () {
    $actor = platformSettingsActor('settings.view', 'settings.update');
    $this->actingAs($actor)
        ->from(route('settings.platform.index'))
        ->patch(route('settings.platform.update', 'mail'), [
            'host' => 'smtp.example.test',
            'port' => 587,
            'encryption' => 'tls',
            'username' => 'mailer@example.test',
            'password' => 'keep-this-password',
            'from_address' => 'store@example.test',
            'from_name' => 'Atelier Store',
        ]);

    $this->actingAs($actor)
        ->from(route('settings.platform.index'))
        ->patch(route('settings.platform.update', 'mail'), [
            'host' => 'smtp-updated.example.test',
            'port' => 587,
            'encryption' => 'tls',
            'username' => 'mailer@example.test',
            'password' => '',
            'from_address' => 'store@example.test',
            'from_name' => 'Atelier Store',
        ])
        ->assertRedirect(route('settings.platform.index'));

    $payload = SiteSetting::query()->where('group', 'mail')->firstOrFail()->payload;

    expect(Crypt::decryptString($payload['password']))->toBe('keep-this-password')
        ->and($payload['host'])->toBe('smtp-updated.example.test');
});

it('clears the smtp password and disables automatic tls when requested', function () {
    $actor = platformSettingsActor('settings.view', 'settings.update');

    $this->actingAs($actor)
        ->patch(route('settings.platform.update', 'mail'), [
            'host' => 'smtp.example.test',
            'port' => 25,
            'encryption' => 'none',
            'username' => '',
            'password' => 'temporary-password',
            'from_address' => 'store@example.test',
            'from_name' => 'Atelier Store',
        ]);

    $this->actingAs($actor)
        ->from(route('settings.platform.index'))
        ->patch(route('settings.platform.update', 'mail'), [
            'host' => 'smtp.example.test',
            'port' => 25,
            'encryption' => 'none',
            'username' => '',
            'password' => '',
            'clear_password' => '1',
            'from_address' => 'store@example.test',
            'from_name' => 'Atelier Store',
        ])
        ->assertRedirect(route('settings.platform.index'));

    expect(SiteSetting::query()->where('group', 'mail')->firstOrFail()->payload['password'])
        ->toBeNull()
        ->and(Config::get('mail.mailers.smtp.auto_tls'))->toBeFalse()
        ->and(Config::get('mail.mailers.smtp.password'))->toBeNull();
});

it('parses comma separated variant values and allows removing all variants', function () {
    $actor = platformSettingsActor('settings.view', 'settings.update');

    $this->actingAs($actor)
        ->from(route('settings.platform.index'))
        ->patch(route('settings.platform.update', 'variants'), [
            'variants' => json_encode([
                [
                    'name' => 'Size',
                    'values' => ['XS, S', 'M, L'],
                ],
                [
                    'name' => 'Color',
                    'values' => ['#111111', '#ffffff'],
                ],
            ], JSON_THROW_ON_ERROR),
        ])
        ->assertRedirect(route('settings.platform.index'));

    $variants = SiteSetting::query()->where('group', 'variants')->firstOrFail()->payload;

    expect($variants[0]['name'])->toBe('Size')
        ->and($variants[0]['values'])->toBe(['XS', 'S', 'M', 'L'])
        ->and($variants[1]['values'])->toBe(['#111111', '#ffffff']);

    $this->actingAs($actor)
        ->from(route('settings.platform.index'))
        ->patch(route('settings.platform.update', 'variants'), [
            'variants' => '[]',
        ])
        ->assertRedirect(route('settings.platform.index'));

    expect(SiteSetting::query()->where('group', 'variants')->firstOrFail()->payload)
        ->toBe([]);
});

it('preserves the selected order of variant values', function () {
    $actor = platformSettingsActor('settings.view', 'settings.update');

    $this->actingAs($actor)
        ->from(route('settings.platform.index'))
        ->patch(route('settings.platform.update', 'variants'), [
            'variants' => json_encode([
                [
                    'name' => 'Size',
                    'values' => ['M', 'XS', 'S', 'L'],
                ],
            ], JSON_THROW_ON_ERROR),
        ])
        ->assertRedirect(route('settings.platform.index'));

    $variants = SiteSetting::query()->where('group', 'variants')->firstOrFail()->payload;

    expect($variants[0]['values'])->toBe(['M', 'XS', 'S', 'L']);
});

it('rejects duplicate or invalid variant values', function () {
    $actor = platformSettingsActor('settings.view', 'settings.update');

    $this->actingAs($actor)
        ->from(route('settings.platform.index'))
        ->patch(route('settings.platform.update', 'variants'), [
            'variants' => json_encode([
                [
                    'name' => 'Size',
                    'values' => ['Small', 'small'],
                ],
            ], JSON_THROW_ON_ERROR),
        ])
        ->assertRedirect(route('settings.platform.index'))
        ->assertSessionHasErrors('variants.0.values.1');
});
