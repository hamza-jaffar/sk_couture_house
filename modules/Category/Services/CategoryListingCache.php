<?php

namespace Modules\Category\Services;

use Closure;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CategoryListingCache
{
    private const string VERSION_KEY = 'category-listings:version';

    /**
     * @param  array<string, mixed>  $filters
     * @param  Closure(): LengthAwarePaginator<int, array<string, mixed>>  $callback
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function remember(array $filters, Closure $callback): LengthAwarePaginator
    {
        $version = Cache::get(self::VERSION_KEY, 1);
        $key = 'category-listings:'.$version.':'.hash(
            'sha256',
            json_encode(['filters' => $filters], JSON_THROW_ON_ERROR),
        );

        /** @var array{data: list<array<string, mixed>>, total: int, per_page: int, current_page: int} $snapshot */
        $snapshot = Cache::remember(
            $key,
            now()->addMinutes(5),
            function () use ($callback): array {
                $paginator = $callback();

                return [
                    'data' => array_values($paginator->getCollection()->all()),
                    'total' => $paginator->total(),
                    'per_page' => $paginator->perPage(),
                    'current_page' => $paginator->currentPage(),
                ];
            },
        );

        return new Paginator(
            $snapshot['data'],
            $snapshot['total'],
            $snapshot['per_page'],
            $snapshot['current_page'],
            [
                'path' => Paginator::resolveCurrentPath(),
                'query' => request()->query(),
            ],
        );
    }

    /**
     * @param  Closure(): list<array{id: int, parent_id: int|null, name: string, slug: string, deleted_at: string|null}>  $callback
     * @return list<array{id: int, parent_id: int|null, name: string, slug: string, deleted_at: string|null}>
     */
    public function rememberParentOptions(Closure $callback): array
    {
        $version = Cache::get(self::VERSION_KEY, 1);

        return Cache::remember(
            'category-options:'.$version,
            now()->addMinutes(30),
            $callback,
        );
    }

    public function invalidateAfterCommit(): void
    {
        DB::afterCommit(function (): void {
            Cache::add(self::VERSION_KEY, 1, now()->addYears(10));
            Cache::increment(self::VERSION_KEY);
        });
    }
}
