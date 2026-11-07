<?php

namespace Modules\User\Http\Requests\Users;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\User\Models\User;

class BulkDeleteUsersRequest extends FormRequest
{
    public function authorize(): bool
    {
        $actor = $this->user();

        if (! $actor instanceof User || ! $actor->can('users.delete')) {
            return false;
        }

        $rawIds = $this->input('ids');

        if (! is_array($rawIds)) {
            return true;
        }

        $ids = collect($rawIds)
            ->filter(fn (mixed $id): bool => is_int($id) || (is_string($id) && ctype_digit($id)))
            ->map(fn (int|string $id): int => (int) $id)
            ->unique()
            ->values();

        if ($ids->contains($actor->id)) {
            return false;
        }

        if ($ids->isEmpty() || $actor->hasRole('admin', 'web')) {
            return true;
        }

        return ! User::query()
            ->whereKey($ids)
            ->whereHas('roles', fn (Builder $roles) => $roles
                ->where('name', 'admin')
                ->where('guard_name', 'web'))
            ->exists();
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
                Rule::exists(User::class, 'id'),
            ],
        ];
    }
}
