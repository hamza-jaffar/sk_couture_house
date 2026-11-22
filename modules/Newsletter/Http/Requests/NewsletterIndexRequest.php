<?php

namespace Modules\Newsletter\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NewsletterIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('newsletter.view') ?? false;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', 'in:all,subscribed,unsubscribed'],
            'sort' => ['nullable', 'string', 'in:created_at,subscribed_at,email'],
            'direction' => ['nullable', 'string', 'in:asc,desc'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
