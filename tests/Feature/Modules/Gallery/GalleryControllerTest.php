<?php

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia;
use Modules\Gallery\Models\Media;
use Modules\User\Models\User;
use Spatie\Permission\Models\Permission;

function galleryUploader(): User
{
    $user = User::factory()->create();
    $user->givePermissionTo(Permission::findOrCreate('gallery.upload', 'web'));
    $user->givePermissionTo(Permission::findOrCreate('gallery.view', 'web'));
    $user->givePermissionTo(Permission::findOrCreate('gallery.delete', 'web'));
    $user->givePermissionTo(Permission::findOrCreate('gallery.restore', 'web'));
    $user->givePermissionTo(Permission::findOrCreate('gallery.force-delete', 'web'));

    return $user;
}

function galleryMedia(User $uploader, string $name, string $type, string $disk = 'public'): Media
{
    $path = "gallery/{$name}";
    Storage::disk($disk)->put($path, 'gallery file');

    return Media::query()->create([
        'uuid' => (string) Str::uuid(),
        'file_name' => $name,
        'original_file_name' => $name,
        'mime_type' => match ($type) {
            'image' => 'image/png',
            'document' => 'application/pdf',
            'video' => 'video/mp4',
            default => 'application/octet-stream',
        },
        'disk' => $disk,
        'path' => $path,
        'size' => 12,
        'type' => $type,
        'uploaded_by' => $uploader->id,
    ]);
}

it('uploads multiple file types to public storage and lists their public URLs', function () {
    Storage::fake('public');
    Storage::fake('local');
    $uploader = galleryUploader();
    $svg = UploadedFile::fake()->createWithContent(
        'sample.svg',
        '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
    );
    $document = UploadedFile::fake()->createWithContent('notes.txt', 'Private gallery note.');

    $this->actingAs($uploader)
        ->post(route('dashboard.gallery.upload'), [
            'files' => [$svg, $document],
        ])
        ->assertRedirect(route('dashboard.gallery.index'));

    $media = Media::query()->orderBy('id')->get();

    expect($media)->toHaveCount(2)
        ->and($media->pluck('disk')->unique()->all())->toBe(['public'])
        ->and($media->pluck('original_file_name')->all())->toBe(['sample.svg', 'notes.txt']);

    foreach ($media as $file) {
        Storage::disk('public')->assertExists($file->path);
        expect($file->uploaded_by)->toBe($uploader->id);
    }

    $this->get(route('dashboard.gallery.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('dashboard/gallery')
            ->where('media.total', 2)
            ->where('media.data.0.original_file_name', 'notes.txt')
            ->where('media.data.1.original_file_name', 'sample.svg')
            ->missing('media.data.0.path')
            ->where('media.data.0.url', fn (string $url) => str_contains($url, '/storage/gallery/'))
            ->where('media.data.1.uploader.name', $uploader->name));

    $this->get(route('dashboard.gallery.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('media.total', 2)
            ->where('media.data.1.uuid', $media[0]->uuid));
});

it('downloads a gallery file as an attachment with content sniffing disabled', function () {
    Storage::fake('public');
    Storage::fake('local');
    $uploader = galleryUploader();
    $this->actingAs($uploader)
        ->post(route('dashboard.gallery.upload'), [
            'files' => [UploadedFile::fake()->createWithContent('unsafe.svg', '<svg></svg>')],
        ])
        ->assertRedirect();
    $media = Media::query()->firstOrFail();

    $response = $this->get(route('dashboard.gallery.download', $media));

    $response->assertOk()
        ->assertDownload('unsafe.svg')
        ->assertHeader('Content-Type', 'application/octet-stream')
        ->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('Cache-Control', 'no-store, private');
});

it('rejects uploads exceeding the maximum file count', function () {
    $uploader = galleryUploader();
    $files = array_map(
        fn (int $index): UploadedFile => UploadedFile::fake()->create("file-{$index}.bin", 1),
        range(1, 11),
    );

    $this->actingAs($uploader)
        ->from(route('dashboard.gallery.index'))
        ->post(route('dashboard.gallery.upload'), ['files' => $files])
        ->assertRedirect(route('dashboard.gallery.index'))
        ->assertSessionHasErrors('files');

    $this->assertDatabaseCount('media', 0);
});

it('rejects uploads larger than 50 MB', function () {
    $uploader = galleryUploader();

    $this->actingAs($uploader)
        ->from(route('dashboard.gallery.index'))
        ->post(route('dashboard.gallery.upload'), [
            'files' => [UploadedFile::fake()->create('oversized.bin', 51201)],
        ])
        ->assertRedirect(route('dashboard.gallery.index'))
        ->assertSessionHasErrors('files.0');

    $this->assertDatabaseCount('media', 0);
});

it('forbids authenticated users without gallery access from uploading or viewing files', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard.gallery.index'))
        ->assertForbidden();

    $this->actingAs($user)
        ->post(route('dashboard.gallery.upload'), [
            'files' => [UploadedFile::fake()->create('file.txt', 1)],
        ])
        ->assertForbidden();

    $this->assertDatabaseCount('media', 0);
});

it('redirects guests to login before showing the gallery', function () {
    $this->get(route('dashboard.gallery.index'))
        ->assertRedirect(route('login'));
});

it('filters gallery files by category and keeps deleted files in the trash tab', function () {
    Storage::fake('public');
    Storage::fake('local');
    $uploader = galleryUploader();
    $image = galleryMedia($uploader, 'image.png', 'image');
    galleryMedia($uploader, 'document.pdf', 'document');
    $deleted = galleryMedia($uploader, 'deleted.mp4', 'video');
    $this->actingAs($uploader)
        ->delete(route('dashboard.gallery.destroy'), [
            'uuids' => [$deleted->uuid],
        ])
        ->assertRedirect();

    Storage::disk('public')->assertMissing($deleted->path);
    Storage::disk('local')->assertExists($deleted->path);

    $this->get(route('dashboard.gallery.index', ['category' => 'deleted']))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('media.total', 1)
            ->where('media.data.0.uuid', $deleted->uuid)
            ->where('media.data.0.url', null));

    $this
        ->get(route('dashboard.gallery.index', ['category' => 'image']))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('filters.category', 'image')
            ->where('media.total', 1)
            ->where('media.data.0.uuid', $image->uuid));

    $this->get(route('dashboard.gallery.index', ['category' => 'deleted']))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('media.total', 1)
            ->where('media.data.0.uuid', $deleted->uuid)
            ->where('media.data.0.deleted_at', fn ($value) => is_string($value)));
});

