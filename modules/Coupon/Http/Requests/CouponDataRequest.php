<?php

namespace Modules\Coupon\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Coupon\Enum\DiscountTypeEnum;
use Modules\Coupon\Models\Coupon;

class CouponDataRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->has('code') && is_string($this->code)) {
            $this->merge([
                'code' => strtoupper(trim($this->code)),
            ]);
        }
    }

    public function authorize(): bool
    {
        $coupon = $this->route('coupon');

        if ($this->isMethod('post')) {
            return $this->user()?->can('coupons.create') ?? false;
        }

        return $this->user()?->can('coupons.update')
            && $coupon instanceof Coupon
            && ! $coupon->trashed();
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50', 'uppercase'],
            'description' => ['nullable', 'string', 'max:1000'],
            'discount_type' => ['required', Rule::enum(DiscountTypeEnum::class)],
            'discount_value' => ['required', 'numeric', 'min:0.01', 'max:9999999.99'],
            'min_spend' => ['nullable', 'numeric', 'min:0'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'usage_limit_per_user' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array{
     *     code: string,
     *     description: string|null,
     *     discount_type: string,
     *     discount_value: float,
     *     min_spend: float|null,
     *     max_discount: float|null,
     *     usage_limit: int|null,
     *     usage_limit_per_user: int|null,
     *     starts_at: string|null,
     *     expires_at: string|null,
     *     is_active: bool
     * }
     */
    public function couponData(): array
    {
        $validated = $this->validated();

        return [
            'code' => strtoupper($validated['code']),
            'description' => $validated['description'] ?? null,
            'discount_type' => $validated['discount_type'],
            'discount_value' => (float) $validated['discount_value'],
            'min_spend' => isset($validated['min_spend']) ? (float) $validated['min_spend'] : null,
            'max_discount' => isset($validated['max_discount']) ? (float) $validated['max_discount'] : null,
            'usage_limit' => isset($validated['usage_limit']) ? (int) $validated['usage_limit'] : null,
            'usage_limit_per_user' => isset($validated['usage_limit_per_user']) ? (int) $validated['usage_limit_per_user'] : null,
            'starts_at' => $validated['starts_at'] ?? null,
            'expires_at' => $validated['expires_at'] ?? null,
            'is_active' => (bool) $validated['is_active'],
        ];
    }
}
