<?php

namespace Modules\Order\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AddToCartRequest extends FormRequest
{
    public function authorize(): bool
    {
        $key = 'add-to-cart:'.$this->ip();
        if (RateLimiter::tooManyAttempts($key, 60)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'cart' => "Too many attempts. Please try again in {$seconds} seconds.",
            ]);
        }
        RateLimiter::hit($key, 60);

        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'selected_options' => ['nullable', 'array'],
            'selected_options.*' => ['nullable', 'string', 'max:100'],
            'quantity' => ['required', 'integer', 'min:1', 'max:99'],
        ];
    }
}
