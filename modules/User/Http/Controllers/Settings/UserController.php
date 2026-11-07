<?php

namespace Modules\User\Http\Controllers\Settings;

use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Modules\User\Http\Requests\Users\BulkDeleteUsersRequest;
use Modules\User\Http\Requests\Users\DeleteUserRequest;
use Modules\User\Http\Requests\Users\StoreUserRequest;
use Modules\User\Http\Requests\Users\UpdateUserRequest;
use Modules\User\Http\Requests\Users\UserIndexRequest;
use Modules\User\Models\User;
use Modules\User\Services\UserService;

class UserController
{
    public function __construct(private UserService $userService) {}

    public function index(UserIndexRequest $request): Response
    {
        $filters = $request->validated();
        $user = $request->user();

        return Inertia::render('settings/users', [
            'isAdmin' => $user instanceof User && $user->hasRole('admin', 'web'),
            'users' => Inertia::defer(
                fn () => $this->userService->paginateUser($filters),
                'user-list',
            ),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'role_id' => (string) ($filters['role_id'] ?? ''),
                'sort' => $filters['sort'] ?? 'name',
                'direction' => $filters['direction'] ?? 'asc',
                'page' => (int) ($filters['page'] ?? 1),
                'per_page' => (int) ($filters['per_page'] ?? 10),
            ],
            'roles' => Inertia::defer(
                fn () => $this->userService->rolesForUserFilter(),
                'user-roles',
            ),
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $actor = $request->user();
        abort_unless($actor instanceof User, 403);

        $this->userService->createUser($request->userData(), $actor);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('User created successfully.'),
        ]);

        return to_route('settings.users');
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $actor = $request->user();
        abort_unless($actor instanceof User, 403);

        $this->userService->updateUser($user, $request->userData(), $actor);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('User updated successfully.'),
        ]);

        return to_route('settings.users');
    }

    public function destroy(DeleteUserRequest $request, User $user): RedirectResponse
    {
        $actor = $request->user();
        abort_unless($actor instanceof User, 403);

        $this->userService->deleteUser($user, $actor);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('User deleted successfully.'),
        ]);

        return to_route('settings.users');
    }

    public function bulkDestroy(BulkDeleteUsersRequest $request): RedirectResponse
    {
        $actor = $request->user();
        abort_unless($actor instanceof User, 403);

        $this->userService->deleteUsers($request->validated()['ids'], $actor);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Selected users deleted successfully.'),
        ]);

        return to_route('settings.users');
    }
}
