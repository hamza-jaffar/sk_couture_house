<?php

namespace Modules\User\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;
use Modules\User\Models\User;

class DeleteUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        $actor = $this->user();
        $user = $this->route('user');

        return $actor instanceof User
            && $actor->can('users.delete')
            && $user instanceof User
            && ! $user->is($actor)
            && (! $user->hasRole('admin', 'web') || $actor->hasRole('admin', 'web'));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [];
    }
}
