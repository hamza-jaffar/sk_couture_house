import {
    index,
    store,
    update,
} from "@/actions/Modules/Product/Http/Controller/ProductController";
import Gallery from "@/components/gallery";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import InputError from "@/components/ui/input-error";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
    GalleryMedia,
    ProductFormOptions,
    ProductImage,
    ProductRecord,
    ProductVariantOption,
} from "@/types";
import { Combobox } from "@base-ui/react/combobox";
import { Popover } from "@base-ui/react/popover";
import { router, useForm } from "@inertiajs/react";
import { format } from "date-fns";
import {
    ArrowDownAZ,
    ArrowUpDown,
    CalendarDays,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    GripVertical,
    ImagePlus,
    Plus,
    Search,
    Star,
    X,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import "jodit/es2021/jodit.min.css";
import "../../../css/jodit.css";
import { useAppearance } from "@/hooks/use-appearance";
import { toast } from "sonner";

type VariantInput = {
    attributes: Record<string, string>;
    price: string;
    sale_price: string;
    stock: string;
};

type ProductFormData = {
    title: string;
    slug: string;
    short_description: string;
    description: string;
    price: string;
    sale_price: string;
    sale_start_at: string;
    sale_end_at: string;
    sku: string;
    stock: string;
    type: "simple" | "variable";
    status: "draft" | "published" | "archived";
    is_featured: boolean;
    category_id: string;
    images: string[];
    variant_options: ProductVariantOption[];
    variants: VariantInput[];
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    canonical_url: string;
    og_title: string;
    og_description: string;
    og_image: string;
    robots_meta: string;
};

type Props = {
    product: ProductRecord | null;
    options: ProductFormOptions;
};

type SelectedImage = ProductImage & {
    name: string;
};

type JoditEditorComponent = typeof import("jodit-react").default;

const SIZE_ORDER = [
    "xxs",
    "2xs",
    "xs",
    "extra small",
    "s",
    "small",
    "m",
    "medium",
    "l",
    "large",
    "xl",
    "extra large",
    "2xl",
    "xxl",
    "3xl",
    "xxxl",
    "4xl",
    "xxxxl",
    "5xl",
    "6xl",
];

function sortValuesByStandardSize(vals: string[]): string[] {
    return [...vals].sort((a, b) => {
        const aClean = a.trim().toLowerCase();
        const bClean = b.trim().toLowerCase();
        const aIndex = SIZE_ORDER.indexOf(aClean);
        const bIndex = SIZE_ORDER.indexOf(bClean);

        if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
        }
        if (aIndex !== -1) {
            return -1;
        }
        if (bIndex !== -1) {
            return 1;
        }
        return a.localeCompare(b, undefined, {
            numeric: true,
            sensitivity: "base",
        });
    });
}

function combinations(
    options: ProductVariantOption[],
): Record<string, string>[] {
    if (
        options.length === 0 ||
        options.some((option) => option.values.length === 0) ||
        variantCombinationCount(options) > 100
    ) {
        return [];
    }

    return options.reduce<Record<string, string>[]>(
        (current, option) =>
            current.flatMap((combination) =>
                option.values.map((value) => ({
                    ...combination,
                    [option.name]: value,
                })),
            ),
        [{}],
    );
}

function variantCombinationCount(options: ProductVariantOption[]): number {
    if (options.length === 0) {
        return 0;
    }

    return options.reduce(
        (total, option) => Math.min(total * option.values.length, 101),
        1,
    );
}

function attributesKey(attributes: Record<string, string>): string {
    return JSON.stringify(
        Object.fromEntries(
            Object.entries(attributes).sort(([first], [second]) =>
                first.localeCompare(second),
            ),
        ),
    );
}

function initialFormData(product: ProductRecord | null): ProductFormData {
    return {
        title: product?.title ?? "",
        slug: product?.slug ?? "",
        short_description: product?.short_description ?? "",
        description: product?.description ?? "",
        price: product?.price ?? "",
        sale_price: product?.sale_price ?? "",
        sale_start_at: product?.sale_start_at?.slice(0, 10) ?? "",
        sale_end_at: product?.sale_end_at?.slice(0, 10) ?? "",
        sku: product?.sku ?? "",
        stock: String(product?.stock ?? 0),
        type: product?.type ?? "simple",
        status: product?.status ?? "draft",
        is_featured: product?.is_featured ?? false,
        category_id: product?.category_id ? String(product.category_id) : "",
        images: product?.images.map((image) => image.path) ?? [],
        variant_options: product?.variant_options ?? [],
        variants:
            product?.variants.map((variant) => ({
                attributes: variant.attributes,
                price: variant.price ?? "",
                sale_price: variant.sale_price ?? "",
                stock: String(variant.stock),
            })) ?? [],
        meta_title: product?.meta_title ?? "",
        meta_description: product?.meta_description ?? "",
        meta_keywords: product?.meta_keywords ?? "",
        canonical_url: product?.canonical_url ?? "",
        og_title: product?.og_title ?? "",
        og_description: product?.og_description ?? "",
        og_image: product?.og_image ?? "",
        robots_meta: product?.robots_meta ?? "index, follow",
    };
}

