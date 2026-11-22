import GalleryPicker from '@/components/gallery/gallery-picker';
import { Button } from '@/components/ui/button';
import InputError from '@/components/ui/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { Banner, GalleryMedia } from '@/types';
import type { FormDataErrors } from '@inertiajs/core';
import { Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

type Props = {
    banner: Banner | null;
    errors: FormDataErrors<Record<string, unknown>>;
};

export default function BannerForm({ banner, errors }: Props) {
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [mediaPath, setMediaPath] = useState<string>(banner?.media_path ?? '');
    const [mediaUrl, setMediaUrl] = useState<string>(banner?.media_url ?? '');
    const [mediaType, setMediaType] = useState<'image' | 'video'>(
        banner?.media_type ?? 'image',
    );
    const [textPosition, setTextPosition] = useState<'left' | 'center' | 'right'>(
        banner?.text_position ?? 'left',
    );
    const [textColor, setTextColor] = useState<'light' | 'dark'>(
        banner?.text_color ?? 'light',
    );
    const [isActive, setIsActive] = useState<boolean>(banner?.is_active ?? true);

    const handleSelectMedia = (media: GalleryMedia) => {
        if (!media.path) {
            return;
        }
        const isVideo =
            media.type === 'video' ||
            Boolean(media.mime_type?.startsWith('video/'));
        setMediaPath(media.path);
        setMediaUrl(media.url ?? '');
        setMediaType(isVideo ? 'video' : 'image');
        setIsGalleryOpen(false);
    };

    return (
        <div className="space-y-5 pt-1">
            {/* Hidden Fields for Custom State Controls */}
            <input type="hidden" name="media_path" value={mediaPath} />
            <input type="hidden" name="media_type" value={mediaType} />
            <input type="hidden" name="text_position" value={textPosition} />
            <input type="hidden" name="text_color" value={textColor} />
            <input type="hidden" name="is_active" value={isActive ? '1' : '0'} />

            {/* Media Selector */}
            <div className="space-y-2">
                <Label>Banner Media (Image or Video) *</Label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    {/* Preview box */}
                    <div className="relative aspect-[16/9] w-full sm:w-48 overflow-hidden rounded-lg border bg-neutral-100 flex items-center justify-center">
                        {mediaUrl ? (
                            mediaType === 'video' ? (
                                <video
                                    src={mediaUrl}
                                    controls
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <img
                                    src={mediaUrl}
                                    alt="Preview"
                                    className="h-full w-full object-cover"
                                />
                            )
                        ) : (
                            <div className="flex flex-col items-center gap-1 text-muted-foreground p-4 text-center">
                                <ImageIcon className="h-8 w-8 text-neutral-300" />
                                <span className="text-xs">No media chosen</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2 flex-1">
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsGalleryOpen(true)}
                                className="inline-flex items-center gap-2"
                            >
                                <ImageIcon className="h-4 w-4" />
                                Choose from Gallery
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Select any high-resolution image or MP4 video from your media library.
                        </p>
                        <div className="flex items-center gap-3">
                            <Label className="text-xs text-muted-foreground">Type:</Label>
                            <span className="rounded border px-2 py-0.5 text-xs font-mono uppercase">
                                {mediaType}
                            </span>
                            {mediaPath && (
                                <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[200px]">
                                    {mediaPath}
                                </span>
                            )}
                        </div>
                        <InputError message={errors.media_path as string | undefined} />
                    </div>
                </div>
            </div>

            {/* Title & Subtitle */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <Label htmlFor="banner-title">Main Headline / Title</Label>
                    <Input
                        id="banner-title"
                        name="title"
                        defaultValue={banner?.title ?? ''}
                        placeholder="e.g. Summer Haute Couture 2026"
                    />
                    <InputError message={errors.title as string | undefined} />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="banner-subtitle">Pre-headline / Subtitle</Label>
                    <Input
                        id="banner-subtitle"
                        name="subtitle"
                        defaultValue={banner?.subtitle ?? ''}
                        placeholder="e.g. Handcrafted Luxury"
                    />
                    <InputError message={errors.subtitle as string | undefined} />
                </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
                <Label htmlFor="banner-desc">Description</Label>
                <textarea
                    id="banner-desc"
                    name="description"
                    rows={2}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    defaultValue={banner?.description ?? ''}
                    placeholder="Short paragraph or statement displayed over the banner."
                />
                <InputError message={errors.description as string | undefined} />
            </div>

            {/* Primary Button */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <Label htmlFor="btn-text">Primary Button Text</Label>
                    <Input
                        id="btn-text"
                        name="button_text"
                        defaultValue={banner?.button_text ?? 'Shop Now'}
                        placeholder="e.g. Shop Collection"
                    />
                    <InputError message={errors.button_text as string | undefined} />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="btn-url">Primary Button URL</Label>
                    <Input
                        id="btn-url"
                        name="button_url"
                        defaultValue={banner?.button_url ?? '/collections'}
                        placeholder="e.g. /collections/summer"
                    />
                    <InputError message={errors.button_url as string | undefined} />
                </div>
            </div>

            {/* Secondary Button */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <Label htmlFor="sec-btn-text">Secondary Button Text (Optional)</Label>
                    <Input
                        id="sec-btn-text"
                        name="secondary_button_text"
                        defaultValue={banner?.secondary_button_text ?? ''}
                        placeholder="e.g. Explore All"
                    />
                    <InputError
                        message={errors.secondary_button_text as string | undefined}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="sec-btn-url">Secondary Button URL</Label>
                    <Input
                        id="sec-btn-url"
                        name="secondary_button_url"
                        defaultValue={banner?.secondary_button_url ?? ''}
                        placeholder="e.g. /collections"
                    />
                    <InputError
                        message={errors.secondary_button_url as string | undefined}
                    />
                </div>
            </div>

            {/* Alignment, Theme & Sort Order */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                    <Label>Text Alignment</Label>
                    <Select
                        value={textPosition}
                        onValueChange={(val: 'left' | 'center' | 'right') =>
                            setTextPosition(val)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="left">Left Aligned</SelectItem>
                            <SelectItem value="center">Centered</SelectItem>
                            <SelectItem value="right">Right Aligned</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <Label>Text Color Theme</Label>
                    <Select
                        value={textColor}
                        onValueChange={(val: 'light' | 'dark') => setTextColor(val)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">Light (White text)</SelectItem>
                            <SelectItem value="dark">Dark (Black text)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="sort-order">Sort Order</Label>
                    <Input
                        id="sort-order"
                        name="sort_order"
                        type="number"
                        min={0}
                        defaultValue={banner?.sort_order ?? 0}
                    />
                </div>
            </div>

            {/* Active Switch */}
            <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                    <Label
                        htmlFor="banner-switch-active"
                        className="text-sm font-medium cursor-pointer"
                    >
                        Active Banner
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        Display this banner in the storefront slider.
                    </p>
                </div>
                <Switch
                    id="banner-switch-active"
                    checked={isActive}
                    onCheckedChange={(checked) => setIsActive(checked === true)}
                />
            </div>

            {/* Gallery Picker Modal */}
            <GalleryPicker
                mode="dialog"
                open={isGalleryOpen}
                onOpenChange={setIsGalleryOpen}
                selectionMode="single"
                allowedCategories={['image', 'video']}
                onSelect={handleSelectMedia}
            />
        </div>
    );
}
