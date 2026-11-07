<?php

namespace Modules\User\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\User\Models\User;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        $actor = $this->user();
        $user = $this->route('user');

        return $actor instanceof User
            && $actor->can('users.update')
            && $user instanceof User
            && ! $user->is($actor)
            && (! $user->hasRole('admin', 'web') || $actor->hasRole('admin', 'web'));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
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
     * @return array{role_id: int|null}
     */
    public function userData(): array
    {
        $validated = $this->validated();

        return [
            'role_id' => isset($validated['role_id']) ? (int) $validated['role_id'] : null,
        ];
    }
}
