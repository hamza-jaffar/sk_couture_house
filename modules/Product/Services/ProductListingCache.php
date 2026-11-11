<?php

namespace Modules\Product\Services;

use Closure;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ProductListingCache
{
    private const string VERSION_KEY = 'product-listings:version';

    /**
     * @param  array<string, mixed>  $filters
     * @param  Closure(): LengthAwarePaginator<int, array<string, mixed>>  $callback
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function remember(array $filters, Closure $callback): LengthAwarePaginator
    {
        $version = Cache::get(self::VERSION_KEY, 1);
        $key = 'product-listings:'.$version.':'.hash(
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
     * @param  Closure(): array{
     *     categories: list<array{id: int, name: string, slug: string}>,
     *     variant_presets: list<array{id: string, name: string, values: list<string>}>,
     *     currency: string,
     *     currency_icon: string
     * }  $callback
     * @return array{
     *     categories: list<array{id: int, name: string, slug: string}>,
     *     variant_presets: list<array{id: string, name: string, values: list<string>}>,
     *     currency: string,
     *     currency_icon: string
     * }
     */
    public function rememberFormOptions(Closure $callback): array
    {
        $version = Cache::get(self::VERSION_KEY, 1);

        /** @var array{categories: list<array{id: int, name: string, slug: string}>, variant_presets: list<array{id: string, name: string, values: list<string>}>, currency: string, currency_icon: string} */
        return Cache::remember(
            'product-form-options:'.$version,
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
