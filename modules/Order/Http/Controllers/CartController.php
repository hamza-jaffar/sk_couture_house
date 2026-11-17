<?php

namespace Modules\Order\Http\Controllers;

use App\Helpers\FileHelper;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Category\Enum\OrderTypeEnum;
use Modules\Order\Http\Requests\AddToCartRequest;
use Modules\Order\Http\Requests\UpdateCartItemRequest;
use Modules\Order\Services\CartService;
use Modules\Order\Services\OrderService;
use Modules\Product\Models\Product;
use Modules\Product\Models\ProductVariant;
use Modules\Setting\Services\SiteSettingService;

class CartController
{
    public function __construct(
        protected CartService $cartService,
        protected OrderService $orderService,
        protected SiteSettingService $settings,
    ) {}

    /**
     * Display the shopping cart page.
     */
    public function index(): Response
    {
        $platformSettings = $this->settings->all();

        return Inertia::render('frontend/cart/index', [
            'cart' => array_values($this->cartService->getCart()),
            'cart_total' => $this->cartService->cartTotal(),
            'cart_count' => $this->cartService->cartCount(),
            'currency_icon' => $platformSettings['general']['currency_icon'] ?? 'Rs.',
            'currency' => $platformSettings['general']['currency'] ?? 'PKR',
        ]);
    }

    /**
     * Add a product to the cart.
     */
    public function add(AddToCartRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        /** @var Product $product */
        $product = Product::query()
            ->with(['category:id,name,slug,order_type'])
            ->findOrFail($validated['product_id']);

        // Check if product is WhatsApp-only based on category
        $categoryOrderType = $product->category?->order_type instanceof OrderTypeEnum
            ? $product->category->order_type->value
            : (string) ($product->category?->order_type ?? 'direct');

        if ($categoryOrderType === 'whatsapp' || $product->effective_order_type === 'whatsapp') {
            $whatsappUrl = $this->orderService->generateWhatsAppUrl(
                $product,
                $validated['selected_options'] ?? [],
                (int) $validated['quantity'],
            );

            return Inertia::location($whatsappUrl);
        }

        $variant = null;
        if (! empty($validated['variant_id'])) {
            $variant = ProductVariant::query()
                ->where('product_id', $product->id)
                ->find($validated['variant_id']);
        }

        $unitPrice = $variant && $variant->sale_price
            ? (float) $variant->sale_price
            : ($variant && $variant->price
                ? (float) $variant->price
                : (float) ($product->sale_price ?? $product->price));

        $imageUrl = null;
        if ($variant && $variant->image_path) {
            $imageUrl = FileHelper::url($variant->image_path, 'public');
        } elseif (! empty($product->images[0])) {
            $imageUrl = FileHelper::url($product->images[0], 'public');
        }

        $this->cartService->addItem([
            'product_id' => (int) $product->id,
            'product_title' => $product->title,
            'product_slug' => $product->slug,
            'variant_id' => $variant?->id,
            'sku' => $variant?->sku ?? $product->sku,
            'selected_options' => $validated['selected_options'] ?? null,
            'unit_price' => $unitPrice,
            'quantity' => (int) $validated['quantity'],
            'image_url' => $imageUrl,
            'order_type' => 'direct',
        ]);

        return redirect()->back()->with('success', 'Item added to bag.');
    }

    /**
     * Update an item in the cart.
     */
    public function update(UpdateCartItemRequest $request, string $key): RedirectResponse
    {
        $this->cartService->updateItem($key, (int) $request->validated('quantity'));

        return redirect()->back()->with('success', 'Cart updated.');
    }

    /**
     * Remove an item from the cart.
     */
    public function remove(string $key): RedirectResponse
    {
        $this->cartService->removeItem($key);

        return redirect()->back()->with('success', 'Item removed from bag.');
    }

    /**
     * Clear all items in the cart.
     */
    public function clear(): RedirectResponse
    {
        $this->cartService->clearCart();

        return redirect()->back()->with('success', 'Cart cleared.');
    }
}
