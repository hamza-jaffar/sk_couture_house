<?php

namespace Modules\User\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use LogicException;

abstract class RoleDataRequest extends FormRequest
{
    /**
     * @return array{name: string, permission_ids: list<int>}
     */
    public function roleData(): array
    {
        $validated = $this->validated();
        $name = $validated['name'] ?? null;
        $permissionIds = $validated['permission_ids'] ?? [];

        if (! is_string($name) || ! is_array($permissionIds)) {
            throw new LogicException('Validated role data has an unexpected shape.');
        }

        $normalizedPermissionIds = [];

        foreach ($permissionIds as $permissionId) {
            if (! is_int($permissionId) && ! is_string($permissionId)) {
                throw new LogicException('Validated permission IDs must be integers.');
            }

            $integerId = filter_var($permissionId, FILTER_VALIDATE_INT);

            if ($integerId === false) {
                throw new LogicException('Validated permission IDs must be integers.');
            }

            $normalizedPermissionIds[] = $integerId;
        }

        return [
            'name' => $name,
            'permission_ids' => $normalizedPermissionIds,
        ];
    }
}
