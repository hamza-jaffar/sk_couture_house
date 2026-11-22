<?php

namespace Modules\Banner\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BannerBulkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('banners.delete') ?? false;
    }

    public function rules(): array
    {
        return [
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer'],
        ];
    }
}
