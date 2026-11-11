<?php

namespace Modules\Category\Enum;

enum OrderTypeEnum: string
{
    case DIRECT = 'direct';
    case WHATSAPP = 'whatsapp';

    public function label(): string
    {
        return match ($this) {
            self::DIRECT => 'Direct Checkout',
            self::WHATSAPP => 'Order via WhatsApp',
        };
    }

    public static function options(): array
    {
        return array_map(fn ($case) => [
            'value' => $case->value,
            'label' => $case->label(),
        ], self::cases());
    }
}
