<?php

namespace Modules\Coupon\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Modules\Coupon\Models\Coupon;

class CouponService
{
    public function __construct(private CouponListingCache $listingCache) {}

    /**
     * @param  array{
     *     search?: string|null,
     *     discount_type?: string|null,
     *     status?: 'active'|'deleted',
     *     sort?: string,
     *     direction?: 'asc'|'desc',
     *     per_page?: int|string,
     *     page?: int|string
     * }  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function paginateCoupons(array $filters): LengthAwarePaginator
    {
        return $this->listingCache->remember(
            $filters,
            fn (): LengthAwarePaginator => $this->paginateCouponsWithoutCache($filters),
        );
    }

    /**
     * @param  array{
     *     code: string,
     *     description: string|null,
     *     discount_type: string,
     *     discount_value: float|string,
     *     min_spend: float|string|null,
     *     max_discount: float|string|null,
     *     usage_limit: int|null,
     *     usage_limit_per_user: int|null,
     *     starts_at: string|null,
     *     expires_at: string|null,
     *     is_active: bool
     * }  $data
     */
    public function createCoupon(array $data): Coupon
    {
        return DB::transaction(function () use ($data): Coupon {
            $this->assertUniqueCode($data['code']);

            $coupon = Coupon::query()->create($data);

            $this->listingCache->invalidateAfterCommit();

            return $coupon;
        });
    }

    /**
     * @param  array{
     *     code: string,
     *     description: string|null,
     *     discount_type: string,
     *     discount_value: float|string,
     *     min_spend: float|string|null,
     *     max_discount: float|string|null,
     *     usage_limit: int|null,
     *     usage_limit_per_user: int|null,
     *     starts_at: string|null,
     *     expires_at: string|null,
     *     is_active: bool
     * }  $data
     */
    public function updateCoupon(Coupon $coupon, array $data): Coupon
    {
        return DB::transaction(function () use ($coupon, $data): Coupon {
            $coupon = Coupon::query()
                ->whereKey($coupon->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $this->assertUniqueCode($data['code'], (int) $coupon->getKey());

            $coupon->update($data);

            $this->listingCache->invalidateAfterCommit();

            return $coupon;
        });
    }

    public function deleteCoupon(Coupon $coupon): void
    {
        $this->deleteCoupons([$coupon->getKey()]);
    }

    /**
     * @param  list<int>  $ids
     */
    public function deleteCoupons(array $ids): void
    {
        DB::transaction(function () use ($ids): void {
            $coupons = Coupon::query()
                ->whereKey($ids)
                ->lockForUpdate()
                ->get();

            $this->assertAllFound($coupons->count(), $ids);

            foreach ($coupons as $coupon) {
                $coupon->delete();
            }

            $this->listingCache->invalidateAfterCommit();
        });
    }

    public function restoreCoupon(Coupon $coupon): void
    {
        $this->restoreCoupons([$coupon->getKey()]);
    }

    /**
     * @param  list<int>  $ids
     */
    public function restoreCoupons(array $ids): void
    {
        DB::transaction(function () use ($ids): void {
            $coupons = Coupon::withTrashed()
                ->whereKey($ids)
                ->whereNotNull('deleted_at')
                ->lockForUpdate()
                ->get();

            $this->assertAllFound($coupons->count(), $ids);

            foreach ($coupons as $coupon) {
                $coupon->restore();
            }

            $this->listingCache->invalidateAfterCommit();
        });
    }

    public function forceDeleteCoupon(Coupon $coupon): void
    {
        $this->forceDeleteCoupons([$coupon->getKey()]);
    }

    /**
     * @param  list<int>  $ids
     */
    public function forceDeleteCoupons(array $ids): void
    {
        DB::transaction(function () use ($ids): void {
            $coupons = Coupon::withTrashed()
                ->whereKey($ids)
                ->lockForUpdate()
                ->get();

            $this->assertAllFound($coupons->count(), $ids);

            foreach ($coupons as $coupon) {
                $coupon->forceDelete();
            }

            $this->listingCache->invalidateAfterCommit();
        });
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    private function paginateCouponsWithoutCache(array $filters): LengthAwarePaginator
    {
        $query = Coupon::query();

        if (($filters['status'] ?? 'active') === 'deleted') {
            $query->onlyTrashed();
        }

        if (filled($filters['search'] ?? null)) {
            $search = trim($filters['search']);
            $query->where(function (Builder $q) use ($search): void {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (filled($filters['discount_type'] ?? null) && $filters['discount_type'] !== '__all__') {
            $query->where('discount_type', $filters['discount_type']);
        }

        $sortColumns = [
            'code' => 'code',
            'discount_type' => 'discount_type',
            'discount_value' => 'discount_value',
            'times_used' => 'times_used',
            'expires_at' => 'expires_at',
            'is_active' => 'is_active',
            'created_at' => 'created_at',
        ];

        $sort = $filters['sort'] ?? 'created_at';
        $sort = array_key_exists($sort, $sortColumns) ? $sort : 'created_at';
        $direction = ($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        $perPage = (int) ($filters['per_page'] ?? 10);
        $page = (int) ($filters['page'] ?? 1);

        $paginator = $query
            ->orderBy($sortColumns[$sort], $direction)
            ->orderBy('id')
            ->paginate($perPage, ['*'], 'page', $page)
            ->withQueryString();

        return $paginator->through(fn (Coupon $coupon): array => [
            ...$coupon->toArray(),
            'discount_type' => $coupon->discount_type->value,
            'discount_type_label' => $coupon->discount_type->label(),
            'starts_at' => $coupon->starts_at?->toISOString(),
            'expires_at' => $coupon->expires_at?->toISOString(),
        ]);
    }

    private function assertUniqueCode(string $code, ?int $ignoreId = null): void
    {
        $query = Coupon::withTrashed()->where('code', $code);

        if ($ignoreId !== null) {
            $query->where('id', '!=', $ignoreId);
        }

        if ($query->exists()) {
            throw ValidationException::withMessages([
                'code' => __('A coupon with this code already exists.'),
            ]);
        }
    }

    /**
     * @param  list<int>  $ids
     */
    private function assertAllFound(int $found, array $ids): void
    {
        if ($found !== count(array_unique($ids))) {
            throw ValidationException::withMessages([
                'ids' => __('One or more selected coupons are no longer available. Refresh and try again.'),
            ]);
        }
    }
}
