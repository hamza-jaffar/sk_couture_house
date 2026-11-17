<?php

namespace Modules\Order\Services;

use Closure;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class OrderListingCache
{
    private const string VERSION_KEY = 'orders-listings:version';

    /**
     * @param  array<string, mixed>  $filters
     * @param  Closure(): LengthAwarePaginator<int, array<string, mixed>>  $callback
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function rememberList(array $filters, Closure $callback): LengthAwarePaginator
    {
        $version = Cache::get(self::VERSION_KEY, 1);
        $key = 'orders-listings:'.$version.':'.hash(
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
     * @param  Closure(): array<string, mixed>|null  $callback
     * @return array<string, mixed>|null
     */
    public function rememberOrder(string $orderNumber, Closure $callback): ?array
    {
        $version = Cache::get(self::VERSION_KEY, 1);
        $key = 'orders-single:'.$version.':'.$orderNumber;

        return Cache::remember(
            $key,
            now()->addMinutes(15),
            $callback,
        );
    }

    /**
     * Invalidate order caches after database transaction commits.
     */
    public function invalidateAfterCommit(): void
    {
        DB::afterCommit(function (): void {
            Cache::add(self::VERSION_KEY, 1, now()->addYears(10));
            Cache::increment(self::VERSION_KEY);
        });
    }
}
