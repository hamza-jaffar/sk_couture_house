<?php

namespace Modules\User\Services\Settings;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Modules\User\Models\Role;
use Modules\User\Models\User;
use Spatie\Permission\Models\Permission;

class RolePermissionService
{
    /**
     * @param  array{
     *     search?: string|null,
     *     is_system?: string,
     *     permission_id?: int|string|null,
     *     sort?: 'name'|'is_system'|'permissions_count'|'users_count'|'created_at',
     *     direction?: 'asc'|'desc',
     *     per_page?: int|string,
     *     page?: int|string
     * }  $filters
     * @return LengthAwarePaginator<int, Role>
     */
    public function paginateRoles(array $filters): LengthAwarePaginator
    {
        $roleAssignments = config('permission.table_names.model_has_roles');
        $roleColumn = config('permission.column_names.role_pivot_key') ?: 'role_id';
        $userModel = new User;
        $usersCount = DB::table($roleAssignments)
            ->selectRaw('COUNT(*)')
            ->whereColumn("{$roleAssignments}.{$roleColumn}", 'roles.id')
            ->where("{$roleAssignments}.model_type", $userModel->getMorphClass());

        $query = Role::query()
            ->where('guard_name', 'web')
            ->with(['permissions:id'])
            ->withCount('permissions')
            ->addSelect(['users_count' => $usersCount]);

        if (filled($filters['search'] ?? null)) {
            $query->where('name', 'like', '%'.trim($filters['search']).'%');
        }

        if (in_array($filters['is_system'] ?? 'all', ['0', '1'], true)) {
            $query->where('is_system', $filters['is_system'] === '1');
        }

        if (filled($filters['permission_id'] ?? null)) {
            $query->whereHas(
                'permissions',
                fn (Builder $permissions) => $permissions->whereKey((int) $filters['permission_id']),
            );
        }

        $sortColumns = [
            'name' => 'name',
            'is_system' => 'is_system',
            'permissions_count' => 'permissions_count',
            'users_count' => 'users_count',
            'created_at' => 'created_at',
        ];
        $sortColumn = $sortColumns[$filters['sort'] ?? 'name'];
        $direction = ($filters['direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';

        $roles = $query
            ->orderBy($sortColumn, $direction)
            ->orderBy('id')
            ->paginate(
                (int) ($filters['per_page'] ?? 10),
                ['*'],
                'page',
                (int) ($filters['page'] ?? 1),
            )
            ->withQueryString();

        return $roles->through(function (Role $role): Role {
            $role->setAttribute('permission_ids', $role->permissions->modelKeys());
            $role->unsetRelation('permissions');

            return $role;
        });
    }

    /**
     * @return list<array{id: int, name: string}>
     */
    public function permissionsForRoleEditor(): array
    {
        return array_values(Permission::query()
            ->where('guard_name', 'web')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Permission $permission): array => [
                'id' => (int) $permission->id,
                'name' => $permission->name,
            ])
            ->all());
    }

    /**
     * @param  array{name: string, permission_ids?: array<int, int>}  $data
     */
    public function createRole(array $data): Role
    {
        return DB::transaction(function () use ($data): Role {
            $role = Role::query()->create([
                'name' => $data['name'],
                'guard_name' => 'web',
                'is_system' => false,
            ]);

            $role->syncPermissions($this->permissionIds($data));

            return $role;
        });
    }

    /**
     * @param  array{name: string, permission_ids?: array<int, int>}  $data
     */
    public function updateRole(Role $role, array $data): Role
    {
        return DB::transaction(function () use ($role, $data): Role {
            $role = Role::query()
                ->where('guard_name', 'web')
                ->whereKey($role->getKey())
                ->lockForUpdate()
                ->firstOrFail();
            $this->ensureRoleIsEditable($role);

            $role->update(['name' => $data['name']]);
            $role->syncPermissions($this->permissionIds($data));

            return $role;
        });
    }

    public function deleteRole(Role $role): void
    {
        DB::transaction(function () use ($role): void {
            $role = Role::query()
                ->where('guard_name', 'web')
                ->whereKey($role->getKey())
                ->lockForUpdate()
                ->firstOrFail();
            $this->ensureRoleIsEditable($role);
            $role->delete();
        });
    }

    /**
     * @param  array<int, int>  $roleIds
     */
    public function deleteRoles(array $roleIds): void
    {
        DB::transaction(function () use ($roleIds): void {
            $roles = Role::query()
                ->whereKey($roleIds)
                ->lockForUpdate()
                ->get();

            if ($roles->count() !== count(array_unique($roleIds))) {
                throw ValidationException::withMessages([
                    'ids' => __('One or more selected roles no longer exist. Refresh and try again.'),
                ]);
            }

            if ($roles->contains(fn (Role $role): bool => $role->is_system)) {
                throw ValidationException::withMessages([
                    'ids' => __('System roles cannot be deleted. Remove them from the selection and try again.'),
                ]);
            }

            $roles->each(fn (Role $role) => $role->delete());
        });
    }

    /**
     * @param  array{name: string, permission_ids?: array<int, int>}  $data
     * @return array<int, int>
     */
    private function permissionIds(array $data): array
    {
        return Permission::query()
            ->where('guard_name', 'web')
            ->whereKey($data['permission_ids'] ?? [])
            ->pluck('id')
            ->map(fn (int|string $id): int => (int) $id)
            ->all();
    }

    private function ensureRoleIsEditable(Role $role): void
    {
        if ($role->is_system) {
            throw ValidationException::withMessages([
                'role' => __('System roles cannot be edited or deleted.'),
            ]);
        }
    }
}
