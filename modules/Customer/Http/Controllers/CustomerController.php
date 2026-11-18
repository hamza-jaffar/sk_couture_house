<?php

namespace Modules\Customer\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Customer\Http\Requests\CustomerIndexRequest;
use Modules\Customer\Models\Customer;
use Modules\Customer\Services\CustomerManagementService;

class CustomerController
{
    public function __construct(
        protected CustomerManagementService $customerService,
    ) {}

    /**
     * Display a listing of customers for the dashboard.
     */
    public function index(CustomerIndexRequest $request): Response
    {
        $filters = $request->validated();

        return Inertia::render('dashboard/customers/index', [
            'customers' => Inertia::defer(
                fn () => $this->customerService->paginateCustomers($filters),
                'customer-list',
            ),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? 'all',
                'sort' => $filters['sort'] ?? 'created_at',
                'direction' => $filters['direction'] ?? 'desc',
                'per_page' => (int) ($filters['per_page'] ?? 15),
                'page' => (int) ($filters['page'] ?? 1),
            ],
        ]);
    }

    /**
     * Display the specified customer details.
     */
    public function show(Customer $customer): Response
    {
        $data = $this->customerService->getCustomerDetails($customer);

        return Inertia::render('dashboard/customers/show', [
            'customer' => $data['customer'],
            'orders' => $data['orders'],
        ]);
    }

    /**
     * Update customer active status.
     */
    public function updateStatus(Request $request, Customer $customer): RedirectResponse
    {
        $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $this->customerService->updateStatus($customer, (bool) $request->input('is_active'));

        $statusStr = $request->input('is_active') ? 'activated' : 'deactivated';

        return redirect()->back()->with('success', "Customer {$customer->name} has been {$statusStr}.");
    }
}
