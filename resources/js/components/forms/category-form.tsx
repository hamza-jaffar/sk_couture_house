import { Combobox } from '@base-ui/react/combobox';
import Gallery from '@/components/gallery';
import { Button } from '@/components/ui/button';
import InputError from '@/components/ui/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type {
    CategoryParentOption,
    CollectionCategory,
    GalleryMedia,
} from '@/types';
import type { FormDataErrors } from '@inertiajs/core';
import { Check, ChevronDown, ImagePlus, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

type Props = {
    category: CollectionCategory | null;
    parentOptions?: CategoryParentOption[];
    errors: FormDataErrors<Record<string, unknown>>;
};

type ParentOption = {
    value: string;
    label: string;
};

type SelectedImage = {
    path: string | null;
    url: string | null;
    title: string | null;
};

function isDescendant(
    candidate: CategoryParentOption,
    categoryId: number,
    optionsById: Map<number, CategoryParentOption>,
): boolean {
    let parentId = candidate.parent_id;

    while (parentId !== null) {
        if (parentId === categoryId) {
            return true;
        }

        parentId = optionsById.get(parentId)?.parent_id ?? null;
    }

    return false;
}

function imageUrl(path: string | null, url: string | null): string | null {
    if (url) {
        return url;
    }

    return path ? `/storage/${path}` : null;
}

export default function CategoryForm({
    category,
    parentOptions,
    errors,
}: Props) {
    const options = parentOptions ?? [];
    const optionsById = new Map(
        options.map((option) => [option.id, option] as const),
    );
    const availableParents = options.filter(
        (option) =>
            option.deleted_at === null &&
            option.id !== category?.id &&
            (category === null ||
                !isDescendant(option, category.id, optionsById)),
    );
    const parentItems = useMemo<ParentOption[]>(
        () => [
            { value: 'none', label: 'No parent (top-level collection)' },
            ...availableParents.map((option) => ({
                value: String(option.id),
                label: option.name,
            })),
        ],
        [availableParents],
    );
    const comboboxItems = useMemo(
        () =>
            Combobox.createItems(parentItems, {
                getValue: (option) => option.value,
                getLabel: (option) => option.label,
            }),
        [parentItems],
    );
    const [parentId, setParentId] = useState(
        category?.parent_id ? String(category.parent_id) : 'none',
    );
    const [isActive, setIsActive] = useState(category?.is_active ?? true);
    const [isFeatured, setIsFeatured] = useState(
        category?.is_featured ?? false,
    );
    const [imagePicker, setImagePicker] = useState<'image' | 'banner' | null>(
        null,
    );
    const [image, setImage] = useState<SelectedImage>({
        path: category?.image_path ?? null,
        url: category?.image_url ?? null,
        title: category?.image_path?.split('/').pop() ?? null,
    });
    const [banner, setBanner] = useState<SelectedImage>({
        path: category?.banner_path ?? null,
        url: category?.banner_url ?? null,
        title: category?.banner_path?.split('/').pop() ?? null,
    });
    const selectedParent = parentItems.find(
        (option) => option.value === parentId,
    );

    function selectImage(field: 'image' | 'banner', media: GalleryMedia) {
        if (!media.path) {
            toast.error('The selected gallery file has no available path.');

            return;
        }

        const selected = {
            path: media.path,
            url: media.url,
            title: media.original_file_name,
        };

        if (field === 'image') {
            setImage(selected);
        } else {
            setBanner(selected);
        }

        setImagePicker(null);
    }

    function renderImageField(
        field: 'image' | 'banner',
        label: string,
        selected: SelectedImage,
        setSelected: (image: SelectedImage) => void,
    ) {
        const pathName = field === 'image' ? 'image_path' : 'banner_path';
        const previewUrl = imageUrl(selected.path, selected.url);

        return (
            <div className="grid gap-2">
                <Label htmlFor={`category-${pathName}`}>{label}</Label>
                <input
                    id={`category-${pathName}`}
                    type="hidden"
                    name={pathName}
                    value={selected.path ?? ''}
                />
                <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center">
                    <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-md bg-muted sm:w-36">
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt={`${label} preview`}
                                className="size-full object-contain"
                            />
                        ) : (
                            <ImagePlus className="size-8 text-muted-foreground" />
                        )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <p className="truncate text-sm text-muted-foreground">
                            {selected.title ?? 'No file selected'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setImagePicker(field)}
                            >
                                <ImagePlus />
                                Choose from gallery
                            </Button>
                            {selected.path && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() =>
                                        setSelected({
                                            path: null,
                                            url: null,
                                            title: null,
                                        })
                                    }
                                    aria-label={`Remove ${label.toLowerCase()}`}
                                >
                                    <X />
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                {errors[pathName] && (
                    <InputError message={String(errors[pathName])} />
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <section className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="category-name">Collection name</Label>
                    <Input
                        id="category-name"
                        name="name"
                        defaultValue={category?.name ?? ''}
                        required
                        maxLength={255}
                        aria-invalid={Boolean(errors.name)}
                    />
                    {errors.name && (
                        <InputError message={String(errors.name)} />
                    )}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="category-parent">Parent collection</Label>
                    <Combobox.Root
                        items={comboboxItems}
                        value={parentId}
                        onValueChange={(value) => {
                            if (value !== null) {
                                setParentId(value);
                            }
                        }}
                    >
                        <input
                            type="hidden"
                            name="parent_id"
                            value={parentId === 'none' ? '' : parentId}
                        />
                        <Combobox.Trigger
                            render={
                                <button
                                    id="category-parent"
                                    type="button"
                                    aria-label="Choose a parent collection"
                                    aria-invalid={Boolean(errors.parent_id)}
                                    className="flex h-9 w-full items-center justify-between gap-3 rounded-lg border border-input bg-background px-3 text-left text-sm transition-colors outline-none hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
                                >
                                    <span className="truncate">
                                        {selectedParent?.label ??
                                            'Choose a parent collection'}
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
                                    aria-label="Select parent collection"
                                    className="w-(--anchor-width) min-w-64 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md"
                                >
                                    <div className="relative border-b p-2">
                                        <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Combobox.Input
                                            aria-label="Search parent collections"
                                            placeholder="Search parent collections..."
                                            className="h-9 w-full rounded-md bg-transparent py-1 pr-2 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                        />
                                    </div>
                                    <Combobox.Empty>
                                        <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                            No matching collections found.
                                        </p>
                                    </Combobox.Empty>
                                    <Combobox.List className="max-h-64 overflow-y-auto p-1">
                                        {(option: ParentOption) => (
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
                    {errors.parent_id && (
                        <InputError message={String(errors.parent_id)} />
                    )}
                </div>
            </section>

            <div className="grid gap-2">
                <Label htmlFor="category-description">Description</Label>
                <textarea
                    id="category-description"
                    name="description"
                    defaultValue={category?.description ?? ''}
                    maxLength={5000}
                    rows={4}
                    className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    aria-invalid={Boolean(errors.description)}
                />
                {errors.description && (
                    <InputError message={String(errors.description)} />
                )}
            </div>

            <section className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label
                        htmlFor="category-active"
                        className="flex items-center gap-2"
                    >
                        <Checkbox
                            id="category-active"
                            checked={isActive}
                            onCheckedChange={(checked) =>
                                setIsActive(checked === true)
                            }
                            aria-invalid={Boolean(errors.is_active)}
                        />
                        Active
                    </Label>
                    <input
                        type="hidden"
                        name="is_active"
                        value={isActive ? '1' : '0'}
                    />
                    {errors.is_active && (
                        <InputError message={String(errors.is_active)} />
                    )}
                </div>
                <div className="grid gap-2">
                    <Label
                        htmlFor="category-featured"
                        className="flex items-center gap-2"
                    >
                        <Checkbox
                            id="category-featured"
                            checked={isFeatured}
                            onCheckedChange={(checked) =>
                                setIsFeatured(checked === true)
                            }
                            aria-invalid={Boolean(errors.is_featured)}
                        />
                        Featured
                    </Label>
                    <input
                        type="hidden"
                        name="is_featured"
                        value={isFeatured ? '1' : '0'}
                    />
                    {errors.is_featured && (
                        <InputError message={String(errors.is_featured)} />
                    )}
                </div>
            </section>

            <section className="grid gap-5 rounded-xl border p-4">
                <div>
                    <h3 className="text-sm font-semibold">Collection images</h3>
                    <p className="text-xs text-muted-foreground">
                        Select images from the shared gallery. Upload or manage
                        files in Gallery.
                    </p>
                </div>
                {renderImageField('image', 'Collection image', image, setImage)}
                {renderImageField(
                    'banner',
                    'Collection banner',
                    banner,
                    setBanner,
                )}
            </section>

            <section className="grid gap-4 rounded-xl border p-4">
                <div>
                    <h3 className="text-sm font-semibold">Search metadata</h3>
                    <p className="text-xs text-muted-foreground">
                        Optional metadata used by search engines.
                    </p>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="category-meta-title">Meta title</Label>
                    <Input
                        id="category-meta-title"
                        name="meta_title"
                        defaultValue={category?.meta_title ?? ''}
                        maxLength={255}
                        aria-invalid={Boolean(errors.meta_title)}
                    />
                    {errors.meta_title && (
                        <InputError message={String(errors.meta_title)} />
                    )}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="category-meta-description">
                        Meta description
                    </Label>
                    <textarea
                        id="category-meta-description"
                        name="meta_description"
                        defaultValue={category?.meta_description ?? ''}
                        maxLength={1000}
                        rows={3}
                        className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        aria-invalid={Boolean(errors.meta_description)}
                    />
                    {errors.meta_description && (
                        <InputError message={String(errors.meta_description)} />
                    )}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="category-meta-keywords">
                        Meta keywords
                    </Label>
                    <Input
                        id="category-meta-keywords"
                        name="meta_keywords"
                        defaultValue={category?.meta_keywords ?? ''}
                        maxLength={500}
                        aria-invalid={Boolean(errors.meta_keywords)}
                    />
                    {errors.meta_keywords && (
                        <InputError message={String(errors.meta_keywords)} />
                    )}
                </div>
            </section>

            <Gallery
                mode="dialog"
                open={imagePicker !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setImagePicker(null);
                    }
                }}
                selectionMode="single"
                initialCategory="image"
                allowedCategories={['image']}
                onSelect={(media) => {
                    if (imagePicker !== null) {
                        selectImage(imagePicker, media);
                    }
                }}
            />
        </div>
    );
}
