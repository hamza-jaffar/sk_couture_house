<?php

namespace Modules\Banner\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BannerIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('banners.view') ?? false;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', 'in:all,active,inactive,trash'],
            'media_type' => ['nullable', 'string', 'in:all,image,video'],
            'sort' => ['nullable', 'string', 'in:sort_order,created_at,title'],
            'direction' => ['nullable', 'string', 'in:asc,desc'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
