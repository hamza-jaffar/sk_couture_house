<?php

namespace Modules\Order\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Modules\Order\Services\OrderService;
use Modules\Product\Models\Product;
use Symfony\Component\HttpFoundation\Response;

class WhatsAppController
{
    public function __construct(
        protected OrderService $orderService,
    ) {}

    /**
     * Redirect to WhatsApp for product ordering.
     */
    public function redirect(string $slug, Request $request): Response
    {
        /** @var Product $product */
        $product = Product::query()
            ->where('slug', $slug)
            ->where('status', 'published')
            ->firstOrFail();

        $selectedOptions = [];
        if ($request->filled('size')) {
            $selectedOptions['Size'] = (string) $request->query('size');
        }
        if ($request->filled('color')) {
            $selectedOptions['Color'] = (string) $request->query('color');
        }
        if ($request->isJson() && is_array($request->input('options'))) {
            $selectedOptions = array_merge($selectedOptions, $request->input('options'));
        }

        $quantity = max(1, min(99, (int) $request->query('quantity', $request->query('qty', 1))));

        $whatsappUrl = $this->orderService->generateWhatsAppUrl($product, $selectedOptions, $quantity);

        return Inertia::location($whatsappUrl);
    }
}
