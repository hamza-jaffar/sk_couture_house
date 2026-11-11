<?php

namespace Modules\Product\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('products.view') ?? false;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:120'],
            'category' => [
                'nullable',
                'string',
                'max:255',
                Rule::exists('categories', 'slug'),
            ],
            'type' => ['nullable', Rule::in(['all', 'simple', 'variable'])],
            'status' => [
                'nullable',
                Rule::in(['all', 'draft', 'published', 'archived', 'deleted']),
            ],
            'sort' => [
                'nullable',
                Rule::in(['title', 'price', 'stock', 'status', 'created_at']),
            ],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', Rule::in([10, 20, 50, 100, '10', '20', '50', '100'])],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
