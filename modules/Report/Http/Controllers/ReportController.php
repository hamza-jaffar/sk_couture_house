<?php

namespace Modules\Report\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Report\Services\ReportExportService;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController
{
    public function __construct(
        protected ReportExportService $exportService,
    ) {}

    /**
     * Display reports dashboard.
     */
    public function index(Request $request): Response
    {
        $filters = [
            'days' => (int) $request->input('days', 30),
            'status' => (string) $request->input('status', 'all'),
            'from' => $request->input('from'),
            'to' => $request->input('to'),
        ];

        return Inertia::render('dashboard/reports/index', [
            'filters' => $filters,
            'summary' => Inertia::defer(
                fn () => $this->exportService->getReportSummaries($filters),
                'report-summaries',
            ),
        ]);
    }

    /**
     * Export platform data as CSV.
     */
    public function export(Request $request, string $type): StreamedResponse
    {
        $filters = $request->only(['status', 'from', 'to', 'days']);

        return match ($type) {
            'orders' => $this->exportService->exportOrders($filters),
            'sales' => $this->exportService->exportSales($filters),
            'customers' => $this->exportService->exportCustomers($filters),
            'products' => $this->exportService->exportProducts($filters),
            'coupons' => $this->exportService->exportCoupons($filters),
            default => abort(404, "Unknown export type: {$type}"),
        };
    }
}
