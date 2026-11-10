import { Combobox } from '@base-ui/react/combobox';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import { Check, ChevronDown, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

export type SearchableOption = {
    value: string;
    label: string;
};

type Props = {
    id: string;
    name: string;
    label: string;
    value: string;
    options: SearchableOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    hideLabel?: boolean;
    error?: string;
    onChange: (value: string) => void;
    onSearchChange?: (query: string) => void;
    onOpenChange?: (open: boolean) => void;
};

type ComboboxOption = SearchableOption & {
    isCustom?: boolean;
};

export default function SearchableSelect({
    id,
    name,
    label,
    value,
    options,
    placeholder = 'Select or add a value',
    searchPlaceholder = 'Search or type a custom value...',
    emptyMessage = 'No matching options.',
    hideLabel = false,
    error,
    onChange,
    onSearchChange,
    onOpenChange,
}: Props) {
    const [query, setQuery] = useState('');
    const items = useMemo(() => {
        const availableOptions: ComboboxOption[] = [...options];
        const hasCurrentValue = availableOptions.some(
            (option) => option.value.toLowerCase() === value.toLowerCase(),
        );

        if (value && !hasCurrentValue) {
            availableOptions.push({ value, label: value });
        }

        const normalizedQuery = query.trim();
        const hasMatchingValue = availableOptions.some(
            (option) =>
                option.value.toLowerCase() === normalizedQuery.toLowerCase(),
        );

        if (normalizedQuery && !hasMatchingValue) {
            availableOptions.push({
                value: normalizedQuery,
                label: normalizedQuery,
                isCustom: true,
            });
        }

        return Combobox.createItems(availableOptions, {
            getValue: (option) => option.value,
            getLabel: (option) => option.label,
        });
    }, [options, query, value]);
    const selectedOption = options.find(
        (option) => option.value.toLowerCase() === value.toLowerCase(),
    );

    return (
        <div className="grid gap-2 w-full">
            {!hideLabel ? <Label htmlFor={id}>{label}</Label> : null}
            <Combobox.Root
                items={items}
                value={value || null}
                autoHighlight

                onValueChange={(selectedValue) => {
                    if (selectedValue !== null) {
                        onChange(selectedValue);
                        setQuery('');
                        onSearchChange?.('');
                    }
                }}
                onInputValueChange={(inputValue) => {
                    setQuery(inputValue);
                    onSearchChange?.(inputValue);
                }}
                onOpenChange={(open) => {
                    if (!open) {
                        setQuery('');
                        onSearchChange?.('');
                    }

                    onOpenChange?.(open);
                }}
            >
                <input type="hidden" name={name} value={value} />
                <Combobox.Trigger
                    render={
                        <button
                            id={id}
                            type="button"
                            aria-label={label}
                            aria-invalid={Boolean(error)}
                            aria-describedby={error ? `${id}-error` : undefined}
                            className="flex h-9 w-full items-center justify-between gap-3 rounded-lg border border-input px-3 text-left text-sm transition-colors outline-none bg-accent/50 focus-visible:border-ring focus-visible:ring-3 cursor-pointer focus-visible:ring-ring/50 aria-invalid:border-destructive"
                        >
                            <span className="min-w-0 flex-1 truncate">
                                {selectedOption?.label ?? value ?? placeholder}
                            </span>
                            <ChevronDown
                                aria-hidden="true"
                                className="size-4 shrink-0 text-muted-foreground"
                            />
                        </button>
                    }
                />
                <Combobox.Portal>
                    <Combobox.Positioner
                        align="start"
                        sideOffset={4}
                        className="z-50 outline-none"
                    >
                        <Combobox.Popup
                            aria-label={`Select ${label.toLowerCase()}`}
                            className="w-(--anchor-width) min-w-64 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md"
                        >
                            <div className="relative border-b p-2">
                                <Search
                                    aria-hidden="true"
                                    className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
                                />
                                <Combobox.Input
                                    aria-label={`Search or add ${label.toLowerCase()}`}
                                    placeholder={searchPlaceholder}
                                    className="h-9 w-full rounded-md bg-transparent py-1 pr-2 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                />
                            </div>
                            <Combobox.Empty>
                                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                    {emptyMessage}
                                </p>
                            </Combobox.Empty>
                            <Combobox.List className="max-h-64 overflow-y-auto p-1">
                                {(option: ComboboxOption) => (
                                    <Combobox.Item
                                        key={option.value}
                                        value={option.value}
                                        className="flex cursor-default items-center gap-2 rounded-md px-2 py-2 text-sm outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                                    >
                                        <Combobox.ItemIndicator className="flex size-4 shrink-0 items-center justify-center">
                                            {option.isCustom ? (
                                                <Plus className="size-4" />
                                            ) : (
                                                <Check className="size-4" />
                                            )}
                                        </Combobox.ItemIndicator>
                                        <span className="min-w-0 flex-1 truncate">
                                            {option.isCustom
                                                ? `Add "${option.label}"`
                                                : option.label}
                                        </span>
                                    </Combobox.Item>
                                )}
                            </Combobox.List>
                        </Combobox.Popup>
                    </Combobox.Positioner>
                </Combobox.Portal>
            </Combobox.Root>
            {error ? <InputError id={`${id}-error`} message={error} /> : null}
        </div>
    );
}
