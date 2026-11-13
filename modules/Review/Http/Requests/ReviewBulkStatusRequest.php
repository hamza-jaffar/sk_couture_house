<?php

namespace Modules\Review\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Review\Enum\ReviewStatusEnum;

class ReviewBulkStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('reviews.approve') ?? false;
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
            'status' => ['required', Rule::enum(ReviewStatusEnum::class)],
        ];
    }

    /**
     * @return list<int>
     */
    public function reviewIds(): array
    {
        return array_map('intval', $this->validated('ids'));
    }

    public function reviewStatus(): string
    {
        return (string) $this->validated('status');
    }
}
