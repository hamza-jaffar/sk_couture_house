<?php

namespace Modules\Review\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Modules\Product\Models\Product;
use Modules\Review\Http\Requests\StoreReviewRequest;
use Modules\Review\Services\ReviewService;

class FrontendReviewController
{
    public function __construct(
        protected ReviewService $reviewService,
    ) {}

    /**
     * Submit a customer review for a product.
     */
    public function store(StoreReviewRequest $request, string $slug): RedirectResponse
    {
        $product = Product::query()->where('slug', $slug)->firstOrFail();

        $validated = $request->validated();
        $validated['product_id'] = $product->id;
        $validated['user_id'] = $request->user('web')?->id;
        $validated['customer_id'] = $request->user('customer')?->id;

        $this->reviewService->submitReview($validated);

        return redirect()->back()->with(
            'success',
            'Thank you! Your review has been submitted successfully.',
        );
    }
}
