import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProductVariant } from '@/types/settings';
import { ArrowDown, ArrowUp, Check, Pencil, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
    variants: ProductVariant[];
    onChange: (variants: ProductVariant[]) => void;
    error?: string;
    disabled?: boolean;
};

export default function VariantEditor({
    variants,
    onChange,
    error,
    disabled = false,
}: Props) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [valueInput, setValueInput] = useState('');
    const [values, setValues] = useState<string[]>([]);
    const [draftError, setDraftError] = useState('');

    useEffect(() => {
        setEditingIndex(null);
        setName('');
        setValueInput('');
        setValues([]);
        setDraftError('');
    }, [variants]);

    const isColorVariant = /colou?r/i.test(name);
    const colorInputValue = /^#[\da-f]{6}$/i.test(valueInput)
        ? valueInput
        : '#000000';

    function resetDraft() {
        setEditingIndex(null);
        setName('');
        setValueInput('');
        setValues([]);
        setDraftError('');
    }

    function addValues() {
        const newValues = valueInput
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean);

        if (newValues.length === 0) {
            setDraftError('Enter one or more values first.');
            return;
        }

        const uniqueValues = [...values];
        const knownValues = new Set(
            uniqueValues.map((value) => value.toLowerCase()),
        );

        for (const value of newValues) {
            const normalizedValue = value.toLowerCase();

            if (!knownValues.has(normalizedValue)) {
                uniqueValues.push(value);
                knownValues.add(normalizedValue);
            }
        }

        setValues(uniqueValues);
        setValueInput('');
        setDraftError('');
    }

    function saveVariant() {
        const normalizedName = name.trim();

        if (!normalizedName) {
            setDraftError('Enter a variant name.');
            return;
        }

        if (values.length === 0) {
            setDraftError('Add at least one variant value.');
            return;
        }

        const duplicateName = variants.some(
            (variant, index) =>
                index !== editingIndex &&
                variant.name.toLowerCase() === normalizedName.toLowerCase(),
        );

        if (duplicateName) {
            setDraftError('A variant with this name already exists.');
            return;
        }

        const nextVariant: ProductVariant = {
            ...(editingIndex !== null ? variants[editingIndex] : {}),
            name: normalizedName,
            values,
        };
        const nextVariants = [...variants];

        if (editingIndex === null) {
            nextVariants.push(nextVariant);
        } else {
            nextVariants[editingIndex] = nextVariant;
        }

        onChange(nextVariants);
        resetDraft();
    }

    function editVariant(index: number) {
        const variant = variants[index];

        setEditingIndex(index);
        setName(variant.name);
        setValues(variant.values);
        setValueInput('');
        setDraftError('');
    }

    function moveValue(index: number, direction: -1 | 1) {
        const targetIndex = index + direction;

        if (targetIndex < 0 || targetIndex >= values.length) {
            return;
        }

        setValues((currentValues) => {
            const reorderedValues = [...currentValues];
            [reorderedValues[index], reorderedValues[targetIndex]] = [
                reorderedValues[targetIndex],
                reorderedValues[index],
            ];

            return reorderedValues;
        });
    }

    return (
        <div className="grid gap-6">
            <input
                type="hidden"
                name="variants"
                value={JSON.stringify(variants)}
            />

            <section className="grid gap-3">
                <div>
                    <h3 className="font-medium">Product variants</h3>
                    <p className="text-sm text-muted-foreground">
                        Define options such as size, material, or color. Add
                        several values at once by separating them with commas.
                    </p>
                </div>

                {variants.length === 0 ? (
                    <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                        No variants have been added yet.
                    </p>
                ) : (
                    <ul className="grid gap-3">
                        {variants.map((variant, index) => (
                            <li
                                key={variant.id ?? `${variant.name}-${index}`}
                                className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                            >
                                <div className="grid gap-2">
                                    <h4 className="font-medium">
                                        {variant.name}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {variant.values.map((value) => (
                                            <span
                                                key={value}
                                                className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-1 text-xs"
                                            >
                                                {/colou?r/i.test(
                                                    variant.name,
                                                ) &&
                                                /^#[\da-f]{3}([\da-f]{3})?$/i.test(
                                                    value,
                                                ) ? (
                                                    <span
                                                        aria-hidden="true"
                                                        className="size-3 rounded-full border"
                                                        style={{
                                                            backgroundColor:
                                                                value,
                                                        }}
                                                    />
                                                ) : null}
                                                {value}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={disabled}
                                        onClick={() => editVariant(index)}
                                    >
                                        <Pencil aria-hidden="true" />
                                        Edit
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon-sm"
                                        disabled={disabled}
                                        aria-label={`Remove ${variant.name} variant`}
                                        onClick={() =>
                                            onChange(
                                                variants.filter(
                                                    (_, itemIndex) =>
                                                        itemIndex !== index,
                                                ),
                                            )
                                        }
                                    >
                                        <X aria-hidden="true" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="grid gap-4 rounded-lg border p-4">
                <h3 className="font-medium">
                    {editingIndex === null ? 'Add a variant' : 'Edit variant'}
                </h3>
                <div className="grid gap-2">
                    <Label htmlFor="variant-name">Variant name</Label>
                    <Input
                        id="variant-name"
                        value={name}
                        disabled={disabled}
                        placeholder="e.g. Size or Color"
                        onChange={(event) => {
                            setName(event.target.value);
                            setDraftError('');
                        }}
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="variant-value">Variant values</Label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Input
                            id="variant-value"
                            value={valueInput}
                            disabled={disabled}
                            placeholder={
                                isColorVariant
                                    ? 'Enter a color name or hex value'
                                    : 'Enter a value or comma-separated values'
                            }
                            onChange={(event) => {
                                setValueInput(event.target.value);
                                setDraftError('');
                            }}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    addValues();
                                }
                            }}
                        />
                        {isColorVariant ? (
                            <label className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-2 text-sm">
                                <span>Pick color</span>
                                <input
                                    aria-label="Pick a variant color"
                                    type="color"
                                    value={colorInputValue}
                                    disabled={disabled}
                                    className="size-5 cursor-pointer border-0 bg-transparent p-0"
                                    onChange={(event) =>
                                        setValueInput(event.target.value)
                                    }
                                />
                            </label>
                        ) : null}
                        <Button
                            type="button"
                            variant="outline"
                            disabled={disabled}
                            onClick={addValues}
                        >
                            <Plus aria-hidden="true" />
                            Add value
                        </Button>
                    </div>
                    {values.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {values.map((value, index) => (
                                <span
                                    key={value}
                                    className="inline-flex items-center gap-1 rounded-full border bg-muted/40 px-2.5 py-1 text-xs"
                                >
                                    {isColorVariant &&
                                    /^#[\da-f]{3}([\da-f]{3})?$/i.test(
                                        value,
                                    ) ? (
                                        <span
                                            aria-hidden="true"
                                            className="size-3 rounded-full border"
                                            style={{ backgroundColor: value }}
                                        />
                                    ) : null}
                                    {value}
                                    <button
                                        type="button"
                                        disabled={disabled || index === 0}
                                        aria-label={`Move ${value} up`}
                                        className="rounded-full p-1 text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                                        onClick={() => moveValue(index, -1)}
                                    >
                                        <ArrowUp
                                            aria-hidden="true"
                                            className="size-3"
                                        />
                                    </button>
                                    <button
                                        type="button"
                                        disabled={
                                            disabled ||
                                            index === values.length - 1
                                        }
                                        aria-label={`Move ${value} down`}
                                        className="rounded-full p-1 text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                                        onClick={() => moveValue(index, 1)}
                                    >
                                        <ArrowDown
                                            aria-hidden="true"
                                            className="size-3"
                                        />
                                    </button>
                                    <button
                                        type="button"
                                        disabled={disabled}
                                        aria-label={`Remove ${value}`}
                                        className="rounded-full p-1 text-muted-foreground hover:text-foreground disabled:cursor-not-allowed"
                                        onClick={() =>
                                            setValues((current) =>
                                                current.filter(
                                                    (item) => item !== value,
                                                ),
                                            )
                                        }
                                    >
                                        <X
                                            aria-hidden="true"
                                            className="size-3"
                                        />
                                    </button>
                                </span>
                            ))}
                        </div>
                    ) : null}
                </div>

                {draftError ? (
                    <p role="alert" className="text-sm text-destructive">
                        {draftError}
                    </p>
                ) : null}

                <div className="flex gap-2">
                    <Button
                        type="button"
                        disabled={disabled}
                        onClick={saveVariant}
                    >
                        <Check aria-hidden="true" />
                        {editingIndex === null
                            ? 'Save variant'
                            : 'Update variant'}
                    </Button>
                    {editingIndex !== null ? (
                        <Button
                            type="button"
                            variant="outline"
                            disabled={disabled}
                            onClick={resetDraft}
                        >
                            Cancel
                        </Button>
                    ) : null}
                </div>
            </section>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
    );
}
