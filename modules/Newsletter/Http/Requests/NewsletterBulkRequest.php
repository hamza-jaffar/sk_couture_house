<?php

namespace Modules\Newsletter\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NewsletterBulkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('newsletter.delete') ?? false;
    }

    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer'],
        ];
    }
}
