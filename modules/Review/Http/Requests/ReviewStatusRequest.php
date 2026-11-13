<?php

namespace Modules\Review\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Review\Enum\ReviewStatusEnum;

class ReviewStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('reviews.approve') ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(ReviewStatusEnum::class)],
        ];
    }

    public function reviewStatus(): string
    {
        return (string) $this->validated('status');
    }
}
