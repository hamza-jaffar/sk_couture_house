<?php

namespace App\Helpers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class SlugHelper
{
    /**
     * Generate a basic URL-friendly slug.
     */
    public static function generate(
        string $value,
        string $separator = '-'
    ): string {
        $slug = Str::slug($value, $separator);

        if ($slug === '') {
            throw new InvalidArgumentException(
                'Unable to generate a slug from the provided value.'
            );
        }

        return $slug;
    }

    /**
     * Generate a unique slug for a database table.
     *
     * Supports excluding an existing record when updating.
     */
    public static function unique(
        string $value,
        string $table,
        string $column = 'slug',
        ?int $ignoreId = null,
        string $separator = '-',
        ?string $fallback = null
    ): string {
        try {
            $slug = self::generate($value, $separator);
        } catch (InvalidArgumentException $exception) {
            if ($fallback === null) {
                throw $exception;
            }

            $slug = self::generate($fallback, $separator);
        }

        $originalSlug = $slug;
        $counter = 1;

        while (
            self::exists($table, $column, $slug, $ignoreId)
        ) {
            $counter++;

            $slug = $originalSlug.$separator.$counter;
        }

        return $slug;
    }

    /**
     * Generate a unique slug using an Eloquent model.
     */
    public static function uniqueForModel(
        Model $model,
        string $value,
        string $column = 'slug',
        string $separator = '-'
    ): string {
        $query = $model->newQuery();

        if ($model->exists) {
            $query->where(
                $model->getKeyName(),
                '!=',
                $model->getKey()
            );
        }

        $slug = self::generate($value, $separator);
        $originalSlug = $slug;
        $counter = 1;

        while ($query->clone()->where($column, $slug)->exists()) {
            $counter++;

            $slug = $originalSlug.$separator.$counter;
        }

        return $slug;
    }

    /**
     * Check whether a slug already exists.
     */
    public static function exists(
        string $table,
        string $column,
        string $slug,
        ?int $ignoreId = null
    ): bool {
        $query = DB::table($table)
            ->where($column, $slug);

        if ($ignoreId !== null) {
            $query->where('id', '!=', $ignoreId);
        }

        return $query->exists();
    }

    /**
     * Generate a slug from a custom slug or fallback value.
     */
    public static function fromInput(
        ?string $customSlug,
        string $fallback,
        string $table,
        string $column = 'slug',
        ?int $ignoreId = null,
        string $separator = '-'
    ): string {
        $value = trim($customSlug ?? '');

        if ($value === '') {
            $value = $fallback;
        }

        return self::unique(
            $value,
            $table,
            $column,
            $ignoreId,
            $separator
        );
    }
}
