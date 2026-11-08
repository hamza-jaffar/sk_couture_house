<?php

namespace Modules\Gallery\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GalleryIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('gallery.view') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', Rule::in(['all', 'image', 'document', 'video', 'other', 'deleted'])],
            'per_page' => ['nullable', Rule::in([24, 48, 96, '24', '48', '96'])],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
