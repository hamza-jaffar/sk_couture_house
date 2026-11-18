<?php

namespace Modules\Order\Services;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\ValidationException;
use Modules\Coupon\Enum\DiscountTypeEnum;
use Modules\Coupon\Models\Coupon;
use Modules\Order\Enum\OrderStatusEnum;
use Modules\Order\Models\Order;

class CartService
{
    private const string SESSION_KEY = 'cart';

    private const string SESSION_COUPON_KEY = 'cart_coupon';

    /**
     * Get the cart items from the session.
     *
     * @return array<string, array<string, mixed>>
     */
    public function getCart(): array
    {
        return Session::get(self::SESSION_KEY, []);
    }

    /**
     * Add an item to the cart or update its quantity.
     *
     * @param  array{
     *     product_id: int,
     *     product_title: string,
     *     product_slug: string,
     *     variant_id?: int|null,
     *     sku?: string|null,
     *     selected_options?: array<string, string>|null,
     *     unit_price: float,
     *     quantity: int,
     *     image_url?: string|null,
     *     order_type?: string
     * }  $item
     * @return array<string, array<string, mixed>>
     */
    public function addItem(array $item): array
    {
        $cart = $this->getCart();
        $key = $this->generateKey(
            (int) $item['product_id'],
            $item['variant_id'] ?? null,
            $item['selected_options'] ?? [],
        );

        $quantity = max(1, (int) $item['quantity']);
        $unitPrice = (float) $item['unit_price'];

        if (isset($cart[$key])) {
            $cart[$key]['quantity'] += $quantity;
            $cart[$key]['total_price'] = round($cart[$key]['quantity'] * $cart[$key]['unit_price'], 2);
        } else {
            $cart[$key] = [
                'key' => $key,
                'product_id' => (int) $item['product_id'],
                'product_title' => $item['product_title'],
                'product_slug' => $item['product_slug'],
                'variant_id' => $item['variant_id'] ?? null,
                'sku' => $item['sku'] ?? null,
                'selected_options' => $item['selected_options'] ?? [],
                'unit_price' => $unitPrice,
                'quantity' => $quantity,
                'total_price' => round($unitPrice * $quantity, 2),
                'image_url' => $item['image_url'] ?? null,
                'order_type' => $item['order_type'] ?? 'direct',
            ];
        }

        $this->saveCart($cart);

        return $cart;
    }

    /**
     * Update an item's quantity.
     *
     * @return array<string, array<string, mixed>>
     */
    public function updateItem(string $key, int $quantity): array
    {
        $cart = $this->getCart();

        if (! isset($cart[$key])) {
            return $cart;
        }

        if ($quantity <= 0) {
            unset($cart[$key]);
        } else {
            $cart[$key]['quantity'] = min(99, $quantity);
            $cart[$key]['total_price'] = round($cart[$key]['quantity'] * $cart[$key]['unit_price'], 2);
        }

        $this->saveCart($cart);

        return $cart;
    }

    /**
     * Remove an item from the cart.
     *
     * @return array<string, array<string, mixed>>
     */
    public function removeItem(string $key): array
    {
        $cart = $this->getCart();

        if (isset($cart[$key])) {
            unset($cart[$key]);
            $this->saveCart($cart);
        }

        return $cart;
    }

    /**
     * Clear all items and applied coupon in the cart.
     */
    public function clearCart(): void
    {
        Session::forget(self::SESSION_KEY);
        Session::forget(self::SESSION_COUPON_KEY);
        Session::put('cart_count', 0);
    }

