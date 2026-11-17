<?php

namespace Modules\Order\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrderIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('orders.view') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'status' => ['nullable', 'string', 'max:50'],
            'payment_status' => ['nullable', 'string', 'max:50'],
            'type' => ['nullable', 'string', 'in:all,direct,whatsapp'],
            'search' => ['nullable', 'string', 'max:200'],
            'sort' => ['nullable', 'string', 'in:created_at,total,order_number'],
            'direction' => ['nullable', 'string', 'in:asc,desc'],
            'per_page' => ['nullable', 'integer', 'min:5', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
