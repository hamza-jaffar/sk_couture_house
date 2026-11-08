<?php

namespace Modules\Gallery\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ManageMediaRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'uuids' => ['required', 'array', 'min:1', 'max:100'],
            'uuids.*' => ['required', 'uuid', 'distinct', Rule::exists('media', 'uuid')],
        ];
    }

    /**
     * @return list<string>
     */
    public function mediaUuids(): array
    {
        /** @var list<string> $uuids */
        $uuids = array_values($this->validated('uuids'));

        return $uuids;
    }
}
