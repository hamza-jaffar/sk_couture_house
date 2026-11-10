import { data as currencyData } from 'currency-codes';
import { useMemo } from 'react';
import SearchableSelect, {
    type SearchableOption,
} from '@/components/settings/searchable-select';
import { Label } from '@/components/ui/label';

type Props = {
    currency: string;
    currencyIcon: string;
    error?: string;
    onChange: (currency: string, currencyIcon: string) => void;
};

function getCurrencyIcon(currency: string): string {
    const currencyPart = new Intl.NumberFormat('en', {
        style: 'currency',
        currency,
        currencyDisplay: 'narrowSymbol',
    })
        .formatToParts(0)
        .find((part) => part.type === 'currency');

    if (!currencyPart) {
        throw new Error(`Unable to resolve the symbol for ${currency}.`);
    }

    return currencyPart.value;
}

export default function CurrencyField({
    currency,
    currencyIcon,
    error,
    onChange,
}: Props) {
    const options = useMemo<SearchableOption[]>(
        () =>
            currencyData
                .map((item) => ({
                    value: item.code,
                    label: `${item.code} — ${item.currency} (${getCurrencyIcon(item.code)})`,
                }))
                .sort((first, second) =>
                    first.value.localeCompare(second.value),
                ),
        [],
    );

    return (
        <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3">
                <Label htmlFor="store-currency">Currency</Label>
                <span
                    className="grid size-8 place-items-center rounded-md border bg-muted/40 text-sm font-semibold"
                    aria-label={`Currency symbol ${currencyIcon}`}
                >
                    {currencyIcon}
                </span>
            </div>
            <SearchableSelect
                id="store-currency"
                name="currency"
                label="Currency code"
                hideLabel
                value={currency}
                options={options}
                placeholder="Select a currency"
                searchPlaceholder="Search currency code or name..."
                error={error}
                onChange={(nextCurrency) =>
                    onChange(nextCurrency, getCurrencyIcon(nextCurrency))
                }
            />
            <input type="hidden" name="currency_icon" value={currencyIcon} />
        </div>
    );
}
