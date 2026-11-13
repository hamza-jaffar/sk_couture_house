<?php

namespace Modules\Review\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewResponseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('reviews.approve') ?? false;
    }

    public function rules(): array
    {
        return [
            'response' => ['required', 'string', 'min:2', 'max:2000'],
        ];
    }

    public function reviewResponse(): string
    {
        return (string) $this->validated('response');
    }
}
