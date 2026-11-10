<?php

namespace Modules\Category\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('collections.view') ?? false;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:120'],
            'parent' => [
                'nullable',
                'string',
                'max:255',
                Rule::when(
                    ! in_array($this->input('parent'), [null, '', '__all__', '__root__'], true),
                    [Rule::exists('categories', 'slug')],
                ),
                Rule::when(
                    in_array($this->input('parent'), ['__all__', '__root__'], true),
                    [Rule::in(['__all__', '__root__'])],
                ),
            ],
            'status' => ['nullable', Rule::in(['active', 'deleted'])],
            'sort' => [
                'nullable',
                Rule::in(['name', 'is_active', 'is_featured', 'children_count', 'created_at']),
            ],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', Rule::in([10, 20, 50, 100, '10', '20', '50', '100'])],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
