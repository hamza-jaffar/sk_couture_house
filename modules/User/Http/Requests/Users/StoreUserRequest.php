<?php

namespace Modules\User\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\User\Models\User;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('users.create') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class, 'email'),
            ],
            'password' => ['required', 'string', 'min:12', 'max:72', 'confirmed'],
            'password_confirmation' => ['required', 'string', 'min:12', 'max:72'],
            'role_id' => [
                'nullable',
                'integer',
                Rule::exists(config('permission.table_names.roles'), 'id')
                    ->where('guard_name', 'web')
                    ->whereNot('name', 'customer'),
            ],
        ];
    }

    /**
     * @return array{name: string, email: string, password: string, role_id: int|null}
     */
    public function userData(): array
    {
        $validated = $this->validated();

        return [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role_id' => isset($validated['role_id']) ? (int) $validated['role_id'] : null,
        ];
    }
}
