<?php

namespace Modules\Coupon\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CouponBulkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('coupons.delete') ?? false;
    }

    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1', 'max:100'],
            'ids.*' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('coupons', 'id'),
            ],
        ];
    }

    /**
     * @return list<int>
     */
    public function couponIds(): array
    {
        return array_map('intval', $this->validated('ids'));
    }
}
