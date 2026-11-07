<?php

namespace App\Helpers;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;
use RuntimeException;

class FileHelper
{
    /**
     * Upload a single file.
     *
     * @return string Stored file path.
     */
    public static function upload(
        UploadedFile $file,
        string $directory,
        ?string $disk = null
    ): string {
        if (! $file->isValid()) {
            throw new RuntimeException('The uploaded file is invalid.');
        }

        $directory = self::sanitizeDirectory($directory);
        $disk ??= config('filesystems.default');

        $path = $file->store($directory, $disk);

        if (! $path) {
            throw new RuntimeException('Unable to upload the file.');
        }

        return $path;
    }

    /**
     * Upload multiple files.
     *
     * @return array<int|string, string>
     */
    public static function uploadMany(
        array $files,
        string $directory,
        ?string $disk = null
    ): array {
        $uploadedPaths = [];

        try {
            foreach ($files as $key => $file) {
                if (! $file instanceof UploadedFile) {
                    throw new InvalidArgumentException(
                        'All items must be instances of UploadedFile.'
                    );
                }

                $uploadedPaths[$key] = self::upload(
                    $file,
                    $directory,
                    $disk
                );
            }

            return $uploadedPaths;
        } catch (\Throwable $exception) {
            // Roll back successfully uploaded files.
            self::deleteMany(array_values($uploadedPaths), $disk);

            throw $exception;
        }
    }

    /**
     * Replace an existing file with a new upload.
     *
     * Uploads the new file before deleting the old one.
     *
     * @return string New stored file path.
     */
    public static function replace(
        UploadedFile $file,
        string $directory,
        ?string $oldPath = null,
        ?string $disk = null
    ): string {
        $newPath = self::upload($file, $directory, $disk);

        if ($oldPath && $oldPath !== $newPath) {
            self::delete($oldPath, $disk);
        }

        return $newPath;
    }

    /**
     * Delete a stored file.
     */
    public static function delete(
        ?string $path,
        ?string $disk = null
    ): bool {
        if (! $path) {
            return false;
        }

        self::validatePath($path);

        $disk ??= config('filesystems.default');

        try {
            $storage = Storage::disk($disk);

            if (! $storage->exists($path)) {
                return true;
            }

            return $storage->delete($path);
        } catch (\Throwable $exception) {
            Log::error('File deletion failed.', [
                'path' => $path,
                'disk' => $disk,
                'error' => $exception->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Delete multiple stored files.
     */
    public static function deleteMany(
        array $paths,
        ?string $disk = null
    ): bool {
        $successful = true;

        foreach ($paths as $path) {
            if (! self::delete($path, $disk)) {
                $successful = false;
            }
        }

        return $successful;
    }

    /**
     * Get a public URL for a stored file.
     *
     * The selected disk must support public URLs.
     */
    public static function url(
        ?string $path,
        ?string $disk = null
    ): ?string {
        if (! $path) {
            return null;
        }

        self::validatePath($path);

        $disk ??= config('filesystems.default');

        return Storage::disk($disk)->url($path);
    }

    /**
     * Check whether a stored file exists.
     */
    public static function exists(
        ?string $path,
        ?string $disk = null
    ): bool {
        if (! $path) {
            return false;
        }

        self::validatePath($path);

        $disk ??= config('filesystems.default');

        return Storage::disk($disk)->exists($path);
    }

    /**
     * Get file size in bytes.
     */
    public static function size(
        ?string $path,
        ?string $disk = null
    ): ?int {
        if (! $path || ! self::exists($path, $disk)) {
            return null;
        }

        $disk ??= config('filesystems.default');

        return Storage::disk($disk)->size($path);
    }

    /**
     * Validate and normalize a storage directory.
     */
    private static function sanitizeDirectory(string $directory): string
    {
        $directory = trim(str_replace('\\', '/', $directory), '/');

        if (
            $directory === '' ||
            str_contains($directory, "\0")
        ) {
            throw new InvalidArgumentException(
                'A valid storage directory is required.'
            );
        }

        $segments = explode('/', $directory);

        foreach ($segments as $segment) {
            if (
                $segment === '' ||
                $segment === '.' ||
                $segment === '..'
            ) {
                throw new InvalidArgumentException(
                    'Invalid storage directory.'
                );
            }
        }

        return implode('/', $segments);
    }

    /**
     * Prevent absolute paths and directory traversal.
     */
    private static function validatePath(string $path): void
    {
        $path = str_replace('\\', '/', $path);

        if (
            $path === '' ||
            str_contains($path, "\0") ||
            str_starts_with($path, '/') ||
            preg_match('/^[a-zA-Z]:/', $path)
        ) {
            throw new InvalidArgumentException(
                'Invalid storage file path.'
            );
        }

        foreach (explode('/', $path) as $segment) {
            if ($segment === '..' || $segment === '.') {
                throw new InvalidArgumentException(
                    'Directory traversal is not allowed.'
                );
            }
        }
    }
}
