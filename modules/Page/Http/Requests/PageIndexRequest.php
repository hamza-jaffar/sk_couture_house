<?php

namespace Modules\Page\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PageIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('pages.view') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:all,active,inactive'],
            'type' => ['nullable', 'string', 'in:all,system,custom'],
            'sort' => ['nullable', 'string', 'in:title,slug,created_at'],
            'direction' => ['nullable', 'string', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
