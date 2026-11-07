<?php

namespace Modules\User\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Modules\User\Models\Role;
use Modules\User\Models\User;

class UserService
{
    /**
     * @param  array{
     *     search?: string|null,
     *     role_id?: int|string|null,
     *     sort?: 'name'|'email'|'created_at',
     *     direction?: 'asc'|'desc',
     *     per_page?: int|string,
     *     page?: int|string
     * }  $filters
     * @return LengthAwarePaginator<int, User>
     */
    public function paginateUser(array $filters, bool $customers = false): LengthAwarePaginator
    {
        $query = User::query();

        if ($customers) {
            $query->role('customer');
        } else {
            $query->withoutRole('customer');
        }

        if (filled($filters['search'] ?? null)) {
            $search = trim($filters['search']);
            $query->where(function (Builder $users) use ($search): void {
                $users->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (filled($filters['role_id'] ?? null)) {
            $query->whereHas(
                'roles',
                fn (Builder $roles) => $roles->whereKey((int) $filters['role_id']),
            );
        }

        $sortColumns = [
            'name' => 'name',
            'email' => 'email',
            'created_at' => 'created_at',
        ];
        $sortColumn = $sortColumns[$filters['sort'] ?? 'name'];
        $direction = ($filters['direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';

        $users = $query
            ->select(['id', 'name', 'email', 'avatar', 'email_verified_at', 'created_at', 'updated_at'])
            ->with('roles:id,name,is_system')
            ->orderBy($sortColumn, $direction)
            ->orderBy('id')
            ->paginate(
                (int) ($filters['per_page'] ?? 10),
                ['*'],
                'page',
                (int) ($filters['page'] ?? 1),
            )
            ->withQueryString();

        return $users;
    }

    /**
     * @return list<array{id: int, name: string, is_system: bool}>
     */
    public function rolesForUserFilter(): array
    {
        return Role::query()
            ->where('guard_name', 'web')
            ->where('name', '!=', 'customer')
            ->orderBy('name')
            ->get(['id', 'name', 'is_system'])
            ->map(fn (Role $role): array => [
                'id' => (int) $role->id,
                'name' => $role->name,
                'is_system' => $role->is_system,
            ])
            ->all();
    }

    /**
     * @param  array{name: string, email: string, password: string, role_id: int|null}  $data
     */
    public function createUser(array $data, User $actor): User
    {
        return DB::transaction(function () use ($data, $actor): User {
            $role = $this->roleForAssignment($data['role_id'], $actor);

            $user = User::query()->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
            ]);
            $user->syncRoles($role === null ? [] : [$role]);

            return $user;
        });
    }

    /**
     * @param  array{role_id: int|null}  $data
     */
    public function updateUser(User $user, array $data, User $actor): User
    {
        return DB::transaction(function () use ($user, $data, $actor): User {
            $user = User::query()
                ->whereKey($user->getKey())
                ->with('roles')
                ->lockForUpdate()
                ->firstOrFail();

            if ($user->hasRole('admin', 'web') && ! $actor->hasRole('admin', 'web')) {
                abort(403);
            }

            if ($user->is($actor)) {
                abort(403);
            }

            $role = $this->roleForAssignment($data['role_id'], $actor);
            $user->syncRoles($role === null ? [] : [$role]);

            return $user;
        });
    }

    public function deleteUser(User $user, User $actor): void
    {
        $this->deleteUsers([$user->id], $actor);
    }

    /**
     * @param  list<int|string>  $userIds
     */
    public function deleteUsers(array $userIds, User $actor): void
    {
        $userIds = array_values(array_unique(array_map(
            static fn (int|string $id): int => (int) $id,
            $userIds,
        )));

        if ($userIds === []) {
            throw ValidationException::withMessages([
                'ids' => __('Select at least one user to delete.'),
            ]);
        }

        DB::transaction(function () use ($userIds, $actor): void {
            $users = User::query()
                ->with('roles')
                ->whereKey($userIds)
                ->lockForUpdate()
                ->get();

            if ($users->count() !== count($userIds)) {
                throw ValidationException::withMessages([
                    'ids' => __('One or more selected users no longer exist. Refresh and try again.'),
                ]);
            }

            if ($users->contains(fn (User $user): bool => $user->is($actor))) {
                throw ValidationException::withMessages([
                    'ids' => __('You cannot delete your own account.'),
                ]);
            }

            if (! $actor->hasRole('admin', 'web') && $users->contains(
                fn (User $user): bool => $user->hasRole('admin', 'web'),
            )) {
                throw ValidationException::withMessages([
                    'ids' => __('Only administrators can delete administrator accounts.'),
                ]);
            }

            $users->each(fn (User $user) => $user->delete());
        });
    }

    private function roleForAssignment(?int $roleId, User $actor): ?Role
    {
        if ($roleId === null) {
            return null;
        }

        $role = Role::query()
            ->where('guard_name', 'web')
            ->where('name', '!=', 'customer')
            ->whereKey($roleId)
            ->first();

        if ($role === null) {
            throw ValidationException::withMessages([
                'role_id' => __('The selected role is no longer available. Refresh and try again.'),
            ]);
        }

        if (! $actor->hasRole('admin', 'web') && $role->name === 'admin') {
            throw ValidationException::withMessages([
                'role_id' => __('Only administrators can assign the administrator role.'),
            ]);
        }

        return $role;
    }
}
