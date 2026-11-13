<?php

namespace Modules\Coupon\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Coupon\Enum\DiscountTypeEnum;
use Modules\Coupon\Http\Requests\CouponBulkRequest;
use Modules\Coupon\Http\Requests\CouponDataRequest;
use Modules\Coupon\Http\Requests\CouponDeleteRequest;
use Modules\Coupon\Http\Requests\CouponForceDeleteRequest;
use Modules\Coupon\Http\Requests\CouponIndexRequest;
use Modules\Coupon\Http\Requests\CouponRestoreRequest;
use Modules\Coupon\Models\Coupon;
use Modules\Coupon\Services\CouponService;

class CouponController
{
    public function __construct(private CouponService $couponService) {}

    public function index(CouponIndexRequest $request): Response
    {
        $filters = $request->validated();

        return Inertia::render('dashboard/coupons', [
            'coupons' => Inertia::defer(
                fn () => $this->couponService->paginateCoupons($filters),
                'coupon-list',
            ),
            'discountTypeOptions' => DiscountTypeEnum::options(),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'discount_type' => $filters['discount_type'] ?? '__all__',
                'status' => $filters['status'] ?? 'active',
                'sort' => $filters['sort'] ?? 'created_at',
                'direction' => $filters['direction'] ?? 'desc',
                'page' => (int) ($filters['page'] ?? 1),
                'per_page' => (int) ($filters['per_page'] ?? 10),
            ],
        ]);
    }

    public function store(CouponDataRequest $request): RedirectResponse
    {
        $this->couponService->createCoupon($request->couponData());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Coupon created successfully.'),
        ]);

        return back();
    }

    public function update(CouponDataRequest $request, Coupon $coupon): RedirectResponse
    {
        $this->couponService->updateCoupon($coupon, $request->couponData());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Coupon updated successfully.'),
        ]);

        return back();
    }

    public function destroy(CouponDeleteRequest $request, Coupon $coupon): RedirectResponse
    {
        $this->couponService->deleteCoupon($coupon);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Coupon moved to trash.'),
        ]);

        return back();
    }

    public function bulkDestroy(CouponBulkRequest $request): RedirectResponse
    {
        $this->couponService->deleteCoupons($request->couponIds());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Selected coupons moved to trash.'),
        ]);

        return back();
    }

    public function restore(CouponRestoreRequest $request, Coupon $coupon): RedirectResponse
    {
        $this->couponService->restoreCoupon($coupon);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Coupon restored successfully.'),
        ]);

        return back();
    }

    public function bulkRestore(CouponBulkRequest $request): RedirectResponse
    {
        $this->couponService->restoreCoupons($request->couponIds());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Selected coupons restored successfully.'),
        ]);

        return back();
    }

    public function forceDelete(CouponForceDeleteRequest $request, Coupon $coupon): RedirectResponse
    {
        $this->couponService->forceDeleteCoupon($coupon);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Coupon permanently deleted.'),
        ]);

        return back();
    }

    public function bulkForceDelete(CouponBulkRequest $request): RedirectResponse
    {
        $this->couponService->forceDeleteCoupons($request->couponIds());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Selected coupons permanently deleted.'),
        ]);

        return back();
    }
}
