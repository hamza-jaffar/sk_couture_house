<?php

namespace Modules\Product\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;
use Modules\Product\Models\Product;

class ProductDataRequest extends FormRequest
{
    public function authorize(): bool
    {
        $product = $this->route('product');

        if ($this->isMethod('post')) {
            return $this->user()?->can('products.create') ?? false;
        }

        return $this->user()?->can('products.update')
            && $product instanceof Product
            && ! $product->trashed();
    }

    protected function prepareForValidation(): void
    {
        foreach (['images', 'variant_options', 'variants'] as $field) {
            $value = $this->input($field);

            if ($value === '') {
                $this->merge([$field => []]);

                continue;
            }

            if (! is_string($value)) {
                continue;
            }

            try {
                $this->merge([
                    $field => json_decode($value, true, flags: JSON_THROW_ON_ERROR),
                ]);
            } catch (\JsonException) {
                // Leave malformed JSON as a string so the array rule rejects it.
            }
        }
    }

    public function rules(): array
    {
        $product = $this->route('product');
        $productId = $product instanceof Product ? $product->getKey() : null;

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'short_description' => ['nullable', 'string', 'max:1000'],
            'description' => ['nullable', 'string', 'max:50000'],
            'price' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'sale_price' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'sale_start_at' => ['nullable', 'date'],
            'sale_end_at' => ['nullable', 'date', 'after_or_equal:sale_start_at'],
            'sku' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('products', 'sku')->ignore($productId),
            ],
            'stock' => ['required_if:type,simple', 'nullable', 'integer', 'min:0', 'max:4294967295'],
            'type' => ['required', Rule::in(['simple', 'variable'])],
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
            'is_featured' => ['required', 'boolean'],
            'category_id' => [
                'nullable',
                'integer',
                Rule::exists('categories', 'id')
                    ->where('is_active', true)
                    ->whereNull('deleted_at'),
            ],
            'images' => ['nullable', 'array', 'max:20'],
            'images.*' => [
                'required',
                'string',
                'max:255',
                Rule::exists('media', 'path')
                    ->where('disk', 'public')
                    ->where('type', 'image')
                    ->whereNull('deleted_at'),
            ],
            'variant_options' => ['required_if:type,variable', 'array', 'max:10'],
            'variant_options.*.name' => ['required', 'string', 'max:80', 'distinct:ignore_case'],
            'variant_options.*.values' => ['required', 'array', 'min:1', 'max:50'],
            'variant_options.*.values.*' => ['required', 'string', 'max:120', 'distinct:ignore_case'],
            'variants' => ['required_if:type,variable', 'array', 'max:100'],
            'variants.*.attributes' => ['required', 'array', 'min:1', 'max:10'],
            'variants.*.attributes.*' => ['required', 'string', 'max:120'],
            'variants.*.price' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'variants.*.sale_price' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'variants.*.stock' => ['required', 'integer', 'min:0', 'max:4294967295'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:160'],
            'meta_keywords' => ['nullable', 'string', 'max:255'],
            'canonical_url' => ['nullable', 'url', 'max:255'],
            'og_title' => ['nullable', 'string', 'max:255'],
            'og_description' => ['nullable', 'string', 'max:1000'],
            'og_image' => [
                'nullable',
                'string',
                'max:255',
                Rule::exists('media', 'path')
                    ->where('disk', 'public')
                    ->where('type', 'image')
                    ->whereNull('deleted_at'),
            ],
            'robots_meta' => [
                'required',
                Rule::in(['index, follow', 'noindex, nofollow', 'index, nofollow', 'noindex, follow']),
            ],
        ];
    }

    /**
     * @return array<int, \Closure(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $price = $this->input('price');
                $salePrice = $this->input('sale_price');

                if ($salePrice !== null && $salePrice !== '' && (float) $salePrice >= (float) $price) {
                    $validator->errors()->add('sale_price', __('Sale price must be lower than the regular price.'));
                }

                if ($this->input('type') !== 'variable') {
                    return;
                }

                $options = $this->input('variant_options', []);
                $variants = $this->input('variants', []);

                if (! is_array($options) || ! is_array($variants) || $options === []) {
                    $validator->errors()->add('variant_options', __('Add at least one product option with values.'));

                    return;
                }

                $combinationCount = 1;
                $optionNames = [];

                foreach ($options as $option) {
                    $values = is_array($option) ? ($option['values'] ?? []) : [];
                    $combinationCount *= is_array($values) ? count($values) : 0;
                    $optionNames[] = is_array($option) ? ($option['name'] ?? null) : null;

                    if ($combinationCount > 100) {
                        break;
                    }
                }

                if ($combinationCount > 100) {
                    $validator->errors()->add('variant_options', __('A product can have at most 100 variant combinations.'));

                    return;
                }

                if (count($variants) !== $combinationCount) {
                    $validator->errors()->add('variants', __('Variant inventory must match every option combination.'));

                    return;
                }

                $totalStock = 0;
                foreach ($variants as $index => $variant) {
                    $attributes = $variant['attributes'] ?? null;
                    $totalStock += (int) ($variant['stock'] ?? 0);

                    if (! is_array($attributes)) {
                        continue;
                    }

                    if (count($attributes) !== count($optionNames)) {
                        $validator->errors()->add(
                            "variants.{$index}.attributes",
                            __('Each variant must include one value for every option.'),
                        );

                        continue;
                    }

                    foreach ($options as $option) {
                        $name = $option['name'];
                        $values = $option['values'];
                        $value = $attributes[$name] ?? null;

                        if (! is_string($value) || ! in_array($value, $values, true)) {
                            $validator->errors()->add(
                                "variants.{$index}.attributes",
                                __('Each variant must use values from the configured options.'),
                            );

                            continue 2;
                        }
                    }

                    $variantPrice = $variant['price'] ?? $this->input('price');
                    $variantSalePrice = $variant['sale_price'] ?? null;

                    if (
                        $variantSalePrice !== null
                        && $variantSalePrice !== ''
                        && (float) $variantSalePrice >= (float) $variantPrice
                    ) {
                        $validator->errors()->add(
                            "variants.{$index}.sale_price",
                            __('Sale price must be lower than the regular price.'),
                        );
                    }
                }

                if ($totalStock > 4294967295) {
                    $validator->errors()->add(
                        'variants',
                        __('The combined variant stock cannot exceed the product stock limit.'),
                    );
                }
            },
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function productData(): array
    {
        $data = $this->validated();
        $data['images'] = array_values($data['images'] ?? []);
        $data['variant_options'] = $data['type'] === 'variable'
            ? array_values($data['variant_options'] ?? [])
            : [];
        $data['variants'] = $data['type'] === 'variable'
            ? array_values($data['variants'] ?? [])
            : [];
        $data['is_featured'] = (bool) $data['is_featured'];
        $data['category_id'] = isset($data['category_id']) ? (int) $data['category_id'] : null;
        $data['stock'] = (int) ($data['stock'] ?? 0);

        return $data;
    }
}
