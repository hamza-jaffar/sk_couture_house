<?php

namespace Modules\Setting\Http\Requests;

use Closure;
use Illuminate\Foundation\Http\FormRequest;
use JsonException;
use Modules\Gallery\Models\Media;

class UpdatePlatformSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('settings.update') ?? false;
    }

    protected function prepareForValidation(): void
    {
        $group = $this->route('group');

        if ($group === 'mail') {
            $this->merge([
                'clear_password' => $this->boolean('clear_password'),
            ]);

            return;
        }

        if ($group !== 'variants') {
            return;
        }

        $variants = $this->input('variants');

        if (is_string($variants)) {
            try {
                $variants = json_decode($variants, true, flags: JSON_THROW_ON_ERROR);
            } catch (JsonException) {
                return;
            }
        }

        if (! is_array($variants)) {
            return;
        }

        $this->merge([
            'variants' => array_map(function (mixed $variant): mixed {
                if (! is_array($variant) || ! is_array($variant['values'] ?? null)) {
                    return $variant;
                }

                $values = [];

                foreach ($variant['values'] as $value) {
                    if (! is_string($value)) {
                        $values[] = $value;

                        continue;
                    }

                    foreach (explode(',', $value) as $part) {
                        $part = trim($part);

                        if ($part !== '') {
                            $values[] = $part;
                        }
                    }
                }

                $variant['values'] = array_values($values);

                return $variant;
            }, $variants),
        ]);
    }

    public function rules(): array
    {
        return match ($this->route('group')) {
            'general' => [
                'name' => ['required', 'string', 'max:120'],
                'tagline' => ['nullable', 'string', 'max:255'],
                'description' => ['nullable', 'string', 'max:1000'],
                'website_url' => ['nullable', 'url', 'max:2048'],
                'timezone' => ['required', 'timezone'],
                'currency' => ['required', 'regex:/^[A-Z]{3}$/'],
                'currency_icon' => ['required', 'string', 'max:12'],
                'logo_path' => ['nullable', 'string', 'max:1024', $this->galleryImagePath()],
                'favicon_path' => ['nullable', 'string', 'max:1024', $this->galleryImagePath()],
            ],
            'contact' => [
                'email' => ['nullable', 'email', 'max:255'],
                'phone' => ['nullable', 'string', 'max:40'],
                'alternate_phone' => ['nullable', 'string', 'max:40'],
                'address' => ['nullable', 'string', 'max:255'],
                'address_line_2' => ['nullable', 'string', 'max:255'],
                'city' => ['nullable', 'string', 'max:120'],
                'region' => ['nullable', 'string', 'max:120'],
                'postal_code' => ['nullable', 'string', 'max:30'],
                'country' => ['nullable', 'string', 'max:120'],
                'business_hours' => ['nullable', 'string', 'max:500'],
            ],
            'social' => [
                'facebook' => ['nullable', 'url', 'max:2048'],
                'instagram' => ['nullable', 'url', 'max:2048'],
                'tiktok' => ['nullable', 'url', 'max:2048'],
                'youtube' => ['nullable', 'url', 'max:2048'],
                'pinterest' => ['nullable', 'url', 'max:2048'],
                'linkedin' => ['nullable', 'url', 'max:2048'],
                'x' => ['nullable', 'url', 'max:2048'],
            ],
            'mail' => [
                'host' => ['required', 'string', 'max:255'],
                'port' => ['required', 'integer', 'min:1', 'max:65535'],
                'encryption' => ['required', 'in:tls,ssl,none'],
                'username' => ['nullable', 'string', 'max:255'],
                'password' => ['nullable', 'string', 'max:255'],
                'clear_password' => ['nullable', 'boolean'],
                'from_address' => ['required', 'email', 'max:255'],
                'from_name' => ['required', 'string', 'max:255'],
            ],
            'variants' => [
                'variants' => ['present', 'array', 'max:50'],
                'variants.*.id' => ['nullable', 'uuid'],
                'variants.*.name' => ['required', 'string', 'max:80', 'distinct:ignore_case'],
                'variants.*.values' => ['required', 'array', 'min:1', 'max:100'],
                'variants.*.values.*' => ['required', 'string', 'max:120', 'distinct:ignore_case'],
            ],
            'seo' => [
                'meta_title_template' => ['nullable', 'string', 'max:255'],
                'meta_description' => ['nullable', 'string', 'max:500'],
                'og_title' => ['nullable', 'string', 'max:255'],
                'og_description' => ['nullable', 'string', 'max:500'],
                'og_image_path' => ['nullable', 'string', 'max:1024', $this->galleryImagePath()],
                'canonical_url' => ['nullable', 'url', 'max:2048'],
                'robots' => ['nullable', 'string', 'max:100'],
                'google_analytics_id' => ['nullable', 'string', 'max:50'],
            ],
            default => [],
        };
    }

    private function galleryImagePath(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            if ($value === null || $value === '') {
                return;
            }

            if (
                is_string($value)
                && str_starts_with($value, 'settings/')
                && ! str_contains($value, '..')
                && ! str_contains($value, '\\')
            ) {
                return;
            }

            $isGalleryImage = is_string($value)
                && Media::query()
                    ->where('path', $value)
                    ->where('disk', 'public')
                    ->where('type', 'image')
                    ->whereNull('deleted_at')
                    ->exists();

            if (! $isGalleryImage) {
                $fail('Choose an active image from the gallery.');
            }
        };
    }
}
