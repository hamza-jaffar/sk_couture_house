import FrontendDataController from '@/actions/App/Http/Controllers/FrontendDataController'
import Heading from '@/components/heading'
import InputError from '@/components/input-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Form, Head, usePage } from '@inertiajs/react'
import { useState, useRef } from 'react'
import type { MarqueeWord } from '@/types/auth'

type PageProps = {
    frontendData: any;
};

// Preset colour palette for marquee words
const COLOUR_PRESETS = [
    '#b8952a', '#e8d08a', '#6ba8a4', '#4a7c59',
    '#9b8fb5', '#c17b7b', '#c8a96e', '#7a9e7e',
];

const EditFrontendData = () => {
    const { frontendData } = usePage<PageProps>().props;

    // Hero image preview state
    const [imagePreview, setImagePreview] = useState<string | null>(
        frontendData?.hero_image ? `/storage/${frontendData.hero_image}` : null
    );
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Marquee editor state
    const initialMarquee: MarqueeWord[] =
        Array.isArray(frontendData?.marquee) && frontendData.marquee.length > 0
            ? frontendData.marquee
            : [{ text: '', color: COLOUR_PRESETS[0] }];

    const [marqueeItems, setMarqueeItems] = useState<MarqueeWord[]>(initialMarquee);

    const addMarqueeItem = () => {
        setMarqueeItems(prev => [
            ...prev,
            { text: '', color: COLOUR_PRESETS[prev.length % COLOUR_PRESETS.length] },
        ]);
    };

    const removeMarqueeItem = (index: number) => {
        setMarqueeItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateMarqueeItem = (index: number, field: keyof MarqueeWord, value: string) => {
        setMarqueeItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
    };

    return (
        <>
            <Head title="Frontend Data Settings" />

            <div className="max-w-6xl w-full mx-auto p-4 md:p-8 space-y-6">
                <Heading
                    variant="small"
                    title="Frontend Data Settings"
                    description="Update the hero, lookbook, and footer texts used on the site."
                />

                <Form
                    {...FrontendDataController.store.form()}
                    options={{ preserveScroll: true }}
                    encType="multipart/form-data"
                    className="space-y-8"
                >
                    {({ processing, errors }) => (
                        <>
                            {/* ── Hero Section ── */}
                            <fieldset className="space-y-5 border rounded-lg p-5">
                                <legend className="text-sm font-semibold px-1">Hero Section</legend>

                                <div className="grid gap-2">
                                    <Label htmlFor="hero_title">Hero Title</Label>
                                    <Input
                                        id="hero_title"
                                        className="mt-1 block w-full"
                                        defaultValue={frontendData?.hero_title ?? ''}
                                        name="hero_title"
                                        placeholder="Enter Hero Title"
                                    />
                                    <InputError className="mt-2" message={errors.hero_title} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="hero_watermark">Hero Watermark</Label>
                                    <Input
                                        id="hero_watermark"
                                        className="mt-1 block w-full"
                                        defaultValue={frontendData?.hero_watermark ?? ''}
                                        name="hero_watermark"
                                        placeholder="e.g. H A U T E"
                                    />
                                    <InputError className="mt-2" message={errors.hero_watermark} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="hero_desc">Hero Description</Label>
                                    <Textarea
                                        id="hero_desc"
                                        className="mt-1 block w-full"
                                        defaultValue={frontendData?.hero_desc ?? ''}
                                        name="hero_desc"
                                        rows={4}
                                        placeholder="A brief editorial description..."
                                    />
                                    <InputError className="mt-2" message={errors.hero_desc} />
                                </div>

                                {/* ── Hero Image Upload ── */}
                                <div className="grid gap-2">
                                    <Label htmlFor="hero_image">Hero Image</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Accepted: JPG, PNG, WEBP — max 4 MB. Leave blank to keep the current image.
                                    </p>

                                    {/* Current image preview */}
                                    {imagePreview && (
                                        <div className="relative w-48 h-64 overflow-hidden rounded border">
                                            <img
                                                src={imagePreview}
                                                alt="Hero preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImagePreview(null);
                                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                                }}
                                                className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded px-1.5 py-0.5 hover:bg-black/80"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    )}

                                    <Input
                                        ref={fileInputRef}
                                        id="hero_image"
                                        type="file"
                                        name="hero_image"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="mt-1 block w-full cursor-pointer"
                                        onChange={handleImageChange}
                                    />
                                    <InputError className="mt-2" message={errors.hero_image} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="scroll_indicator_text">Scroll Indicator Text</Label>
                                    <Input
                                        id="scroll_indicator_text"
                                        className="mt-1 block w-full"
                                        defaultValue={frontendData?.scroll_indicator_text ?? ''}
                                        name="scroll_indicator_text"
                                        placeholder="e.g. Scroll Down"
                                    />
                                    <InputError className="mt-2" message={errors.scroll_indicator_text} />
                                </div>
                            </fieldset>

                            {/* ── Marquee Words ── */}
                            <fieldset className="space-y-4 border rounded-lg p-5">
                                <legend className="text-sm font-semibold px-1">Marquee Words</legend>
                                <p className="text-xs text-muted-foreground">
                                    These words scroll across the hero banner. Pick a text and a colour for each entry.
                                </p>

                                {/*
                                  KEY FIX: Inertia's Form intercepts submit via JS and does NOT
                                  scan the DOM for named inputs. Controlled <input value={}> fields
                                  are invisible to it. We solve this by serialising the entire
                                  marquee state as a single JSON string in one hidden field.
                                  The PHP side will json_decode() it.
                                */}
                                <input
                                    type="hidden"
                                    name="marquee_json"
                                    value={JSON.stringify(marqueeItems)}
                                    readOnly
                                />

                                <div className="space-y-3">
                                    {marqueeItems.map((item, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <Input
                                                className="flex-1"
                                                placeholder="e.g. SARTORIAL INTEGRITY"
                                                value={item.text}
                                                onChange={(e) => updateMarqueeItem(index, 'text', e.target.value)}
                                            />

                                            {/* Colour swatch picker */}
                                            <div className="flex items-center gap-1.5">
                                                {COLOUR_PRESETS.map((c) => (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        title={c}
                                                        onClick={() => updateMarqueeItem(index, 'color', c)}
                                                        className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                                                        style={{
                                                            background: c,
                                                            borderColor: item.color === c ? '#fff' : 'transparent',
                                                        }}
                                                    />
                                                ))}
                                                {/* Custom hex input */}
                                                <input
                                                    type="color"
                                                    value={item.color}
                                                    onChange={(e) => updateMarqueeItem(index, 'color', e.target.value)}
                                                    className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent"
                                                    title="Custom colour"
                                                />
                                            </div>

                                            {/* Live preview chip */}
                                            <span
                                                className="text-[10px] tracking-widest font-medium uppercase whitespace-nowrap hidden sm:inline"
                                                style={{ color: item.color }}
                                            >
                                                {item.text || '…'}
                                            </span>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive px-2"
                                                onClick={() => removeMarqueeItem(index)}
                                                disabled={marqueeItems.length === 1}
                                            >
                                                ✕
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <Button type="button" variant="outline" size="sm" onClick={addMarqueeItem}>
                                    + Add Word
                                </Button>
                            </fieldset>

                            {/* ── Lookbook ── */}
                            <fieldset className="space-y-5 border rounded-lg p-5">
                                <legend className="text-sm font-semibold px-1">Lookbook</legend>

                                <div className="grid gap-2">
                                    <Label htmlFor="lookbook_tag">Lookbook Tag</Label>
                                    <Input
                                        id="lookbook_tag"
                                        className="mt-1 block w-full"
                                        defaultValue={frontendData?.lookbook_tag ?? ''}
                                        name="lookbook_tag"
                                        placeholder="e.g. SS 2026"
                                    />
                                    <InputError className="mt-2" message={errors.lookbook_tag} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="fabric_canvas_title">Fabric Canvas Title</Label>
                                    <Input
                                        id="fabric_canvas_title"
                                        className="mt-1 block w-full"
                                        defaultValue={frontendData?.fabric_canvas_title ?? ''}
                                        name="fabric_canvas_title"
                                        placeholder="e.g. The Fabric Library"
                                    />
                                    <InputError className="mt-2" message={errors.fabric_canvas_title} />
                                </div>
                            </fieldset>

                            {/* ── Footer ── */}
                            <fieldset className="space-y-5 border rounded-lg p-5">
                                <legend className="text-sm font-semibold px-1">Footer</legend>

                                <div className="grid gap-2">
                                    <Label htmlFor="footer_title">Footer Title</Label>
                                    <Input
                                        id="footer_title"
                                        className="mt-1 block w-full"
                                        defaultValue={frontendData?.footer_title ?? ''}
                                        name="footer_title"
                                        placeholder="e.g. SK Couture House"
                                    />
                                    <InputError className="mt-2" message={errors.footer_title} />
                                </div>
                            </fieldset>

                            <div className="flex items-center gap-4">
                                <Button disabled={processing}>
                                    Save Changes
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    )
}

export default EditFrontendData
