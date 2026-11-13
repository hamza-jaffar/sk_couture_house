<?php

namespace Modules\Review\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReviewBulkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('reviews.delete') ?? false;
    }

    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1', 'max:100'],
            'ids.*' => [
                'required',
                'integer',
                'distinct',
                Rule::exists('product_reviews', 'id'),
            ],
        ];
    }

    /**
     * @return list<int>
     */
    public function reviewIds(): array
    {
        return array_map('intval', $this->validated('ids'));
    }
}
