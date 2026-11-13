<?php

namespace Modules\Review\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReviewIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('reviews.view') ?? false;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', Rule::in(['all', 'pending', 'approved', 'rejected', 'deleted'])],
            'rating' => ['nullable', Rule::in(['all', 1, 2, 3, 4, 5, '1', '2', '3', '4', '5'])],
            'sort' => ['nullable', Rule::in(['created_at', 'rating', 'status', 'author_name'])],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', Rule::in([10, 20, 50, 100, '10', '20', '50', '100'])],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
