<?php

namespace Modules\Newsletter\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Newsletter\Http\Requests\NewsletterBulkRequest;
use Modules\Newsletter\Http\Requests\NewsletterIndexRequest;
use Modules\Newsletter\Models\NewsletterSubscriber;
use Modules\Newsletter\Services\NewsletterService;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NewsletterController
{
    public function __construct(
        protected NewsletterService $newsletterService,
    ) {}

    /**
     * Display listing of newsletter subscribers.
     */
    public function index(NewsletterIndexRequest $request): Response
    {
        $filters = $request->validated();

        return Inertia::render('dashboard/subscribers', [
            'subscribers' => Inertia::defer(
                fn () => $this->newsletterService->paginateSubscribers($filters),
                'subscriber-list',
            ),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? 'all',
                'sort' => $filters['sort'] ?? 'created_at',
                'direction' => $filters['direction'] ?? 'desc',
                'page' => (int) ($filters['page'] ?? 1),
                'per_page' => (int) ($filters['per_page'] ?? 15),
            ],
        ]);
    }

    /**
     * Export subscribers as CSV download.
     */
    public function export(Request $request): StreamedResponse
    {
        $filters = [
            'status' => (string) $request->input('status', 'all'),
            'search' => $request->input('search'),
        ];

        return $this->newsletterService->exportCsv($filters);
    }

    /**
     * Toggle subscription status.
     */
    public function toggleStatus(NewsletterSubscriber $subscriber): RedirectResponse
    {
        $this->newsletterService->toggleStatus($subscriber);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Subscriber status updated successfully.',
        ]);

        return back()->with('success', 'Subscriber status updated.');
    }

    /**
     * Delete a subscriber.
     */
    public function destroy(NewsletterSubscriber $subscriber): RedirectResponse
    {
        $this->newsletterService->delete($subscriber);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Subscriber removed successfully.',
        ]);

        return back()->with('success', 'Subscriber removed.');
    }

    /**
     * Bulk delete subscribers.
     */
    public function bulkDestroy(NewsletterBulkRequest $request): RedirectResponse
    {
        $this->newsletterService->bulkDestroy($request->validated('ids'));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Selected subscribers removed successfully.',
        ]);

        return back()->with('success', 'Selected subscribers removed.');
    }
}
