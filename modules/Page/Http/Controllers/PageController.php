<?php

namespace Modules\Page\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Page\Http\Requests\PageIndexRequest;
use Modules\Page\Http\Requests\StorePageRequest;
use Modules\Page\Http\Requests\UpdatePageRequest;
use Modules\Page\Models\Page;
use Modules\Page\Services\PageManagementService;

class PageController
{
    public function __construct(
        protected PageManagementService $pageService,
    ) {}

    /**
     * Display listing of pages for dashboard.
     */
    public function index(PageIndexRequest $request): Response
    {
        $filters = $request->validated();

        return Inertia::render('dashboard/pages/index', [
            'pages' => Inertia::defer(
                fn () => $this->pageService->paginatePages($filters),
                'page-list',
            ),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? 'all',
                'type' => $filters['type'] ?? 'all',
                'sort' => $filters['sort'] ?? 'created_at',
                'direction' => $filters['direction'] ?? 'desc',
                'per_page' => (int) ($filters['per_page'] ?? 15),
                'page' => (int) ($filters['page'] ?? 1),
            ],
        ]);
    }

    /**
     * Show the form to create a new page.
     */
    public function create(): Response
    {
        return Inertia::render('dashboard/pages/create');
    }

    /**
     * Store a newly created page.
     */
    public function store(StorePageRequest $request): RedirectResponse
    {
        $page = $this->pageService->create($request->validated());

        return redirect()->route('dashboard.pages.edit', $page)
            ->with('success', "Page \"{$page->title}\" created successfully.");
    }

    /**
     * Show the form to edit an existing page.
     */
    public function edit(Page $page): Response
    {
        return Inertia::render('dashboard/pages/edit', [
            'page' => $this->pageService->presentPage($page),
        ]);
    }

    /**
     * Update the specified page.
     */
    public function update(UpdatePageRequest $request, Page $page): RedirectResponse
    {
        $this->pageService->update($page, $request->validated());

        return redirect()->route('dashboard.pages.edit', $page)
            ->with('success', "Page \"{$page->title}\" updated successfully.");
    }

    /**
     * Delete a user-created page (system pages are protected).
     */
    public function destroy(Page $page): RedirectResponse
    {
        $this->pageService->delete($page);

        return redirect()->route('dashboard.pages.index')
            ->with('success', "Page \"{$page->title}\" deleted.");
    }
}
