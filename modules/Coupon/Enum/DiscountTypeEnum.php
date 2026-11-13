<?php

namespace Modules\Coupon\Enum;

enum DiscountTypeEnum: string
{
    case Percentage = 'percentage';
    case Fixed = 'fixed';

    /**
     * @return list<array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $case): array => [
                'value' => $case->value,
                'label' => $case->label(),
            ],
            self::cases(),
        );
    }

    public function label(): string
    {
        return match ($this) {
            self::Percentage => 'Percentage (%)',
            self::Fixed => 'Fixed Amount',
        };
    }
}