it('allows a user to move a file to trash and restore it', function () {
    Storage::fake('public');
    Storage::fake('local');
    $uploader = galleryUploader();
    $media = galleryMedia($uploader, 'recoverable.txt', 'other');

    $this->actingAs($uploader)
        ->get(route('dashboard.gallery.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page->where('media.total', 1));

    $this->actingAs($uploader)
        ->delete(route('dashboard.gallery.destroy'), [
            'uuids' => [$media->uuid],
        ])
        ->assertRedirect();

    $this->assertSoftDeleted($media);
    Storage::disk('public')->assertMissing($media->path);
    Storage::disk('local')->assertExists($media->path);
    $this->get(route('dashboard.gallery.download', $media))->assertNotFound();
    $this->get(route('dashboard.gallery.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page->where('media.total', 0));

    $this->post(route('dashboard.gallery.restore'), [
        'uuids' => [$media->uuid],
    ])->assertRedirect();

    $this->assertModelExists(Media::query()->findOrFail($media->id));
    Storage::disk('public')->assertExists($media->path);
    Storage::disk('local')->assertMissing($media->path);
    $this->get(route('dashboard.gallery.index'))
        ->assertInertia(fn (AssertableInertia $page) => $page->where('media.total', 1));
});

it('bulk deletes selected trashed files from the database and private storage', function () {
    Storage::fake('public');
    Storage::fake('local');
    $uploader = galleryUploader();
    $first = galleryMedia($uploader, 'first.txt', 'other');
    $second = galleryMedia($uploader, 'second.txt', 'other');

    $this->actingAs($uploader)
        ->delete(route('dashboard.gallery.destroy'), [
            'uuids' => [$first->uuid, $second->uuid],
        ])
        ->assertRedirect();

    $this->assertSoftDeleted($first);
    $this->assertSoftDeleted($second);

    $this
        ->delete(route('dashboard.gallery.force-delete'), [
            'uuids' => [$first->uuid, $second->uuid],
        ])
        ->assertRedirect();

    $this->assertDatabaseMissing('media', ['uuid' => $first->uuid]);
    $this->assertDatabaseMissing('media', ['uuid' => $second->uuid]);
    Storage::disk('local')->assertMissing($first->path);
    Storage::disk('local')->assertMissing($second->path);
});

it('migrates active legacy files to public storage and quarantines existing trashed files', function () {
    Storage::fake('public');
    Storage::fake('local');
    $uploader = galleryUploader();
    $active = galleryMedia($uploader, 'legacy-active.png', 'image', 'local');
    $deleted = galleryMedia($uploader, 'legacy-deleted.png', 'image', 'public');
    $deleted->delete();

    $this->artisan('gallery:migrate-storage')
        ->expectsOutput('Migrated 2 gallery files.')
        ->assertSuccessful();

    expect($active->fresh()->disk)->toBe('public')
        ->and(Media::withTrashed()->findOrFail($deleted->id)->disk)->toBe('local');

    Storage::disk('public')->assertExists($active->path);
    Storage::disk('local')->assertMissing($active->path);
    Storage::disk('local')->assertExists($deleted->path);
    Storage::disk('public')->assertMissing($deleted->path);
});

it('returns active media as JSON for the reusable gallery picker', function () {
    Storage::fake('public');
    Storage::fake('local');
    $uploader = galleryUploader();
    $image = galleryMedia($uploader, 'picker.png', 'image');
    $deleted = galleryMedia($uploader, 'removed.png', 'image');
    $this->actingAs($uploader)
        ->delete(route('dashboard.gallery.destroy'), [
            'uuids' => [$deleted->uuid],
        ])
        ->assertRedirect();

    $this->actingAs($uploader)
        ->get(route('dashboard.gallery.picker', ['category' => 'image']))
        ->assertOk()
        ->assertJsonPath('total', 1)
        ->assertJsonPath('data.0.uuid', $image->uuid);
});

it('forbids gallery viewers without management permissions from deleting files', function () {
    Storage::fake('public');
    Storage::fake('local');
    $viewer = User::factory()->create();
    $viewer->givePermissionTo(Permission::findOrCreate('gallery.view', 'web'));
    $media = galleryMedia($viewer, 'protected.txt', 'other');

    $this->actingAs($viewer)
        ->delete(route('dashboard.gallery.destroy'), [
            'uuids' => [$media->uuid],
        ])
        ->assertForbidden();

    $media->delete();

    $this->post(route('dashboard.gallery.restore'), [
        'uuids' => [$media->uuid],
    ])->assertForbidden();

    $this->delete(route('dashboard.gallery.force-delete'), [
        'uuids' => [$media->uuid],
    ])->assertForbidden();

    $this->assertModelExists($media);
});
