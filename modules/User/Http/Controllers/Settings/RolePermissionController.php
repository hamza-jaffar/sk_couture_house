<?php

namespace Modules\User\Http\Controllers\Settings;

use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Modules\User\Http\Requests\Settings\BulkDeleteRolesRequest;
use Modules\User\Http\Requests\Settings\DeleteRoleRequest;
use Modules\User\Http\Requests\Settings\RoleIndexRequest;
use Modules\User\Http\Requests\Settings\StoreRoleRequest;
use Modules\User\Http\Requests\Settings\UpdateRoleRequest;
use Modules\User\Models\Role;
use Modules\User\Services\Settings\RolePermissionService;

class RolePermissionController
{
    public function __construct(private RolePermissionService $rolePermissionService) {}

    public function index(RoleIndexRequest $request): Response
    {
        $filters = $request->validated();

        return Inertia::render('settings/roles', [
            'roles' => Inertia::defer(
                fn () => $this->rolePermissionService->paginateRoles($filters),
                'role-list',
            ),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'is_system' => $filters['is_system'] ?? 'all',
                'permission_id' => $filters['permission_id'] ?? '',
                'sort' => $filters['sort'] ?? 'name',
                'direction' => $filters['direction'] ?? 'asc',
                'page' => (int) ($filters['page'] ?? 1),
                'per_page' => (int) ($filters['per_page'] ?? 10),
            ],
            'permissions' => Inertia::defer(
                fn () => $this->rolePermissionService->permissionsForRoleEditor(),
                'role-permissions',
            ),
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $this->rolePermissionService->createRole($request->roleData());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Role created successfully.'),
        ]);

        return to_route('settings.roles');
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        $this->rolePermissionService->updateRole($role, $request->roleData());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Role updated successfully.'),
        ]);

        return to_route('settings.roles');
    }

    public function destroy(DeleteRoleRequest $request, Role $role): RedirectResponse
    {
        $this->rolePermissionService->deleteRole($role);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Role deleted successfully.'),
        ]);

        return to_route('settings.roles');
    }

    public function bulkDestroy(BulkDeleteRolesRequest $request): RedirectResponse
    {
        $this->rolePermissionService->deleteRoles($request->validated('ids'));

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Selected roles deleted successfully.'),
        ]);

        return to_route('settings.roles');
    }
}
