<?php

namespace Modules\User\Services;

use Closure;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Modules\User\Models\Role;
use Modules\User\Models\User;

class UserListingCache
{
    private const string VERSION_KEY = 'user-listings:version';

    /**
     * @phpstan-type CachedUser array{attributes: array<string, mixed>, roles: list<array<string, mixed>>}
     * @phpstan-type CachedListing array{
     *     items: list<CachedUser>,
     *     total: int,
     *     per_page: int,
     *     current_page: int,
     *     options: array{path: string, query: array<string, mixed>, pageName: string}
     * }
     *
     * @param  array<string, mixed>  $filters
     * @param  Closure(): LengthAwarePaginator<int, User>  $callback
     * @return LengthAwarePaginator<int, User>
     */
    public function remember(array $filters, bool $customers, Closure $callback): LengthAwarePaginator
    {
        $version = Cache::get(self::VERSION_KEY, 1);
        $key = 'user-listings:'.$version.':'.hash(
            'sha256',
            json_encode(
                ['customers' => $customers, 'filters' => $filters],
                JSON_THROW_ON_ERROR,
            ),
        );

        $cached = Cache::get($key);

        if ($this->isCachedListing($cached)) {
            return $this->restorePaginator($cached);
        }

        if ($cached !== null) {
            Cache::forget($key);
        }

        $payload = Cache::remember(
            $key,
            now()->addMinutes(5),
            fn (): array => $this->cachePaginator($callback()),
        );

        if (! $this->isCachedListing($payload)) {
            Cache::forget($key);

            return $callback();
        }

        return $this->restorePaginator($payload);
    }

    public function invalidateAfterCommit(): void
    {
        DB::afterCommit(fn () => $this->invalidate());
    }

    private function invalidate(): void
    {
        Cache::add(self::VERSION_KEY, 1, now()->addYears(10));
        Cache::increment(self::VERSION_KEY);
    }

    /**
     * @param  LengthAwarePaginator<int, User>  $paginator
     * @return array{
     *     items: list<array{attributes: array<string, mixed>, roles: list<array<string, mixed>>}>,
     *     total: int,
     *     per_page: int,
     *     current_page: int,
     *     options: array{path: string, query: array<string, mixed>, pageName: string}
     * }
     */
    private function cachePaginator(LengthAwarePaginator $paginator): array
    {
        return [
            'items' => $paginator->getCollection()
                ->map(fn (User $user): array => [
                    'attributes' => $user->getAttributes(),
                    'roles' => $user->roles
                        ->map(fn (Role $role): array => $role->getAttributes())
                        ->all(),
                ])
                ->all(),
            'total' => $paginator->total(),
            'per_page' => $paginator->perPage(),
            'current_page' => $paginator->currentPage(),
            'options' => [
                'path' => $paginator->path(),
                'query' => $paginator->getOptions()['query'] ?? [],
                'pageName' => $paginator->getPageName(),
            ],
        ];
    }

    /**
     * @phpstan-assert-if-true array{
     *     items: list<array{attributes: array<string, mixed>, roles: list<array<string, mixed>>}>,
     *     total: int,
     *     per_page: int,
     *     current_page: int,
     *     options: array{path: string, query: array<string, mixed>, pageName: string}
     * } $payload
     */
    private function isCachedListing(mixed $payload): bool
    {
        if (
            ! is_array($payload)
            || ! isset($payload['items'], $payload['total'], $payload['per_page'], $payload['current_page'], $payload['options'])
            || ! is_array($payload['items'])
            || ! array_is_list($payload['items'])
            || ! is_int($payload['total'])
            || ! is_int($payload['per_page'])
            || ! is_int($payload['current_page'])
            || ! is_array($payload['options'])
            || ! is_string($payload['options']['path'] ?? null)
            || ! is_array($payload['options']['query'] ?? null)
            || ! is_string($payload['options']['pageName'] ?? null)
        ) {
            return false;
        }

        foreach ($payload['items'] as $item) {
            if (
                ! is_array($item)
                || ! is_array($item['attributes'] ?? null)
                || ! is_array($item['roles'] ?? null)
                || ! array_is_list($item['roles'])
            ) {
                return false;
            }

            foreach ($item['roles'] as $role) {
                if (! is_array($role)) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * @param  array{
     *     items: list<array{attributes: array<string, mixed>, roles: list<array<string, mixed>>}>,
     *     total: int,
     *     per_page: int,
     *     current_page: int,
     *     options: array{path: string, query: array<string, mixed>, pageName: string}
     * }  $payload
     * @return LengthAwarePaginator<int, User>
     */
    private function restorePaginator(array $payload): LengthAwarePaginator
    {
        $users = collect($payload['items'])
            ->map(function (array $item): User {
                $user = (new User)->newFromBuilder($item['attributes']);
                $roles = collect($item['roles'])
                    ->map(fn (array $attributes): Role => (new Role)->newFromBuilder($attributes));

                $user->setRelation('roles', $roles);

                return $user;
            });

        return new Paginator(
            $users,
            $payload['total'],
            $payload['per_page'],
            $payload['current_page'],
            $payload['options'],
        );
    }
}
