<?php

namespace Modules\User\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Modules\User\Http\Requests\CustomerIndexRequest;
use Modules\User\Services\UserService;

class CustomerController
{
    public function __construct(private UserService $userService) {}

    public function index(CustomerIndexRequest $request): Response
    {
        $filters = $request->validated();

        return Inertia::render('dashboard/customer', [
            'customers' => Inertia::defer(
                fn () => $this->userService->paginateUser($filters, customers: true),
                'customer-list',
            ),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'sort' => $filters['sort'] ?? 'name',
                'direction' => $filters['direction'] ?? 'asc',
                'page' => (int) ($filters['page'] ?? 1),
                'per_page' => (int) ($filters['per_page'] ?? 10),
            ],
        ]);
    }
}
