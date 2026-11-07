<?php

namespace Modules\User\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BulkDeleteRolesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('roles.delete') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1', 'max:100'],
            'ids.*' => [
                'required',
                'integer',
                'distinct',
                Rule::exists(config('permission.table_names.roles'), 'id')
                    ->where('guard_name', 'web'),
            ],
        ];
    }
}
