<?php

namespace Modules\Order\Services;

use Illuminate\Support\Facades\Session;

class CartService
{
    private const string SESSION_KEY = 'cart';

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
     * Clear all items in the cart.
     */
    public function clearCart(): void
    {
        Session::forget(self::SESSION_KEY);
        Session::put('cart_count', 0);
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
