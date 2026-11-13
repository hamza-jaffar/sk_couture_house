import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Coupon, DiscountTypeOption } from '@/types';
import type { FormDataErrors } from '@inertiajs/core';
import { usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type Props = {
    coupon: Coupon | null;
    discountTypeOptions?: DiscountTypeOption[];
    errors: FormDataErrors<Record<string, unknown>>;
};

function formatDateForInput(isoString: string | null): string {
    if (!isoString) {
        return '';
    }
    // Takes ISO string and returns YYYY-MM-DDTHH:mm for datetime-local input
    return isoString.slice(0, 16);
}

export default function CouponForm({ coupon, discountTypeOptions = [], errors }: Props) {
    const page = usePage<{ discountTypeOptions?: DiscountTypeOption[] }>();

    const effectiveOptions = useMemo<DiscountTypeOption[]>(() => {
        if (discountTypeOptions && discountTypeOptions.length > 0) {
            return discountTypeOptions;
        }
        if (page.props.discountTypeOptions && page.props.discountTypeOptions.length > 0) {
            return page.props.discountTypeOptions;
        }
        return [];
    }, [discountTypeOptions, page.props.discountTypeOptions]);

    const [discountType, setDiscountType] = useState<string>(coupon?.discount_type ?? 'percentage');
    const isPercentage = discountType === 'percentage';

    return (
        <div className="space-y-5">
            {/* Code */}
            <div className="space-y-1.5">
                <Label htmlFor="coupon-code">
                    Coupon Code <span className="text-destructive">*</span>
                </Label>
                <Input
                    id="coupon-code"
                    name="code"
                    defaultValue={coupon?.code ?? ''}
                    placeholder="e.g. SUMMER20"
                    className="uppercase"
                    style={{ textTransform: 'uppercase' }}
                    maxLength={50}
                    autoFocus
                />
                <InputError message={errors.code} />
                <p className="text-xs text-muted-foreground">
                    Will be automatically uppercased.
                </p>
            </div>

            {/* Discount Type + Value */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="coupon-discount-type">
                        Discount Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                        name="discount_type"
                        value={discountType}
                        onValueChange={setDiscountType}
                        items={effectiveOptions}
                    >
                        <SelectTrigger id="coupon-discount-type" className="w-full">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            {effectiveOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.discount_type} />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="coupon-discount-value">
                        Discount Value <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            {isPercentage ? '%' : '$'}
                        </span>
                        <Input
                            id="coupon-discount-value"
                            name="discount_value"
                            type="number"
                            min="0.01"
                            max={isPercentage ? '100' : '9999999'}
                            step="0.01"
                            defaultValue={coupon?.discount_value ?? ''}
                            placeholder={isPercentage ? '20' : '10.00'}
                            className="pl-7"
                        />
                    </div>
                    <InputError message={errors.discount_value} />
                </div>
            </div>

            {/* Min Spend + Max Discount */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="coupon-min-spend">Minimum Spend</Label>
                    <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            $
                        </span>
                        <Input
                            id="coupon-min-spend"
                            name="min_spend"
                            type="number"
                            min="0"
                            step="0.01"
                            defaultValue={coupon?.min_spend ?? ''}
                            placeholder="0.00"
                            className="pl-7"
                        />
                    </div>
                    <InputError message={errors.min_spend} />
                    <p className="text-xs text-muted-foreground">
                        Minimum order amount to activate this coupon.
                    </p>
                </div>

                {isPercentage && (
                    <div className="space-y-1.5">
                        <Label htmlFor="coupon-max-discount">Max Discount Cap</Label>
                        <div className="relative">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                $
                            </span>
                            <Input
                                id="coupon-max-discount"
                                name="max_discount"
                                type="number"
                                min="0"
                                step="0.01"
                                defaultValue={coupon?.max_discount ?? ''}
                                placeholder="50.00"
                                className="pl-7"
                            />
                        </div>
                        <InputError message={errors.max_discount} />
                        <p className="text-xs text-muted-foreground">
                            Maximum discount amount for percentage coupons.
                        </p>
                    </div>
                )}
            </div>

            {/* Usage Limits */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="coupon-usage-limit">Total Usage Limit</Label>
                    <Input
                        id="coupon-usage-limit"
                        name="usage_limit"
                        type="number"
                        min="1"
                        step="1"
                        defaultValue={coupon?.usage_limit ?? ''}
                        placeholder="Unlimited"
                    />
                    <InputError message={errors.usage_limit} />
                    <p className="text-xs text-muted-foreground">
                        Max total times coupon can be used. Leave blank for unlimited.
                    </p>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="coupon-usage-per-user">Usage Limit Per User</Label>
                    <Input
                        id="coupon-usage-per-user"
                        name="usage_limit_per_user"
                        type="number"
                        min="1"
                        step="1"
                        defaultValue={coupon?.usage_limit_per_user ?? ''}
                        placeholder="Unlimited"
                    />
                    <InputError message={errors.usage_limit_per_user} />
                    <p className="text-xs text-muted-foreground">
                        Max uses per customer. Leave blank for unlimited.
                    </p>
                </div>
            </div>

            {/* Campaign Dates */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="coupon-starts-at">Start Date</Label>
                    <Input
                        id="coupon-starts-at"
                        name="starts_at"
                        type="datetime-local"
                        defaultValue={formatDateForInput(coupon?.starts_at ?? null)}
                    />
                    <InputError message={errors.starts_at} />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="coupon-expires-at">Expiry Date</Label>
                    <Input
                        id="coupon-expires-at"
                        name="expires_at"
                        type="datetime-local"
                        defaultValue={formatDateForInput(coupon?.expires_at ?? null)}
                    />
                    <InputError message={errors.expires_at} />
                </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
                <Label htmlFor="coupon-description">Internal Note</Label>
                <textarea
                    id="coupon-description"
                    name="description"
                    rows={3}
                    maxLength={1000}
                    defaultValue={coupon?.description ?? ''}
                    placeholder="Admin-only note about this coupon..."
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <InputError message={errors.description} />
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 rounded-lg border p-4">
                <Checkbox
                    id="coupon-is-active"
                    name="is_active"
                    value="1"
                    defaultChecked={coupon?.is_active ?? true}
                />
                <div className="space-y-0.5">
                    <Label htmlFor="coupon-is-active" className="cursor-pointer font-medium">
                        Active
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        Inactive coupons cannot be redeemed at checkout.
                    </p>
                </div>
            </div>

            <InputError message={errors.is_active} />
        </div>
    );
}