function DateRangePickerField({
    id,
    label,
    startValue,
    endValue,
    onChange,
}: {
    id: string;
    label: string;
    startValue: string;
    endValue: string;
    onChange: (start: string, end: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const startDate = startValue
        ? new Date(`${startValue}T12:00:00`)
        : undefined;
    const endDate = endValue ? new Date(`${endValue}T12:00:00`) : undefined;
    const selectedRange: DateRange | undefined = startDate
        ? { from: startDate, to: endDate }
        : undefined;
    const rangeLabel =
        startDate && endDate
            ? `${format(startDate, "MMM d, yyyy")} – ${format(endDate, "MMM d, yyyy")}`
            : startDate
              ? `${format(startDate, "MMM d, yyyy")} – Choose end date`
              : endDate
                ? `Ends ${format(endDate, "MMM d, yyyy")}`
                : "Choose sale period";

    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Popover.Root open={open} onOpenChange={setOpen}>
                <Popover.Trigger
                    render={
                        <Button
                            id={id}
                            type="button"
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                        />
                    }
                >
                    <CalendarDays className="text-muted-foreground" />
                    {rangeLabel}
                </Popover.Trigger>
                <Popover.Portal>
                    <Popover.Positioner
                        sideOffset={4}
                        align="start"
                        className="z-50 max-w-[calc(100vw-2rem)]"
                    >
                        <Popover.Popup className="max-w-[calc(100vw-2rem)] overflow-x-auto rounded-xl border bg-popover p-4 text-popover-foreground shadow-lg">
                            <DayPicker
                                mode="range"
                                numberOfMonths={2}
                                selected={selectedRange}
                                className="relative"
                                classNames={{
                                    months: "relative flex flex-col gap-6 sm:flex-row",
                                    month: "flex flex-col gap-3",
                                    month_caption:
                                        "relative flex h-8 items-center justify-center",
                                    caption_label:
                                        "text-sm font-semibold tracking-tight",
                                    nav: "absolute top-0 inset-x-0 flex h-8 items-center justify-between px-1 pointer-events-none z-10",
                                    button_previous: cn(
                                        buttonVariants({
                                            variant: "outline",
                                            size: "icon",
                                        }),
                                        "size-7 pointer-events-auto bg-background/80 hover:bg-accent",
                                    ),
                                    button_next: cn(
                                        buttonVariants({
                                            variant: "outline",
                                            size: "icon",
                                        }),
                                        "size-7 pointer-events-auto bg-background/80 hover:bg-accent",
                                    ),
                                    month_grid: "w-full border-collapse",
                                    weekdays: "flex justify-between",
                                    weekday:
                                        "w-9 text-center text-xs font-medium text-muted-foreground py-1",
                                    week: "mt-1 flex w-full justify-between",
                                    day: "relative h-9 w-9 p-0 text-center text-sm font-normal focus-within:relative focus-within:z-20 first:rounded-l-md last:rounded-r-md",
                                    day_button: cn(
                                        buttonVariants({
                                            variant: "ghost",
                                            size: "icon",
                                        }),
                                        "size-9 p-0 font-normal hover:bg-accent hover:text-accent-foreground aria-selected:opacity-100",
                                    ),
                                    selected:
                                        "bg-primary text-primary-foreground [&>button]:text-primary-foreground",
                                    today: "font-semibold underline underline-offset-4 text-primary",
                                    outside:
                                        "text-muted-foreground/40 aria-selected:opacity-30",
                                    disabled:
                                        "text-muted-foreground/30 pointer-events-none",
                                    range_start:
                                        "rounded-l-md bg-primary text-primary-foreground font-semibold [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary",
                                    range_middle:
                                        "bg-primary/15 text-foreground font-medium [&>button]:hover:bg-primary/25",
                                    range_end:
                                        "rounded-r-md bg-primary text-primary-foreground font-semibold [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary",
                                    hidden: "invisible",
                                }}
                                onSelect={(range) => {
                                    onChange(
                                        range?.from
                                            ? format(range.from, "yyyy-MM-dd")
                                            : "",
                                        range?.to
                                            ? format(range.to, "yyyy-MM-dd")
                                            : "",
                                    );

                                    if (range?.from && range.to) {
                                        setOpen(false);
                                    }
                                }}
                            />
                            {(startValue || endValue) && (
                                <div className="mt-3 flex items-center justify-between border-t pt-2">
                                    <span className="text-xs text-muted-foreground">
                                        {rangeLabel}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() => {
                                            onChange("", "");
                                            setOpen(false);
                                        }}
                                    >
                                        Clear dates
                                    </Button>
                                </div>
                            )}
                        </Popover.Popup>
                    </Popover.Positioner>
                </Popover.Portal>
            </Popover.Root>
        </div>
    );
}

