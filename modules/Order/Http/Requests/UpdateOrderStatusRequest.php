<?php

namespace Modules\Order\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Modules\Order\Enum\OrderStatusEnum;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('orders.update') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:'.implode(',', OrderStatusEnum::values())],
        ];
    }
}
