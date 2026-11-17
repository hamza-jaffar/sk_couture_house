<?php

namespace Modules\Order\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        $key = 'checkout:'.$this->ip();
        if (RateLimiter::tooManyAttempts($key, 10)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'checkout' => "Too many checkout requests. Please wait {$seconds} seconds.",
            ]);
        }
        RateLimiter::hit($key, 300);

        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'customer_name' => ['required', 'string', 'max:200'],
            'customer_email' => ['required', 'email', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:40'],
            'shipping_address' => ['required', 'array'],
            'shipping_address.line1' => ['required', 'string', 'max:255'],
            'shipping_address.city' => ['required', 'string', 'max:120'],
            'shipping_address.region' => ['nullable', 'string', 'max:120'],
            'shipping_address.postal_code' => ['nullable', 'string', 'max:30'],
            'shipping_address.country' => ['nullable', 'string', 'max:120'],
            'payment_method' => ['nullable', 'string', 'in:cash_on_delivery,bank_transfer'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
