<?php

namespace Modules\User\Http\Requests\Settings;

use Illuminate\Validation\Rule;

class StoreRoleRequest extends RoleDataRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('roles.create') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique(config('permission.table_names.roles'), 'name')
                    ->where('guard_name', 'web'),
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