function OptionValuesEditor({
    values,
    onChange,
    error,
}: {
    values: string[];
    onChange: (values: string[]) => void;
    error?: string;
}) {
    const [draft, setDraft] = useState("");
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    function addValues(value: string) {
        const additions = value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

        if (additions.length > 0) {
            const existing = new Set(
                values.map((item) => item.toLocaleLowerCase()),
            );
            onChange([
                ...values,
                ...additions.filter(
                    (item) => !existing.has(item.toLocaleLowerCase()),
                ),
            ]);
        }

        setDraft("");
    }

    function moveValue(fromIndex: number, toIndex: number) {
        if (toIndex < 0 || toIndex >= values.length) {
            return;
        }
        const next = [...values];
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        onChange(next);
    }

    function sortAlphabetically() {
        const sorted = [...values].sort((a, b) =>
            a.localeCompare(b, undefined, {
                numeric: true,
                sensitivity: "base",
            }),
        );
        onChange(sorted);
    }

    function sortSizes() {
        onChange(sortValuesByStandardSize(values));
    }

    const hasSizeValues = useMemo(() => {
        return values.some((val) =>
            SIZE_ORDER.includes(val.trim().toLowerCase()),
        );
    }, [values]);

    return (
        <div className="grid gap-2">
            {values.length > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-muted-foreground">
                    <span>Drag badges or use arrows to reorder values</span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={sortAlphabetically}
                            className="inline-flex items-center gap-1 font-medium hover:text-foreground underline underline-offset-2"
                            title="Sort alphabetically (A to Z)"
                        >
                            <ArrowDownAZ className="size-3" />
                            Sort A–Z
                        </button>
                        {hasSizeValues && (
                            <button
                                type="button"
                                onClick={sortSizes}
                                className="inline-flex items-center gap-1 font-medium hover:text-foreground underline underline-offset-2"
                                title="Sort by standard sizes (XS to XL)"
                            >
                                <ArrowUpDown className="size-3" />
                                Sort sizes
                            </button>
                        )}
                    </div>
                </div>
            )}
            <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border p-2">
                {values.map((value, index) => (
                    <span
                        key={value}
                        draggable
                        onDragStart={() => setDraggedIndex(index)}
                        onDragOver={(event) => {
                            event.preventDefault();
                            event.dataTransfer.dropEffect = "move";
                        }}
                        onDrop={() => {
                            if (
                                draggedIndex !== null &&
                                draggedIndex !== index
                            ) {
                                moveValue(draggedIndex, index);
                            }
                            setDraggedIndex(null);
                        }}
                        onDragEnd={() => setDraggedIndex(null)}
                        className={cn(
                            "group inline-flex items-center gap-1 rounded-full bg-secondary py-1 pl-2 pr-1.5 text-xs transition-colors cursor-grab active:cursor-grabbing select-none",
                            draggedIndex === index &&
                                "opacity-40 border border-dashed border-primary",
                        )}
                        title="Drag to reorder"
                    >
                        <GripVertical className="size-3 text-muted-foreground/50 group-hover:text-foreground" />
                        <span className="font-medium">{value}</span>
                        <div className="ml-0.5 flex items-center gap-0.5">
                            {index > 0 && (
                                <button
                                    type="button"
                                    aria-label={`Move ${value} left`}
                                    title="Move left"
                                    className="text-muted-foreground opacity-60 hover:opacity-100 hover:text-foreground"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        moveValue(index, index - 1);
                                    }}
                                >
                                    <ChevronLeft className="size-3" />
                                </button>
                            )}
                            {index < values.length - 1 && (
                                <button
                                    type="button"
                                    aria-label={`Move ${value} right`}
                                    title="Move right"
                                    className="text-muted-foreground opacity-60 hover:opacity-100 hover:text-foreground"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        moveValue(index, index + 1);
                                    }}
                                >
                                    <ChevronRight className="size-3" />
                                </button>
                            )}
                            <button
                                type="button"
                                aria-label={`Remove ${value}`}
                                className="ml-0.5 text-muted-foreground hover:text-destructive"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onChange(
                                        values.filter(
                                            (item) => item !== value,
                                        ),
                                    );
                                }}
                            >
                                <X className="size-3" />
                            </button>
                        </div>
                    </span>
                ))}
                <Input
                    value={draft}
                    onChange={(event) => {
                        const nextValue = event.currentTarget.value;
                        if (nextValue.includes(",")) {
                            const parts = nextValue.split(",");
                            addValues(parts.slice(0, -1).join(","));
                            setDraft(parts.at(-1) ?? "");
                        } else {
                            setDraft(nextValue);
                        }
                    }}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            addValues(draft);
                        }
                    }}
                    onBlur={() => addValues(draft)}
                    placeholder="Type a value and press Enter"
                    className="h-7 min-w-40 flex-1 border-0 px-1 shadow-none focus-visible:ring-0"
                    aria-label="Add option values"
                />
            </div>
            {error && <InputError message={error} />}
            <FieldDescription>
                Enter one value at a time, or paste comma-separated values.
            </FieldDescription>
        </div>
    );
}

