<?php

namespace Modules\Gallery\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;

class UploadMediaRequest extends FormRequest
{
    private const int MAX_FILES = 10;

    private const int MAX_FILE_SIZE_KILOBYTES = 50 * 1024;

    public function authorize(): bool
    {
        return $this->user()?->can('gallery.upload') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'files' => ['required', 'array', 'min:1', 'max:'.self::MAX_FILES],
            'files.*' => ['required', 'file', 'max:'.self::MAX_FILE_SIZE_KILOBYTES],
        ];
    }

    /**
     * @return list<UploadedFile>
     */
    public function uploadedFiles(): array
    {
        /** @var list<UploadedFile> $files */
        $files = array_values($this->validated('files'));

        return $files;
    }
}
