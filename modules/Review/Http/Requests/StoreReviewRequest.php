<?php

namespace Modules\Review\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['required', 'string', 'min:2', 'max:150'],
            'comment' => ['required', 'string', 'min:5', 'max:2000'],
            'author_name' => ['required', 'string', 'min:2', 'max:100'],
            'author_email' => ['required', 'email', 'max:150'],
        ];
    }
}
