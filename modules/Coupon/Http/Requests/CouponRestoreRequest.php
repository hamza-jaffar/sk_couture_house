<?php

namespace Modules\Coupon\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\Coupon\Models\Coupon;

class CouponRestoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        $coupon = $this->route('coupon');

        return $this->user()?->can('coupons.delete')
            && $coupon instanceof Coupon
            && $coupon->trashed();
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [];
    }
}
