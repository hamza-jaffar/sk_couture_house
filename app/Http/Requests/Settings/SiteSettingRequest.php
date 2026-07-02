<?php

namespace App\Http\Requests\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SiteSettingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email:rfc,dns', 'max:255'],
            'phone_number' => ['required', 'string', 'min:7', 'max:20'],
            'north_cordinate' => ['required', 'numeric', 'between:-90,90'],
            'east_cordinate' => ['required', 'numeric', 'between:-180,180'],
            'instagram_link' => ['nullable', 'url', 'max:2048'],
            'facebook_link' => ['nullable', 'url', 'max:2048'],
            'youtube_link' => ['nullable', 'url', 'max:2048'],
            'tiktok_link' => ['nullable', 'url', 'max:2048'],
        ];
    }
}