export default function ProductForm({ product, options }: Props) {
    const form = useForm<ProductFormData>(initialFormData(product));
    const [galleryTarget, setGalleryTarget] = useState<
        "images" | "og-image" | null
    >(null);
    const [selectedImages, setSelectedImages] = useState<SelectedImage[]>(
        product?.images.map((image) => ({
            ...image,
            name: image.path.split("/").pop() ?? image.path,
        })) ?? [],
    );
    const [ogImage, setOgImage] = useState<SelectedImage | null>(
        product?.og_image
            ? {
                  path: product.og_image,
                  url: product.og_image_url,
                  name: product.og_image.split("/").pop() ?? product.og_image,
              }
            : null,
    );
    const { resolvedAppearance } = useAppearance();
    const [Editor, setEditor] = useState<JoditEditorComponent | null>(null);
    const [editorError, setEditorError] = useState<string | null>(null);

    const editorConfig = useMemo(
        () => ({
            readonly: false,
            height: 320,
            toolbarSticky: false,
            theme: resolvedAppearance === "dark" ? "dark" : "default",
        }),
        [resolvedAppearance],
    );

    const categoryOptions = useMemo(
        () => [
            { value: "none", label: "No collection" },
            ...options.categories.map((category) => ({
                value: String(category.id),
                label: category.name,
            })),
        ],
        [options.categories],
    );

    const categoryComboboxItems = useMemo(
        () =>
            Combobox.createItems(categoryOptions, {
                getValue: (option) => option.value,
                getLabel: (option) => option.label,
            }),
        [categoryOptions],
    );

    const selectedCategory = categoryOptions.find(
        (option) => option.value === (form.data.category_id || "none"),
    );

    useEffect(() => {
        let isMounted = true;

        import("jodit-react")
            .then((module) => {
                if (isMounted) {
                    setEditor(() => module.default);
                }
            })
            .catch((error: unknown) => {
                console.error(
                    "Unable to load the product description editor.",
                    error,
                );
                if (isMounted) {
                    setEditorError(
                        "The description editor could not be loaded.",
                    );
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const productCombinations = useMemo(
        () => combinations(form.data.variant_options),
        [form.data.variant_options],
    );
    const isVariantLimitExceeded =
        variantCombinationCount(form.data.variant_options) > 100;

    function updateOptions(variantOptions: ProductVariantOption[]) {
        const existingVariants = new Map(
            form.data.variants.map((variant) => [
                attributesKey(variant.attributes),
                variant,
            ]),
        );
        const nextCombinations = combinations(variantOptions);

        form.setData((current) => ({
            ...current,
            variant_options: variantOptions,
            variants:
                nextCombinations.length <= 100
                    ? nextCombinations.map(
                          (attributes) =>
                              existingVariants.get(
                                  attributesKey(attributes),
                              ) ?? {
                                  attributes,
                                  price: "",
                                  sale_price: "",
                                  stock: "0",
                              },
                      )
                    : [],
        }));
    }

    function updateVariant(
        index: number,
        field: keyof Omit<VariantInput, "attributes">,
        value: string,
    ) {
        form.setData(
            "variants",
            form.data.variants.map((variant, variantIndex) =>
                variantIndex === index
                    ? { ...variant, [field]: value }
                    : variant,
            ),
        );
    }

    function selectImages(media: GalleryMedia[]) {
        const validMedia = media.filter(
            (item): item is GalleryMedia & { path: string } =>
                typeof item.path === "string" && item.path.length > 0,
        );

        if (validMedia.length !== media.length) {
            toast.error(
                "One or more selected gallery files have no available path.",
            );
        }

        const nextImages = [
            ...selectedImages,
            ...validMedia.map((item) => ({
                path: item.path,
                url: item.url,
                name: item.original_file_name,
            })),
        ].filter(
            (image, index, list) =>
                list.findIndex((candidate) => candidate.path === image.path) ===
                index,
        );

        if (nextImages.length > 20) {
            toast.error("A product can have at most 20 images.");
        }

        const limitedImages = nextImages.slice(0, 20);
        setSelectedImages(limitedImages);
        form.setData(
            "images",
            limitedImages.map((image) => image.path),
        );
        setGalleryTarget(null);
    }

    function selectOgImage(media: GalleryMedia) {
        if (!media.path) {
            toast.error("The selected gallery file has no available path.");

            return;
        }

        const selected = {
            path: media.path,
            url: media.url,
            name: media.original_file_name,
        };
        setOgImage(selected);
        form.setData("og_image", selected.path);
        setGalleryTarget(null);
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const options = {
            preserveScroll: true,
        };

        if (product) {
            form.patch(update.url(product.slug), options);

            return;
        }

        form.post(store.url(), options);
    }

    return (
        <>
            <form onSubmit={submit} className="flex flex-col gap-6">
                <section className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="product-title">Product name</Label>
                        <Input
                            id="product-title"
                            value={form.data.title}
                            onChange={(event) =>
                                form.setData("title", event.currentTarget.value)
                            }
                            required
                            maxLength={255}
                            aria-invalid={Boolean(form.errors.title)}
                        />
                        <FieldDescription>
                            The name shown to shoppers and used as the default
                            slug.
                        </FieldDescription>
                        {form.errors.title && (
                            <InputError message={form.errors.title} />
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="product-slug">URL slug</Label>
                        <Input
                            id="product-slug"
                            value={form.data.slug}
                            onChange={(event) =>
                                form.setData("slug", event.currentTarget.value)
                            }
                            maxLength={255}
                        />
                        <FieldDescription>
                            Leave blank to generate a unique slug from the
                            product name.
                        </FieldDescription>
                        {form.errors.slug && (
                            <InputError message={form.errors.slug} />
                        )}
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                        <Label htmlFor="product-short-description">
                            Short description
                        </Label>
                        <textarea
                            id="product-short-description"
                            value={form.data.short_description}
                            onChange={(event) =>
                                form.setData(
                                    "short_description",
                                    event.currentTarget.value,
                                )
                            }
                            maxLength={1000}
                            rows={3}
                            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        />
                        <FieldDescription>
                            A concise summary used in product cards and search
                            results.
                        </FieldDescription>
                        {form.errors.short_description && (
                            <InputError
                                message={form.errors.short_description}
                            />
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="product-category">Collection</Label>
                        <Combobox.Root
                            items={categoryComboboxItems}
                            value={form.data.category_id || "none"}
                            onValueChange={(value) => {
                                if (value !== null) {
                                    form.setData(
                                        "category_id",
                                        value === "none" ? "" : value,
                                    );
                                }
                            }}
                        >
                            <input
                                type="hidden"
                                name="category_id"
                                value={form.data.category_id}
                            />
                            <Combobox.Trigger
                                render={
                                    <button
                                        id="product-category"
                                        type="button"
                                        aria-label="Choose a collection"
                                        aria-invalid={Boolean(
                                            form.errors.category_id,
                                        )}
                                        className="flex h-9 w-full items-center justify-between gap-3 rounded-lg border border-input bg-background px-3 text-left text-sm transition-colors outline-none hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive dark:bg-input/30"
                                    >
                                        <span className="truncate">
                                            {selectedCategory?.label ??
                                                "Choose a collection"}
                                        </span>
                                        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
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
                                        aria-label="Select collection"
                                        className="w-(--anchor-width) min-w-64 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md"
                                    >
                                        <div className="relative border-b p-2">
                                            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                                            <Combobox.Input
                                                aria-label="Search collections"
                                                placeholder="Search collections..."
                                                className="h-9 w-full rounded-md bg-transparent py-1 pr-2 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                            />
                                        </div>
                                        <Combobox.Empty>
                                            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                                No matching collections found.
                                            </p>
                                        </Combobox.Empty>
                                        <Combobox.List className="max-h-64 overflow-y-auto p-1">
                                            {(
                                                option: (typeof categoryOptions)[number],
                                            ) => (
                                                <Combobox.Item
                                                    key={option.value}
                                                    value={option.value}
                                                    className="flex cursor-default items-center gap-2 rounded-md px-2 py-2 text-sm outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                                                >
                                                    <Combobox.ItemIndicator className="flex size-4 shrink-0 items-center justify-center">
                                                        <Check className="size-4" />
                                                    </Combobox.ItemIndicator>
                                                    <span className="min-w-0 flex-1 truncate">
                                                        {option.label}
                                                    </span>
                                                </Combobox.Item>
                                            )}
                                        </Combobox.List>
                                    </Combobox.Popup>
                                </Combobox.Positioner>
                            </Combobox.Portal>
                        </Combobox.Root>
                        <FieldDescription>
                            Organize the product under an active collection.
                        </FieldDescription>
                        {form.errors.category_id && (
                            <InputError message={form.errors.category_id} />
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="product-type">Product type</Label>
                        <Select
                            value={form.data.type}
                            onValueChange={(value) => {
                                if (
                                    value === "simple" ||
                                    value === "variable"
                                ) {
                                    form.setData("type", value);
                                }
                            }}
                        >
                            <SelectTrigger id="product-type" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="simple">
                                    Simple product
                                </SelectItem>
                                <SelectItem value="variable">
                                    Product with variants
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <FieldDescription>
                            Variable products track price and stock for each
                            option combination.
                        </FieldDescription>
                    </div>
                </section>

                <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
                    <h3 className="font-semibold sm:col-span-2">
                        Pricing and inventory
                    </h3>
                    <div className="grid gap-2">
                        <Label htmlFor="product-price">Regular price</Label>
                        <Input
                            id="product-price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.data.price}
                            onChange={(event) =>
                                form.setData("price", event.currentTarget.value)
                            }
                            required
                        />
                        <FieldDescription>
                            Entered in {options.currency} (
                            {options.currency_icon}). Default price is also used
                            when a variant has no override.
                        </FieldDescription>
                        {form.errors.price && (
                            <InputError message={form.errors.price} />
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="product-sale-price">Sale price</Label>
                        <Input
                            id="product-sale-price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.data.sale_price}
                            onChange={(event) =>
                                form.setData(
                                    "sale_price",
                                    event.currentTarget.value,
                                )
                            }
                        />
                        <FieldDescription>
                            Must be lower than the regular price.
                        </FieldDescription>
                        {form.errors.sale_price && (
                            <InputError message={form.errors.sale_price} />
                        )}
                    </div>
                    <div className="grid gap-2 sm:col-span-2">
                        <DateRangePickerField
                            id="product-sale-period"
                            label="Sale period"
                            startValue={form.data.sale_start_at}
                            endValue={form.data.sale_end_at}
                            onChange={(start, end) =>
                                form.setData((current) => ({
                                    ...current,
                                    sale_start_at: start,
                                    sale_end_at: end,
                                }))
                            }
                        />
                        {form.errors.sale_start_at && (
                            <InputError message={form.errors.sale_start_at} />
                        )}
                        {form.errors.sale_end_at && (
                            <InputError message={form.errors.sale_end_at} />
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="product-sku">SKU</Label>
                        <Input
                            id="product-sku"
                            value={form.data.sku}
                            onChange={(event) =>
                                form.setData("sku", event.currentTarget.value)
                            }
                            maxLength={255}
                        />
                        {form.errors.sku && (
                            <InputError message={form.errors.sku} />
                        )}
                    </div>
                    {form.data.type === "simple" && (
                        <div className="grid gap-2">
                            <Label htmlFor="product-stock">
                                Stock quantity
                            </Label>
                            <Input
                                id="product-stock"
                                type="number"
                                min="0"
                                step="1"
                                value={form.data.stock}
                                onChange={(event) =>
                                    form.setData(
                                        "stock",
                                        event.currentTarget.value,
                                    )
                                }
                                required
                            />
                            {form.errors.stock && (
                                <InputError message={form.errors.stock} />
                            )}
                        </div>
                    )}
                </section>

                <section className="grid gap-4 rounded-xl border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="font-semibold">Product variants</h3>
                            <FieldDescription>
                                Combine saved setting presets with custom
                                options.
                            </FieldDescription>
                        </div>
                        <Select
                            value={null}
                            onValueChange={(value) => {
                                const preset = options.variant_presets.find(
                                    (item) => item.id === value,
                                );

                                if (preset) {
                                    const matchingIndex =
                                        form.data.variant_options.findIndex(
                                            (option) =>
                                                option.name.toLocaleLowerCase() ===
                                                preset.name.toLocaleLowerCase(),
                                        );
                                    const variantOptions = [
                                        ...form.data.variant_options,
                                    ];

                                    if (matchingIndex >= 0) {
                                        variantOptions[matchingIndex] = {
                                            name: preset.name,
                                            values: preset.values,
                                        };
                                    } else {
                                        variantOptions.push({
                                            name: preset.name,
                                            values: preset.values,
                                        });
                                    }

                                    updateOptions(variantOptions);
                                }
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-56">
                                <SelectValue placeholder="Add saved option" />
                            </SelectTrigger>
                            <SelectContent>
                                {options.variant_presets.map((preset) => (
                                    <SelectItem
                                        key={preset.id}
                                        value={preset.id}
                                    >
                                        {preset.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {form.data.variant_options.map((option, index) => (
                        <div
                            key={index}
                            className="grid gap-3 rounded-lg bg-muted/40 p-3"
                        >
                            <div className="flex items-center gap-2">
                                <div className="grid flex-1 gap-2">
                                    <Label htmlFor={`variant-option-${index}`}>
                                        Option name
                                    </Label>
                                    <Input
                                        id={`variant-option-${index}`}
                                        value={option.name}
                                        onChange={(event) => {
                                            const variantOptions = [
                                                ...form.data.variant_options,
                                            ];
                                            variantOptions[index] = {
                                                ...option,
                                                name: event.currentTarget.value,
                                            };
                                            updateOptions(variantOptions);
                                        }}
                                        maxLength={80}
                                    />
                                </div>
                                <div className="flex items-center gap-1 self-end pb-0.5">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        disabled={index === 0}
                                        aria-label={`Move option ${option.name || index + 1} up`}
                                        title="Move option up"
                                        onClick={() => {
                                            const next = [
                                                ...form.data.variant_options,
                                            ];
                                            [next[index - 1], next[index]] = [
                                                next[index],
                                                next[index - 1],
                                            ];
                                            updateOptions(next);
                                        }}
                                    >
                                        <ChevronUp className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        disabled={
                                            index ===
                                            form.data.variant_options.length - 1
                                        }
                                        aria-label={`Move option ${option.name || index + 1} down`}
                                        title="Move option down"
                                        onClick={() => {
                                            const next = [
                                                ...form.data.variant_options,
                                            ];
                                            [next[index + 1], next[index]] = [
                                                next[index],
                                                next[index + 1],
                                            ];
                                            updateOptions(next);
                                        }}
                                    >
                                        <ChevronDown className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Remove ${option.name || "variant option"}`}
                                        title="Remove option"
                                        onClick={() =>
                                            updateOptions(
                                                form.data.variant_options.filter(
                                                    (_, optionIndex) =>
                                                        optionIndex !== index,
                                                ),
                                            )
                                        }
                                    >
                                        <X className="size-4" />
                                    </Button>
                                </div>
                            </div>
                            <OptionValuesEditor
                                values={option.values}
                                onChange={(values) => {
                                    const variantOptions = [
                                        ...form.data.variant_options,
                                    ];
                                    variantOptions[index] = {
                                        ...option,
                                        values,
                                    };
                                    updateOptions(variantOptions);
                                }}
                                error={
                                    form.errors[
                                        `variant_options.${index}.values`
                                    ]
                                }
                            />
                        </div>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        className="w-fit"
                        disabled={form.data.variant_options.length >= 10}
                        onClick={() =>
                            updateOptions([
                                ...form.data.variant_options,
                                {
                                    name: `Option ${form.data.variant_options.length + 1}`,
                                    values: [],
                                },
                            ])
                        }
                    >
                        <Plus />
                        Add custom option
                    </Button>
                    {form.errors.variant_options && (
                        <InputError message={form.errors.variant_options} />
                    )}

                    {form.data.type === "variable" && (
                        <div className="grid gap-3">
                            <div>
                                <h4 className="text-sm font-medium">
                                    Variant inventory
                                </h4>
                                <FieldDescription>
                                    {productCombinations.length} combinations
                                    generated.
                                </FieldDescription>
                            </div>
                            {isVariantLimitExceeded ? (
                                <p className="text-sm text-destructive">
                                    A product can have at most 100 variant
                                    combinations.
                                </p>
                            ) : (
                                productCombinations.map((attributes, index) => {
                                    const variant = form.data.variants[index];

                                    if (!variant) {
                                        return null;
                                    }

                                    return (
                                        <div
                                            key={attributesKey(attributes)}
                                            className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[minmax(0,1.3fr)_1fr_1fr_1fr]"
                                        >
                                            <p className="self-center text-sm font-medium">
                                                {Object.values(attributes).join(
                                                    " / ",
                                                )}
                                            </p>
                                            <Input
                                                aria-label={`${Object.values(attributes).join(" ")} price`}
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="Price override"
                                                value={variant.price}
                                                onChange={(event) =>
                                                    updateVariant(
                                                        index,
                                                        "price",
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                            />
                                            <Input
                                                aria-label={`${Object.values(attributes).join(" ")} sale price`}
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="Sale price"
                                                value={variant.sale_price}
                                                onChange={(event) =>
                                                    updateVariant(
                                                        index,
                                                        "sale_price",
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                            />
                                            <Input
                                                aria-label={`${Object.values(attributes).join(" ")} stock`}
                                                type="number"
                                                min="0"
                                                step="1"
                                                placeholder="Stock"
                                                value={variant.stock}
                                                onChange={(event) =>
                                                    updateVariant(
                                                        index,
                                                        "stock",
                                                        event.currentTarget
                                                            .value,
                                                    )
                                                }
                                            />
                                            {form.errors[
                                                `variants.${index}.sale_price`
                                            ] && (
                                                <InputError
                                                    message={
                                                        form.errors[
                                                            `variants.${index}.sale_price`
                                                        ]
                                                    }
                                                />
                                            )}
                                        </div>
                                    );
                                })
                            )}
                            {form.errors.variants && (
                                <InputError message={form.errors.variants} />
                            )}
                        </div>
                    )}
                </section>

                <section className="grid gap-3 rounded-xl border p-4">
                    <div>
                        <h3 className="font-semibold">Product images</h3>
                        <FieldDescription>
                            Select images from the shared gallery. Only gallery
                            paths are saved. The first image is the primary
                            product image; use the star to change it.
                        </FieldDescription>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {selectedImages.map((image, index) => (
                            <div
                                key={image.path}
                                className="relative size-24 overflow-hidden rounded-lg border bg-muted"
                            >
                                {image.url && (
                                    <img
                                        src={image.url}
                                        alt={image.name}
                                        className="size-full object-cover"
                                    />
                                )}
                                <button
                                    type="button"
                                    aria-label={`Remove ${image.name}`}
                                    className="absolute top-1 right-1 rounded-full bg-background/90 p-1"
                                    onClick={() => {
                                        const nextImages =
                                            selectedImages.filter(
                                                (item) =>
                                                    item.path !== image.path,
                                            );
                                        setSelectedImages(nextImages);
                                        form.setData(
                                            "images",
                                            nextImages.map((item) => item.path),
                                        );
                                    }}
                                >
                                    <X className="size-3" />
                                </button>
                                {index === 0 ? (
                                    <span className="absolute bottom-1 left-1 rounded bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                                        Primary
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        aria-label={`Set ${image.name} as primary image`}
                                        title="Set as primary image"
                                        className="absolute top-1 left-1 rounded-full bg-background/90 p-1 text-muted-foreground hover:text-foreground"
                                        onClick={() => {
                                            const nextImages = [
                                                image,
                                                ...selectedImages.filter(
                                                    (item) =>
                                                        item.path !==
                                                        image.path,
                                                ),
                                            ];
                                            setSelectedImages(nextImages);
                                            form.setData(
                                                "images",
                                                nextImages.map(
                                                    (item) => item.path,
                                                ),
                                            );
                                        }}
                                    >
                                        <Star className="size-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            className="size-24 flex-col"
                            onClick={() => setGalleryTarget("images")}
                        >
                            <ImagePlus />
                            Choose images
                        </Button>
                    </div>
                    {form.errors.images && (
                        <InputError message={form.errors.images} />
                    )}
                </section>

                <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
                    <h3 className="font-semibold sm:col-span-2">
                        Description and publishing
                    </h3>
                    <div className="grid gap-2 sm:col-span-2">
                        <Label htmlFor="product-description">Description</Label>
                        {Editor ? (
                            <Editor
                                id="product-description"
                                value={form.data.description}
                                onChange={(value) =>
                                    form.setData("description", value)
                                }
                                config={editorConfig}
                            />
                        ) : (
                            <div className="grid gap-2">
                                <textarea
                                    id="product-description"
                                    value={form.data.description}
                                    onChange={(event) =>
                                        form.setData(
                                            "description",
                                            event.currentTarget.value,
                                        )
                                    }
                                    rows={8}
                                    className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                                />
                                {editorError && (
                                    <p
                                        role="alert"
                                        className="text-sm text-destructive"
                                    >
                                        {editorError}
                                    </p>
                                )}
                            </div>
                        )}
                        <FieldDescription>
                            Rich product information displayed on the product
                            detail page.
                        </FieldDescription>
                        {form.errors.description && (
                            <InputError message={form.errors.description} />
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="product-status">Status</Label>
                        <Select
                            value={form.data.status}
                            onValueChange={(value) => {
                                if (
                                    value === "draft" ||
                                    value === "published" ||
                                    value === "archived"
                                ) {
                                    form.setData("status", value);
                                }
                            }}
                        >
                            <SelectTrigger
                                id="product-status"
                                className="w-full"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">
                                    Published
                                </SelectItem>
                                <SelectItem value="archived">
                                    Archived
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <label className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                        <Checkbox
                            checked={form.data.is_featured}
                            onCheckedChange={(checked) =>
                                form.setData("is_featured", checked === true)
                            }
                        />
                        Feature this product
                    </label>
                </section>

                <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
                    <h3 className="font-semibold sm:col-span-2">
                        Search and social metadata
                    </h3>
                    {(
                        [
                            [
                                "meta_title",
                                "Meta title",
                                "Shown in search results.",
                            ],
                            [
                                "meta_description",
                                "Meta description",
                                "A concise search preview, up to 160 characters.",
                            ],
                            [
                                "meta_keywords",
                                "Meta keywords",
                                "Comma-separated search terms.",
                            ],
                            [
                                "canonical_url",
                                "Canonical URL",
                                "Optional absolute URL.",
                            ],
                            [
                                "og_title",
                                "Social title",
                                "Title shown in social previews.",
                            ],
                            [
                                "og_description",
                                "Social description",
                                "Description shown in social previews.",
                            ],
                        ] as const
                    ).map(([name, label, description]) => (
                        <div key={name} className="grid gap-2">
                            <Label htmlFor={`product-${name}`}>{label}</Label>
                            <Input
                                id={`product-${name}`}
                                value={form.data[name]}
                                onChange={(event) =>
                                    form.setData(
                                        name,
                                        event.currentTarget.value,
                                    )
                                }
                            />
                            <FieldDescription>{description}</FieldDescription>
                            {form.errors[name] && (
                                <InputError message={form.errors[name]} />
                            )}
                        </div>
                    ))}
                    <div className="grid gap-2">
                        <Label>Social preview image</Label>
                        <div className="flex flex-wrap items-center gap-3">
                            {ogImage?.url && (
                                <img
                                    src={ogImage.url}
                                    alt={ogImage.name}
                                    className="size-16 rounded-lg border object-cover"
                                />
                            )}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setGalleryTarget("og-image")}
                            >
                                <ImagePlus />
                                {ogImage
                                    ? "Change image"
                                    : "Choose from gallery"}
                            </Button>
                            {ogImage && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setOgImage(null);
                                        form.setData("og_image", "");
                                    }}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                        <FieldDescription>
                            Choose a social preview image from the gallery.
                        </FieldDescription>
                        {form.errors.og_image && (
                            <InputError message={form.errors.og_image} />
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="product-robots">Robots directive</Label>
                        <Select
                            value={form.data.robots_meta}
                            onValueChange={(value) =>
                                value && form.setData("robots_meta", value)
                            }
                        >
                            <SelectTrigger
                                id="product-robots"
                                className="w-full"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="index, follow">
                                    Index, follow
                                </SelectItem>
                                <SelectItem value="noindex, nofollow">
                                    No index, no follow
                                </SelectItem>
                                <SelectItem value="index, nofollow">
                                    Index, no follow
                                </SelectItem>
                                <SelectItem value="noindex, follow">
                                    No index, follow
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </section>

                {galleryTarget === "images" && (
                    <Gallery
                        mode="dialog"
                        selectionMode="multiple"
                        open
                        onOpenChange={(open) => {
                            if (!open) {
                                setGalleryTarget(null);
                            }
                        }}
                        onSelect={selectImages}
                        initialCategory="image"
                        allowedCategories={["image"]}
                    />
                )}
                {galleryTarget === "og-image" && (
                    <Gallery
                        mode="dialog"
                        selectionMode="single"
                        open
                        onOpenChange={(open) => {
                            if (!open) {
                                setGalleryTarget(null);
                            }
                        }}
                        onSelect={selectOgImage}
                        initialCategory="image"
                        allowedCategories={["image"]}
                    />
                )}

                {form.errors.variants && form.data.type !== "variable" && (
                    <InputError message={form.errors.variants} />
                )}
                <div className="flex justify-end gap-2 border-t pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={form.processing}
                        onClick={() => router.visit(index.url())}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={
                            form.processing ||
                            (form.data.type === "variable" &&
                                isVariantLimitExceeded)
                        }
                    >
                        {form.processing
                            ? "Saving..."
                            : product
                              ? "Save product"
                              : "Create product"}
                    </Button>
                </div>
            </form>
        </>
    );
}
