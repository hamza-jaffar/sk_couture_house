<?php

namespace Modules\User\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoleIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('roles.view') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:120'],
            'is_system' => ['nullable', Rule::in(['all', '0', '1'])],
            'permission_id' => [
                'nullable',
                'integer',
                Rule::exists(config('permission.table_names.permissions'), 'id')
                    ->where('guard_name', 'web'),
            ],
            'sort' => [
                'nullable',
                Rule::in(['name', 'is_system', 'permissions_count', 'users_count', 'created_at']),
            ],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', Rule::in([10, 20, 50, 100, '10', '20', '50', '100'])],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
