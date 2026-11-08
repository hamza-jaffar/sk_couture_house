<?php

namespace Modules\Gallery\Service;

use App\Helpers\FileHelper;
use Illuminate\Database\Connection;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Modules\Gallery\Models\Media;
use Modules\User\Models\User;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class GalleryService
{
    private const string STORAGE_DISK = 'public';

    private const string TRASH_DISK = 'local';

    private const string CACHE_VERSION_KEY = 'gallery:media:v2:version';

    /**
     * @param  array{search?: string|null, category?: string|null, per_page?: int|string, page?: int|string}  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function paginate(array $filters): LengthAwarePaginator
    {
        $version = Cache::get(self::CACHE_VERSION_KEY, 1);
        $key = 'gallery:media:v2:'.$version.':'.hash(
            'sha256',
            json_encode($filters, JSON_THROW_ON_ERROR),
        );

        $payload = Cache::get($key);

        if (! $this->isCachedListing($payload)) {
            Cache::forget($key);
            $payload = $this->buildListingPayload($filters);
            Cache::put($key, $payload, now()->addMinutes(5));
        }

        return new LengthAwarePaginator(
            $payload['data'],
            $payload['total'],
            $payload['per_page'],
            $payload['current_page'],
            [
                'path' => $payload['path'],
                'query' => request()->query(),
                'pageName' => 'page',
            ],
        );
    }

    /**
     * @param  list<UploadedFile>  $files
     */
    /**
     * @param  list<UploadedFile>  $files
     * @return list<Media>
     */
    public function upload(array $files, User $uploader): array
    {
        $paths = FileHelper::uploadMany($files, 'gallery', self::STORAGE_DISK);
        $uploadedMedia = [];

        try {
            DB::transaction(function () use ($files, $paths, $uploader, &$uploadedMedia): void {
                foreach ($files as $index => $file) {
                    $path = $paths[$index];
                    $originalFileName = $this->safeOriginalFileName($file);
                    $mimeType = $file->getMimeType() ?? 'application/octet-stream';
                    $size = $file->getSize();

                    if (! is_int($size)) {
                        throw new RuntimeException('Unable to determine the uploaded file size.');
                    }

                    $uploadedMedia[] = Media::query()->create([
                        'uuid' => (string) Str::uuid(),
                        'title' => $originalFileName,
                        'file_name' => basename($path),
                        'original_file_name' => $originalFileName,
                        'mime_type' => $mimeType,
                        'disk' => self::STORAGE_DISK,
                        'path' => $path,
                        'size' => $size,
                        'type' => $this->fileType($mimeType),
                        'metadata' => [
                            'extension' => strtolower($file->getClientOriginalExtension()),
                        ],
                        'uploaded_by' => $uploader->getKey(),
                    ]);
                }
            });
        } catch (Throwable $exception) {
            FileHelper::deleteMany(array_values($paths), self::STORAGE_DISK);

            throw $exception;
        }

        if (DB::transactionLevel() > 0) {
            DB::afterCommit(function () {
                $this->invalidateListingCache();
            });
        } else {
            $this->invalidateListingCache();
        }

        return $uploadedMedia;
    }

    public function download(Media $media): StreamedResponse
    {
        abort_unless($media->disk === self::STORAGE_DISK, 404);
        abort_unless(Storage::disk($media->disk)->exists($media->path), 404);

        return Storage::disk($media->disk)->download(
            $media->path,
            $this->safeDownloadName($media->original_file_name),
            [
                'Content-Type' => 'application/octet-stream',
                'X-Content-Type-Options' => 'nosniff',
                'Content-Security-Policy' => "sandbox; default-src 'none'",
                'Cache-Control' => 'private, no-store',
            ],
        );
    }

    /**
     * @param  list<string>  $uuids
     */
    public function moveToTrash(array $uuids): int
    {
        $movedFiles = [];

        try {
            $count = DB::transaction(function () use ($uuids, &$movedFiles): int {
                $media = Media::query()->whereIn('uuid', $uuids)->lockForUpdate()->get();
                $this->ensureSelectedCount($media->count(), $uuids);

                foreach ($media as $item) {
                    if ($item->disk === self::STORAGE_DISK) {
                        $this->moveFile($item->disk, self::TRASH_DISK, $item->path);
                        $movedFiles[] = [$item->path, self::TRASH_DISK, self::STORAGE_DISK];
                        $item->disk = self::TRASH_DISK;
                        $item->save();
                    }

                    $item->delete();
                }

                return $media->count();
            });
        } catch (Throwable $exception) {
            $this->reverseMoves($movedFiles);

            throw $exception;
        }

        $this->invalidateListingCache();

        return $count;
    }

    /**
     * @param  list<string>  $uuids
     */
    public function restore(array $uuids): int
    {
        $movedFiles = [];

        try {
            $count = DB::transaction(function () use ($uuids, &$movedFiles): int {
                $media = Media::onlyTrashed()->whereIn('uuid', $uuids)->lockForUpdate()->get();
                $this->ensureSelectedCount($media->count(), $uuids);

                foreach ($media as $item) {
                    if ($item->disk !== self::STORAGE_DISK) {
                        $this->moveFile($item->disk, self::STORAGE_DISK, $item->path);
                        $movedFiles[] = [$item->path, self::STORAGE_DISK, $item->disk];
                        $item->disk = self::STORAGE_DISK;
                        $item->save();
                    }

                    $item->restore();
                }

                return $media->count();
            });
        } catch (Throwable $exception) {
            $this->reverseMoves($movedFiles);

            throw $exception;
        }

        $this->invalidateListingCache();

        return $count;
    }

    /**
     * @param  list<string>  $uuids
     */
    public function permanentlyDelete(array $uuids): int
    {
        $count = DB::transaction(function (Connection $_) use ($uuids): int {
            $media = Media::onlyTrashed()->whereIn('uuid', $uuids)->lockForUpdate()->get();
            $this->ensureSelectedCount($media->count(), $uuids);

            foreach ($media as $item) {
                $disk = Storage::disk($item->disk);

                if ($disk->exists($item->path) && ! $disk->delete($item->path)) {
                    throw new RuntimeException("Unable to permanently remove gallery file [{$item->uuid}].");
                }

                $item->forceDelete();
            }

            return $media->count();
        });

        if ($count > 0) {
            $this->invalidateListingCache();
        }

        return $count;
    }

    public function migrateStorage(): int
    {
        $migratedCount = 0;

        Media::withTrashed()->orderBy('id')->chunkById(100, function ($media) use (&$migratedCount): void {
            foreach ($media as $item) {
                $targetDisk = $item->trashed() ? self::TRASH_DISK : self::STORAGE_DISK;

                if ($item->disk === $targetDisk) {
                    continue;
                }

                $sourceDisk = $item->disk;
                $this->moveFile($sourceDisk, $targetDisk, $item->path);

                try {
                    $item->disk = $targetDisk;
                    $item->save();
                } catch (Throwable $exception) {
                    $this->moveFile($targetDisk, $sourceDisk, $item->path);

                    throw $exception;
                }

                $migratedCount++;
            }
        });

        if ($migratedCount > 0) {
            $this->invalidateListingCache();
        }

        return $migratedCount;
    }

    /**
     * @param  array{search?: string|null, category?: string|null, per_page?: int|string, page?: int|string}  $filters
     * @return array{
     *     data: list<array<string, mixed>>,
     *     total: int,
     *     per_page: int,
     *     current_page: int,
     *     path: string
     * }
     */
    private function buildListingPayload(array $filters): array
    {
        $paginator = $this->mediaQuery($filters)
            ->paginate(
                (int) ($filters['per_page'] ?? 24),
                ['*'],
                'page',
                (int) ($filters['page'] ?? 1),
            )
            ->withQueryString();

        return [
            'data' => array_values($paginator->getCollection()
                ->map(fn (Media $media): array => $this->serializeMedia($media))
                ->all()),
            'total' => $paginator->total(),
            'per_page' => $paginator->perPage(),
            'current_page' => $paginator->currentPage(),
            'path' => $paginator->path() ?? request()->url(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function serializeMedia(Media $media): array
    {
        $media->loadMissing('uploader:id,name');
        $attributes = $media->toArray();
        $attributes['url'] = ! $media->trashed() && $media->disk === self::STORAGE_DISK
            ? Storage::disk(self::STORAGE_DISK)->url($media->path)
            : null;
        unset($attributes['disk'], $attributes['path']);

        return $attributes;
    }

    /**
     * @param  array{search?: string|null, category?: string|null}  $filters
     * @return Builder<Media>
     */
    private function mediaQuery(array $filters): Builder
    {
        $query = Media::query()
            ->select([
                'id',
                'uuid',
                'title',
                'original_file_name',
                'mime_type',
                'size',
                'type',
                'metadata',
                'uploaded_by',
                'created_at',
                'deleted_at',
                'disk',
                'path',
            ])
            ->with('uploader:id,name')
            ->latest('id');

        if (($filters['category'] ?? 'all') === 'deleted') {
            $query->onlyTrashed();
        } else {
            match ($filters['category'] ?? 'all') {
                'image', 'document', 'video' => $query->where('type', $filters['category']),
                'other' => $query->whereNotIn('type', ['image', 'document', 'video']),
                default => null,
            };
        }

        if (filled($filters['search'] ?? null)) {
            $search = trim($filters['search']);
            $query->where(function (Builder $media) use ($search): void {
                $media->where('title', 'like', "%{$search}%")
                    ->orWhere('original_file_name', 'like', "%{$search}%")
                    ->orWhere('mime_type', 'like', "%{$search}%");
            });
        }

        return $query;
    }

    /**
     * @phpstan-assert-if-true array{
     *     data: list<array<string, mixed>>,
     *     total: int,
     *     per_page: int,
     *     current_page: int,
     *     path: string
     * } $payload
     */
    private function isCachedListing(mixed $payload): bool
    {
        if (
            ! is_array($payload)
            || ! is_array($payload['data'] ?? null)
            || ! array_is_list($payload['data'])
            || ! is_int($payload['total'] ?? null)
            || ! is_int($payload['per_page'] ?? null)
            || ! is_int($payload['current_page'] ?? null)
            || ! is_string($payload['path'] ?? null)
        ) {
            return false;
        }

        foreach ($payload['data'] as $item) {
            if (! is_array($item) || ! is_string($item['uuid'] ?? null)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param  list<string>  $uuids
     */
    private function ensureSelectedCount(int $selectedCount, array $uuids): void
    {
        if ($selectedCount !== count($uuids)) {
            throw ValidationException::withMessages([
                'uuids' => 'One or more selected files are no longer available for this action.',
            ]);
        }
    }

    private function moveFile(string $fromDisk, string $toDisk, string $path): void
    {
        $source = Storage::disk($fromDisk);
        $destination = Storage::disk($toDisk);

        if (! $source->exists($path)) {
            throw new RuntimeException("Gallery file [{$path}] is missing from disk [{$fromDisk}].");
        }

        if ($destination->exists($path)) {
            throw new RuntimeException("Gallery file [{$path}] already exists on disk [{$toDisk}].");
        }

        $stream = $source->readStream($path);

        if (! is_resource($stream)) {
            throw new RuntimeException("Unable to read gallery file [{$path}] from disk [{$fromDisk}].");
        }

        try {
            $written = $destination->writeStream($path, $stream);
        } catch (Throwable $exception) {
            $destination->delete($path);

            throw $exception;
        } finally {
            fclose($stream);
        }

        if (! $written) {
            $destination->delete($path);

            throw new RuntimeException("Unable to move gallery file [{$path}] to disk [{$toDisk}].");
        }

        if (! $source->delete($path)) {
            $destination->delete($path);

            throw new RuntimeException("Unable to remove gallery file [{$path}] from disk [{$fromDisk}].");
        }
    }

    /**
     * @param  list<array{0: string, 1: string, 2: string}>  $movedFiles
     */
    private function reverseMoves(array $movedFiles): void
    {
        foreach (array_reverse($movedFiles) as [$path, $fromDisk, $toDisk]) {
            $this->moveFile($fromDisk, $toDisk, $path);
        }
    }

    private function fileType(string $mimeType): string
    {
        return match (true) {
            str_starts_with($mimeType, 'image/') => 'image',
            str_starts_with($mimeType, 'video/') => 'video',
            str_starts_with($mimeType, 'audio/') => 'audio',
            str_starts_with($mimeType, 'text/'),
            str_contains($mimeType, 'pdf'),
            str_contains($mimeType, 'document'),
            str_contains($mimeType, 'spreadsheet'),
            str_contains($mimeType, 'presentation') => 'document',
            str_contains($mimeType, 'zip'),
            str_contains($mimeType, 'compressed'),
            str_contains($mimeType, 'archive') => 'archive',
            default => 'other',
        };
    }

    private function invalidateListingCache(): int|bool
    {
        Cache::add(self::CACHE_VERSION_KEY, 1, now()->addYears(10));

        return Cache::increment(self::CACHE_VERSION_KEY);
    }

    private function safeOriginalFileName(UploadedFile $file): string
    {
        $fileName = basename(str_replace('\\', '/', $file->getClientOriginalName()));
        $fileName = preg_replace('/[\x00-\x1F\x7F]/u', '', $fileName) ?? '';

        return mb_substr($fileName !== '' ? $fileName : 'file', 0, 255);
    }

    private function safeDownloadName(string $fileName): string
    {
        $fileName = basename(str_replace('\\', '/', $fileName));
        $fileName = preg_replace('/[\x00-\x1F\x7F]/u', '', $fileName) ?? '';

        return $fileName !== '' ? $fileName : 'download';
    }
}
