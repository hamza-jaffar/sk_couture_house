<?php

namespace Modules\Product\Http\Controller;

use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Product\Http\Requests\ProductDataRequest;
use Modules\Product\Http\Requests\ProductIndexRequest;
use Modules\Product\Models\Product;
use Modules\Product\Services\ProductService;

class ProductController
{
    public function __construct(private ProductService $productService) {}

    public function index(ProductIndexRequest $request): Response
    {
        $filters = $request->validated();

        return Inertia::render('dashboard/product/index', [
            'products' => Inertia::defer(
                fn () => $this->productService->paginateProducts($filters),
                'product-list',
            ),
            'formOptions' => Inertia::defer(
                fn () => $this->productService->formOptions(),
                'product-options',
            ),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'category' => $filters['category'] ?? 'all',
                'type' => $filters['type'] ?? 'all',
                'status' => $filters['status'] ?? 'all',
                'sort' => $filters['sort'] ?? 'created_at',
                'direction' => $filters['direction'] ?? 'desc',
                'page' => (int) ($filters['page'] ?? 1),
                'per_page' => (int) ($filters['per_page'] ?? 10),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('dashboard/product/create', [
            'formOptions' => $this->productService->formOptions(),
        ]);
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('dashboard/product/edit', [
            'product' => $this->productService->productForForm($product),
            'formOptions' => $this->productService->formOptions(),
        ]);
    }

    public function store(ProductDataRequest $request): RedirectResponse
    {
        $this->productService->createProduct($request->productData());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Product created successfully.'),
        ]);

        return redirect()->route('dashboard.product.index');
    }

    public function update(ProductDataRequest $request, Product $product): RedirectResponse
    {
        $this->productService->updateProduct($product, $request->productData());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Product updated successfully.'),
        ]);

        return redirect()->route('dashboard.product.index');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $this->productService->deleteProduct($product);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Product moved to trash.'),
        ]);

        return back();
    }

    public function restore(Product $product): RedirectResponse
    {
        $this->productService->restoreProduct($product);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Product restored successfully.'),
        ]);

        return back();
    }

    public function forceDelete(Product $product): RedirectResponse
    {
        $this->productService->forceDeleteProduct($product);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Product permanently deleted.'),
        ]);

        return back();
    }
}
