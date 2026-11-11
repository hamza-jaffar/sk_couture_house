<?php

namespace Modules\Category\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Modules\Category\Enum\OrderTypeEnum;
use Modules\Category\Models\Category;

class CategoryDataRequest extends FormRequest
{
    public function authorize(): bool
    {
        $category = $this->route('category');

        if ($this->isMethod('post')) {
            return $this->user()?->can('collections.create') ?? false;
        }

        return $this->user()?->can('collections.update')
            && $category instanceof Category
            && ! $category->trashed();
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('categories', 'id')->whereNull('deleted_at'),
            ],
            'description' => ['nullable', 'string', 'max:5000'],
            'image_path' => [
                'nullable',
                'string',
                'max:255',
                Rule::exists('media', 'path')
                    ->where('disk', 'public')
                    ->where('type', 'image')
                    ->whereNull('deleted_at'),
            ],
            'banner_path' => [
                'nullable',
                'string',
                'max:255',
                Rule::exists('media', 'path')
                    ->where('disk', 'public')
                    ->where('type', 'image')
                    ->whereNull('deleted_at'),
            ],
            'is_active' => ['required', 'boolean'],
            'is_featured' => ['required', 'boolean'],
            'order_type' => ['nullable', Rule::enum(OrderTypeEnum::class)],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:1000'],
            'meta_keywords' => ['nullable', 'string', 'max:500'],
        ];
    }

    /**
     * @return array{
     *     parent_id: int|null,
     *     name: string,
     *     description: string|null,
     *     image_path: string|null,
     *     banner_path: string|null,
     *     is_active: bool,
     *     is_featured: bool,
     *     meta_title: string|null,
     *     meta_description: string|null,
     *     meta_keywords: string|null,
     *     order_type: string
     * }
     */
    public function categoryData(): array
    {
        $validated = $this->validated();

        return [
            'parent_id' => isset($validated['parent_id']) ? (int) $validated['parent_id'] : null,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'image_path' => $validated['image_path'] ?? null,
            'banner_path' => $validated['banner_path'] ?? null,
            'is_active' => (bool) $validated['is_active'],
            'is_featured' => (bool) $validated['is_featured'],
            'order_type' => $validated['order_type'] ?? OrderTypeEnum::DIRECT->value,
            'meta_title' => $validated['meta_title'] ?? null,
            'meta_description' => $validated['meta_description'] ?? null,
            'meta_keywords' => $validated['meta_keywords'] ?? null,
        ];
    }
}
