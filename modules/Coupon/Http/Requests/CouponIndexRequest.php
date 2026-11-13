<?php

namespace Modules\Coupon\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CouponIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('coupons.view') ?? false;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:120'],
            'discount_type' => ['nullable', 'string', Rule::in(['percentage', 'fixed', '__all__'])],
            'status' => ['nullable', Rule::in(['active', 'deleted'])],
            'sort' => ['nullable', Rule::in(['code', 'discount_type', 'discount_value', 'times_used', 'expires_at', 'is_active', 'created_at'])],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', Rule::in([10, 20, 50, 100, '10', '20', '50', '100'])],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
