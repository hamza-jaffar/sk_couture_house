<?php

namespace Modules\Category\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Category\Enum\OrderTypeEnum;
use Modules\Category\Http\Requests\CategoryBulkRequest;
use Modules\Category\Http\Requests\CategoryDataRequest;
use Modules\Category\Http\Requests\CategoryDeleteRequest;
use Modules\Category\Http\Requests\CategoryForceDeleteRequest;
use Modules\Category\Http\Requests\CategoryIndexRequest;
use Modules\Category\Http\Requests\CategoryRestoreRequest;
use Modules\Category\Models\Category;
use Modules\Category\Services\CategoryService;

class CategoryController
{
    public function __construct(private CategoryService $categoryService) {}

    public function index(CategoryIndexRequest $request): Response
    {
        $filters = $request->validated();

        return Inertia::render('dashboard/collection', [
            'categories' => Inertia::defer(
                fn () => $this->categoryService->paginateCategories($filters),
                'category-list',
            ),
            'parentOptions' => Inertia::defer(
                fn () => $this->categoryService->parentOptions(),
                'category-options',
            ),
            'orderTypeOptions' => OrderTypeEnum::options(),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'parent' => (string) ($filters['parent'] ?? '__all__'),
                'status' => $filters['status'] ?? 'active',
                'sort' => $filters['sort'] ?? 'name',
                'direction' => $filters['direction'] ?? 'asc',
                'page' => (int) ($filters['page'] ?? 1),
                'per_page' => (int) ($filters['per_page'] ?? 10),
            ],
        ]);
    }

    public function store(CategoryDataRequest $request): RedirectResponse
    {
        $this->categoryService->createCategory($request->categoryData());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Category created successfully.'),
        ]);

        return back();
    }

    public function update(CategoryDataRequest $request, Category $category): RedirectResponse
    {
        $this->categoryService->updateCategory($category, $request->categoryData());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Category updated successfully.'),
        ]);

        return back();
    }

    public function destroy(CategoryDeleteRequest $request, Category $category): RedirectResponse
    {
        $this->categoryService->deleteCategory($category);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Category moved to trash.'),
        ]);

        return back();
    }

    public function bulkDestroy(CategoryBulkRequest $request): RedirectResponse
    {
        $this->categoryService->deleteCategories($request->categoryIds());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Selected categories moved to trash.'),
        ]);

        return back();
    }

    public function restore(CategoryRestoreRequest $request, Category $category): RedirectResponse
    {
        $this->categoryService->restoreCategory($category);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Category restored successfully.'),
        ]);

        return back();
    }

    public function bulkRestore(CategoryBulkRequest $request): RedirectResponse
    {
        $this->categoryService->restoreCategories($request->categoryIds());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Selected categories restored successfully.'),
        ]);

        return back();
    }

    public function forceDelete(CategoryForceDeleteRequest $request, Category $category): RedirectResponse
    {
        $this->categoryService->forceDeleteCategory($category);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Category permanently deleted.'),
        ]);

        return back();
    }

    public function bulkForceDelete(CategoryBulkRequest $request): RedirectResponse
    {
        $this->categoryService->forceDeleteCategories($request->categoryIds());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Selected categories permanently deleted.'),
        ]);

        return back();
    }
}
