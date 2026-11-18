<?php

namespace Modules\Page\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Page\Models\Page;

class UpdatePageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('pages.update') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Page|null $page */
        $page = $this->route('page');

        return [
            'title' => ['required', 'string', 'min:3', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('pages', 'slug')->ignore($page?->id),
            ],
            'content' => ['required', 'string', 'min:1'],
            'is_active' => ['boolean'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'meta_keywords' => ['nullable', 'string', 'max:500'],
            'canonical_url' => ['nullable', 'url', 'max:500'],
            'og_image' => ['nullable', 'string', 'max:500'],
        ];
    }
}
