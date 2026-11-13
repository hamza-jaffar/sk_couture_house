<?php

namespace Modules\Product\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductBulkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('products.delete') ?? false;
    }

    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1', 'max:100'],
            'ids.*' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('products', 'id'),
            ],
        ];
    }

    /**
     * @return list<int>
     */
    public function productIds(): array
    {
        return array_map('intval', $this->validated('ids'));
    }
}
