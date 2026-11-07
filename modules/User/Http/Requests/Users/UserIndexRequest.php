<?php

namespace Modules\User\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('users.view') ?? false;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:120'],
            'role_id' => [
                'nullable',
                'integer',
                Rule::exists(config('permission.table_names.roles'), 'id')
                    ->where('guard_name', 'web'),
            ],
            'sort' => [
                'nullable',
                Rule::in(['name', 'email', 'created_at']),
            ],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', Rule::in([10, 20, 50, 100, '10', '20', '50', '100'])],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
