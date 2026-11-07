<?php

namespace Modules\User\Http\Requests\Settings;

use Illuminate\Validation\Rule;
use Modules\User\Models\Role;

class UpdateRoleRequest extends RoleDataRequest
{
    public function authorize(): bool
    {
        $role = $this->route('role');

        return $this->user()?->can('roles.update')
            && $role instanceof Role
            && ! $role->is_system;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Role $role */
        $role = $this->route('role');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique(config('permission.table_names.roles'), 'name')
                    ->where('guard_name', 'web')
                    ->ignore($role->getKey()),
            ],
            'permission_ids' => ['sometimes', 'array', 'max:500'],
            'permission_ids.*' => [
                'integer',
                'distinct',
                Rule::exists(config('permission.table_names.permissions'), 'id')
                    ->where('guard_name', 'web'),
            ],
        ];
    }
}
