<?php

namespace Modules\Coupon\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\Coupon\Models\Coupon;

class CouponForceDeleteRequest extends FormRequest
{
    public function authorize(): bool
    {
        $coupon = $this->route('coupon');

        return $this->user()?->can('coupons.delete')
            && $coupon instanceof Coupon;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [];
    }
}