    /**
     * Apply a coupon code to the current cart.
     *
     * @return array<string, mixed>
     *
     * @throws ValidationException
     */
    public function applyCoupon(string $code, ?int $customerId = null, ?string $customerEmail = null, ?int $userId = null): array
    {
        $cart = $this->getCart();
        if (empty($cart)) {
            throw ValidationException::withMessages([
                'code' => 'Your shopping bag is empty.',
            ]);
        }

        $code = strtoupper(trim($code));

        /** @var Coupon|null $coupon */
        $coupon = Coupon::query()
            ->where('code', $code)
            ->first();

        if (! $coupon || ! $coupon->is_active) {
            throw ValidationException::withMessages([
                'code' => 'This promo code is invalid or no longer active.',
            ]);
        }

        $now = now();
        if ($coupon->starts_at && $now->lt($coupon->starts_at)) {
            throw ValidationException::withMessages([
                'code' => 'This coupon has not started yet.',
            ]);
        }

        if ($coupon->expires_at && $now->gt($coupon->expires_at)) {
            throw ValidationException::withMessages([
                'code' => 'This coupon has expired.',
            ]);
        }

        if ($coupon->usage_limit !== null && $coupon->times_used >= $coupon->usage_limit) {
            throw ValidationException::withMessages([
                'code' => 'This coupon has reached its maximum total usage limit.',
            ]);
        }

        $subtotal = $this->cartTotal();
        if ($coupon->min_spend !== null && $subtotal < (float) $coupon->min_spend) {
            throw ValidationException::withMessages([
                'code' => 'This coupon requires a minimum spend of Rs. '.number_format((float) $coupon->min_spend, 2).'.',
            ]);
        }

        // Verify per-user usage limit if customer or email or userId is known
        if ($coupon->usage_limit_per_user !== null && ($customerId || $customerEmail || $userId)) {
            $usageCount = Order::query()
                ->where('coupon_code', $coupon->code)
                ->where('status', '!=', OrderStatusEnum::CANCELLED->value)
                ->where(function (Builder $query) use ($customerId, $customerEmail, $userId): void {
                    $hasCondition = false;
                    if ($customerId) {
                        $query->orWhere('customer_id', $customerId);
                        $hasCondition = true;
                    }
                    if ($customerEmail) {
                        $query->orWhere('customer_email', $customerEmail);
                        $hasCondition = true;
                    }
                    if ($userId) {
                        $query->orWhere('user_id', $userId);
                        $hasCondition = true;
                    }
                    if (! $hasCondition) {
                        $query->whereRaw('1 = 0');
                    }
                })
                ->count();

            if ($usageCount >= (int) $coupon->usage_limit_per_user) {
                $limit = (int) $coupon->usage_limit_per_user;
                $times = $limit === 1 ? 'once' : "{$limit} times";
                throw ValidationException::withMessages([
                    'code' => "This coupon can only be used {$times} per customer, and you have already reached that limit.",
                ]);
            }
        }

        $discountType = $coupon->discount_type instanceof DiscountTypeEnum
            ? $coupon->discount_type->value
            : (string) $coupon->discount_type;

        $couponData = [
            'id' => (int) $coupon->id,
            'code' => $coupon->code,
            'discount_type' => $discountType,
            'discount_value' => (float) $coupon->discount_value,
            'min_spend' => $coupon->min_spend !== null ? (float) $coupon->min_spend : null,
            'max_discount' => $coupon->max_discount !== null ? (float) $coupon->max_discount : null,
            'usage_limit_per_user' => $coupon->usage_limit_per_user,
        ];

        Session::put(self::SESSION_COUPON_KEY, $couponData);

        return $this->getAppliedCoupon() ?? $couponData;
    }

    /**
     * Remove applied coupon.
     */
    public function removeCoupon(): void
    {
        Session::forget(self::SESSION_COUPON_KEY);
    }

    /**
     * Get applied coupon details and dynamic discount amount.
     *
     * @return array<string, mixed>|null
     */
    public function getAppliedCoupon(): ?array
    {
        $coupon = Session::get(self::SESSION_COUPON_KEY);
        if (! $coupon || empty($this->getCart())) {
            return null;
        }

        $subtotal = $this->cartTotal();

        // Check min spend validity
        if ($coupon['min_spend'] !== null && $subtotal < (float) $coupon['min_spend']) {
            return null;
        }

        $discount = 0.0;
        if ($coupon['discount_type'] === 'percentage') {
            $discount = round($subtotal * ($coupon['discount_value'] / 100), 2);
            if ($coupon['max_discount'] !== null && $discount > (float) $coupon['max_discount']) {
                $discount = (float) $coupon['max_discount'];
            }
        } else {
            $discount = min($subtotal, (float) $coupon['discount_value']);
        }

        $discount = min($subtotal, max(0.0, round($discount, 2)));

        $coupon['discount_amount'] = $discount;

        return $coupon;
    }

    /**
     * Calculate total discount from applied coupon.
     */
    public function cartDiscount(): float
    {
        $coupon = $this->getAppliedCoupon();

        return $coupon ? (float) $coupon['discount_amount'] : 0.0;
    }

    /**
     * Calculate final total after discount.
     */
    public function cartFinalTotal(): float
    {
        return max(0.0, round($this->cartTotal() - $this->cartDiscount(), 2));
    }

    /**
     * Calculate cart subtotal.
     */
    public function cartTotal(): float
    {
        $cart = $this->getCart();
        $total = 0.0;

        foreach ($cart as $item) {
            $total += ($item['unit_price'] * $item['quantity']);
        }

        return round($total, 2);
    }

    /**
     * Count total items in the cart.
     */
    public function cartCount(): int
    {
        $cart = $this->getCart();
        $count = 0;

        foreach ($cart as $item) {
            $count += (int) $item['quantity'];
        }

        return $count;
    }

    /**
     * Generate unique key for product + variant + options.
     *
     * @param  array<string, string>|null  $options
     */
    public function generateKey(int $productId, ?int $variantId, ?array $options): string
    {
        $normalizedOptions = $options ?? [];
        ksort($normalizedOptions);

        $optionsHash = ! empty($normalizedOptions)
            ? substr(md5(json_encode($normalizedOptions)), 0, 8)
            : 'default';

        return "prod_{$productId}_var_".($variantId ?? 0)."_{$optionsHash}";
    }

    /**
     * Save cart to session and update cart count.
     *
     * @param  array<string, array<string, mixed>>  $cart
     */
    private function saveCart(array $cart): void
    {
        Session::put(self::SESSION_KEY, $cart);
        $count = 0;
        foreach ($cart as $item) {
            $count += (int) $item['quantity'];
        }
        Session::put('cart_count', $count);
    }
}
