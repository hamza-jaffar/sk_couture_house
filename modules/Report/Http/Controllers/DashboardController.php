<?php

namespace Modules\Report\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Modules\Report\Services\DashboardMetricsService;

class DashboardController
{
    public function __construct(
        protected DashboardMetricsService $metricsService,
    ) {}

    /**
     * Display the main administrative dashboard.
     */
    public function index(): Response
    {
        return Inertia::render('dashboard/dashboard', [
            'metrics' => Inertia::defer(
                fn () => $this->metricsService->getKpiMetrics(),
                'dashboard-kpi',
            ),
            'revenueChart' => Inertia::defer(
                fn () => $this->metricsService->getRevenueChartData(30),
                'dashboard-chart',
            ),
            'orderDistribution' => Inertia::defer(
                fn () => $this->metricsService->getOrderStatusDistribution(),
                'dashboard-distribution',
            ),
            'recentOrders' => Inertia::defer(
                fn () => $this->metricsService->getRecentOrders(6),
                'dashboard-orders',
            ),
            'topProducts' => Inertia::defer(
                fn () => $this->metricsService->getTopProducts(5),
                'dashboard-top-products',
            ),
            'inventoryAlerts' => Inertia::defer(
                fn () => $this->metricsService->getLowStockAlerts(5, 5),
                'dashboard-inventory',
            ),
        ]);
    }
}
