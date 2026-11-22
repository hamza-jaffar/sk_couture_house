import { update } from '@/actions/Modules/Setting/Http/Controllers/SettingController';
import GalleryPicker from '@/components/gallery/gallery-picker';
import CurrencyField from '@/components/settings/currency-field';
import LocationFields from '@/components/settings/location-fields';
import type { SearchableOption } from '@/components/settings/searchable-select';
import VariantEditor from '@/components/settings/variant-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCan } from '@/hooks/use-can';
import type { GalleryMedia, PlatformSettings, ProductVariant } from '@/types';
import { Form, Head } from '@inertiajs/react';
import {
    ImagePlus,
    LayoutTemplate,
    Mail,
    Search,
    Share2,
    SlidersHorizontal,
    Store,
    Tags,
    X,
} from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { toast } from 'sonner';

type Props = {
    settings: PlatformSettings;
    selectedTab: SettingsGroup;
};

type SettingsGroup = 'general' | 'contact' | 'social' | 'mail' | 'variants' | 'seo' | 'storefront';

type FieldErrors = Record<string, string | undefined>;

const tabs: { id: SettingsGroup; label: string; icon: typeof Store }[] = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'storefront', label: 'Storefront', icon: LayoutTemplate },
    { id: 'contact', label: 'Contact', icon: SlidersHorizontal },
    { id: 'social', label: 'Social links', icon: Share2 },
    { id: 'mail', label: 'Mail', icon: Mail },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'variants', label: 'Variants', icon: Tags },
];

type SettingsFormProps = {
    group: SettingsGroup;
    children: (errors: FieldErrors, disabled: boolean) => ReactNode;
};

function SettingsForm({ group, children }: SettingsFormProps) {
    const can = useCan();
    const canUpdate = can('settings.update');

    return (
        <Form
            {...update.form(group)}
            options={{ preserveScroll: true }}
            className="grid gap-6"
        >
            {({ processing, errors }) => (
                <>
                    <fieldset
                        disabled={!canUpdate}
                        className="grid gap-6 disabled:opacity-70"
                    >
                        {children(errors, !canUpdate)}
                    </fieldset>
                    {canUpdate ? (
                        <div className="flex justify-end border-t pt-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save changes'}
                            </Button>
                        </div>
                    ) : null}
                </>
            )}
        </Form>
    );
}

type TextFieldProps = {
    id: string;
    name: string;
    label: string;
    value?: string | number;
    type?: string;
    placeholder?: string;
    autoComplete?: string;
    required?: boolean;
    error?: string;
};

function TextField({
    id,
    name,
    label,
    value,
    type = 'text',
    placeholder,
    autoComplete,
    required = false,
    error,
}: TextFieldProps) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                name={name}
                type={type}
                defaultValue={value}
                placeholder={placeholder}
                autoComplete={autoComplete}
                required={required}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
            />
            {error ? <InputError id={`${id}-error`} message={error} /> : null}
        </div>
    );
}

type TextareaFieldProps = {
    id: string;
    name: string;
    label: string;
    value: string;
    placeholder?: string;
    rows?: number;
    error?: string;
};

function TextareaField({
    id,
    name,
    label,
    value,
    placeholder,
    rows = 4,
    error,
}: TextareaFieldProps) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <textarea
                id={id}
                name={name}
                rows={rows}
                defaultValue={value}
                placeholder={placeholder}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
            />
            {error ? <InputError id={`${id}-error`} message={error} /> : null}
        </div>
    );
}

type SelectFieldProps = {
    id: string;
    name: string;
    label: string;
    value: string;
    options: SearchableOption[];
    error?: string;
};

function SelectField({ id, name, label, value, options, error }: SelectFieldProps) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Select name={name} defaultValue={value} required>
                <SelectTrigger id={id} className="w-full">
                    <SelectValue
                        placeholder={`Select ${label.toLowerCase()}`}
                    />
                </SelectTrigger>
                <SelectContent align="start">
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && <InputError message={error} />}
        </div>
    );
}

type SelectedAsset = {
    path: string | null;
    url: string | null;
    title: string | null;
};

function FileSetting({
    id,
    name,
    label,
    selected,
    error,
    disabled,
    onChoose,
    onRemove,
}: {
    id: string;
    name: 'logo' | 'favicon' | 'og_image';
    label: string;
    selected: SelectedAsset;
    error?: string;
    disabled: boolean;
    onChoose: () => void;
    onRemove: () => void;
}) {
    const pathName = `${name}_path`;

    return (
        <div className="grid gap-3 rounded-lg border p-4">
            <input
                id={id}
                type="hidden"
                name={pathName}
                value={selected.path ?? ''}
            />
            <div className="flex items-center gap-4">
                {selected.url ? (
                    <img
                        src={selected.url}
                        alt={`${label} preview`}
                        className="size-14 rounded-md border bg-background object-contain p-1"
                    />
                ) : (
                    <div className="grid size-14 place-items-center rounded-md border bg-muted text-xs text-muted-foreground">
                        None
                    </div>
                )}
                <div className="grid gap-1">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">
                        Choose an image from the gallery.
                    </p>
                </div>
            </div>
            {selected.title ? (
                <p className="truncate text-xs text-muted-foreground">
                    {selected.title}
                </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="outline"
                    disabled={disabled}
                    onClick={onChoose}
                >
                    <ImagePlus aria-hidden="true" />
                    Choose from gallery
                </Button>
                {selected.path ? (
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={disabled}
                        onClick={onRemove}
                        aria-label={`Remove ${label.toLowerCase()}`}
                    >
                        <X aria-hidden="true" />
                        Remove
                    </Button>
                ) : null}
            </div>
            {error ? <InputError id={`${id}-error`} message={error} /> : null}
        </div>
    );
}

export default function Settings({ settings, selectedTab }: Props) {
    const can = useCan();
    const canUpdate = can('settings.update');
    const [activeTab, setActiveTab] = useState<SettingsGroup>(selectedTab);
    const [variants, setVariants] = useState<ProductVariant[]>(
        settings.variants,
    );
    const [currency, setCurrency] = useState(settings.general.currency);
    const [currencyIcon, setCurrencyIcon] = useState(
        settings.general.currency_icon,
    );
    const [country, setCountry] = useState(settings.contact.country);
    const [region, setRegion] = useState(settings.contact.region);
    const [city, setCity] = useState(settings.contact.city);
    const [logo, setLogo] = useState<SelectedAsset>({
        path: settings.general.logo_path,
        url: settings.general.logo_url,
        title: settings.general.logo_path?.split('/').pop() ?? null,
    });
    const [favicon, setFavicon] = useState<SelectedAsset>({
        path: settings.general.favicon_path,
        url: settings.general.favicon_url,
        title: settings.general.favicon_path?.split('/').pop() ?? null,
    });
    const [activePicker, setActivePicker] = useState<'logo' | 'favicon' | 'og_image' | null>(
        null,
    );
    const [ogImage, setOgImage] = useState<SelectedAsset>({
        path: settings.seo.og_image_path,
        url: settings.seo.og_image_url,
        title: settings.seo.og_image_path?.split('/').pop() ?? null,
    });

    useEffect(() => {
        setVariants(settings.variants);
    }, [settings.variants]);

    useEffect(() => {
        setActiveTab(selectedTab);
    }, [selectedTab]);

    useEffect(() => {
        setCurrency(settings.general.currency);
        setCurrencyIcon(settings.general.currency_icon);
        setCountry(settings.contact.country);
        setRegion(settings.contact.region);
        setCity(settings.contact.city);
        setLogo({
            path: settings.general.logo_path,
            url: settings.general.logo_url,
            title: settings.general.logo_path?.split('/').pop() ?? null,
        });
        setFavicon({
            path: settings.general.favicon_path,
            url: settings.general.favicon_url,
            title: settings.general.favicon_path?.split('/').pop() ?? null,
        });
        setOgImage({
            path: settings.seo.og_image_path,
            url: settings.seo.og_image_url,
            title: settings.seo.og_image_path?.split('/').pop() ?? null,
        });
    }, [settings]);

    function selectGalleryImage(media: GalleryMedia) {
        if (!media.path) {
            toast.error('The selected gallery image has no available path.');
            return;
        }

        const selected = {
            path: media.path,
            url: media.url,
            title: media.original_file_name,
        };

        if (activePicker === 'logo') {
            setLogo(selected);
        } else if (activePicker === 'favicon') {
            setFavicon(selected);
        } else if (activePicker === 'og_image') {
            setOgImage(selected);
        }

        setActivePicker(null);
    }

    function selectTab(tab: SettingsGroup) {
        setActiveTab(tab);
        const url = new URL(window.location.href);
        url.searchParams.set('selected_tag', tab);

        window.history.replaceState(
            window.history.state,
            '',
            `${url.pathname}${url.search}${url.hash}`,
        );
    }

    return (
        <div className="mx-auto grid max-w-5xl gap-6">
            <Head title="Platform settings" />
            <div className="grid gap-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Platform settings
                </h1>
                <p className="text-sm text-muted-foreground">
                    Configure your store details, contact channels, mail, and
                    product options.
                </p>
            </div>

            <div
                role="tablist"
                aria-label="Platform settings sections"
                className="flex flex-wrap gap-2 border-b pb-3"
            >
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        role="tab"
                        id={`settings-tab-${id}`}
                        aria-selected={activeTab === id}
                        aria-controls={`settings-panel-${id}`}
                        onClick={() => selectTab(id)}
                        className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
                            activeTab === id
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                    >
                        <Icon aria-hidden="true" className="size-4" />
                        {label}
                    </button>
                ))}
            </div>

            <section
                role="tabpanel"
                id={`settings-panel-${activeTab}`}
                aria-labelledby={`settings-tab-${activeTab}`}
                className="rounded-xl border bg-card p-4 sm:p-6"
            >
                {activeTab === 'general' ? (
                    <div className="grid gap-6">
                        <div>
                            <h2 className="text-lg font-semibold">
                                General information
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Set the name and identity shown across your
                                storefront.
                            </p>
                        </div>
                        <SettingsForm group="general">
                            {(errors) => (
                                <>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <TextField
                                            id="store-name"
                                            name="name"
                                            label="Store name"
                                            value={settings.general.name}
                                            required
                                            error={errors.name}
                                        />
                                        <TextField
                                            id="store-tagline"
                                            name="tagline"
                                            label="Tagline"
                                            value={settings.general.tagline}
                                            error={errors.tagline}
                                        />
                                        <TextField
                                            id="store-website"
                                            name="website_url"
                                            label="Website URL"
                                            type="url"
                                            value={settings.general.website_url}
                                            placeholder="https://example.com"
                                            error={errors.website_url}
                                        />
                                        <TextField
                                            id="store-timezone"
                                            name="timezone"
                                            label="Timezone"
                                            value={settings.general.timezone}
                                            placeholder="UTC"
                                            required
                                            error={errors.timezone}
                                        />
                                        <CurrencyField
                                            currency={currency}
                                            currencyIcon={currencyIcon}
                                            error={errors.currency}
                                            onChange={(
                                                nextCurrency,
                                                nextIcon,
                                            ) => {
                                                setCurrency(nextCurrency);
                                                setCurrencyIcon(nextIcon);
                                            }}
                                        />
                                    </div>
                                    <TextareaField
                                        id="store-description"
                                        name="description"
                                        label="Store description"
                                        value={settings.general.description}
                                        rows={3}
                                        error={errors.description}
                                    />
                                    <TextareaField
                                        id="store-shipping-return"
                                        name="shipping_and_return"
                                        label="Shipping & Return"
                                        value={settings.general.shipping_and_return}
                                        placeholder="Enter default shipping, delivery timelines, and return policy details shown on product pages..."
                                        rows={4}
                                        error={errors.shipping_and_return}
                                    />
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <FileSetting
                                            id="store-logo"
                                            name="logo"
                                            label="Logo"
                                            selected={logo}
                                            error={errors.logo_path}
                                            disabled={!canUpdate}
                                            onChoose={() =>
                                                setActivePicker('logo')
                                            }
                                            onRemove={() =>
                                                setLogo({
                                                    path: null,
                                                    url: null,
                                                    title: null,
                                                })
                                            }
                                        />
                                        <FileSetting
                                            id="store-favicon"
                                            name="favicon"
                                            label="Favicon"
                                            selected={favicon}
                                            error={errors.favicon_path}
                                            disabled={!canUpdate}
                                            onChoose={() =>
                                                setActivePicker('favicon')
                                            }
                                            onRemove={() =>
                                                setFavicon({
                                                    path: null,
                                                    url: null,
                                                    title: null,
                                                })
                                            }
                                        />
                                    </div>
                                </>
                            )}
                        </SettingsForm>
                    </div>
                ) : null}

                {activeTab === 'storefront' ? (
                    <div className="grid gap-6">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Storefront Content & Copy
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Customize all section titles, subtitles, value promises, and footer copy displayed on your store.
                            </p>
                        </div>
                        <SettingsForm group="storefront">
                            {(errors) => (
                                <>
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
                                            Home Sections & Badges
                                        </h3>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <TextField
                                                id="sf-hero-badge"
                                                name="hero_badge"
                                                label="Hero subtitle / badge"
                                                value={settings.storefront?.hero_badge ?? 'New Collection'}
                                                error={errors.hero_badge}
                                            />
                                            <TextField
                                                id="sf-featured-badge"
                                                name="featured_badge"
                                                label="Featured section badge"
                                                value={settings.storefront?.featured_badge ?? 'Featured Pieces'}
                                                error={errors.featured_badge}
                                            />
                                            <TextField
                                                id="sf-featured-title"
                                                name="featured_title"
                                                label="Featured section title"
                                                value={settings.storefront?.featured_title ?? 'Featured Pieces'}
                                                error={errors.featured_title}
                                            />
                                            <TextField
                                                id="sf-featured-subtitle"
                                                name="featured_subtitle"
                                                label="Featured section subtitle"
                                                value={settings.storefront?.featured_subtitle ?? 'Handpicked styles from our latest arrivals'}
                                                error={errors.featured_subtitle}
                                            />
                                            <TextField
                                                id="sf-collections-title"
                                                name="collections_title"
                                                label="Collections section title"
                                                value={settings.storefront?.collections_title ?? 'Shop by Collection'}
                                                error={errors.collections_title}
                                            />
                                            <TextField
                                                id="sf-collections-subtitle"
                                                name="collections_subtitle"
                                                label="Collections section subtitle"
                                                value={settings.storefront?.collections_subtitle ?? 'Browse our curated categories'}
                                                error={errors.collections_subtitle}
                                            />
                                            <TextField
                                                id="sf-new-arrivals-title"
                                                name="new_arrivals_title"
                                                label="New arrivals section title"
                                                value={settings.storefront?.new_arrivals_title ?? 'New Arrivals'}
                                                error={errors.new_arrivals_title}
                                            />
                                            <TextField
                                                id="sf-new-arrivals-subtitle"
                                                name="new_arrivals_subtitle"
                                                label="New arrivals section subtitle"
                                                value={settings.storefront?.new_arrivals_subtitle ?? 'The freshest additions to our studio'}
                                                error={errors.new_arrivals_subtitle}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t">
                                        <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
                                            Value Promises / Badges
                                        </h3>
                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <TextField
                                                id="sf-p1-icon"
                                                name="promise_1_icon"
                                                label="Promise 1 Icon"
                                                value={settings.storefront?.promise_1_icon ?? '🚚'}
                                                error={errors.promise_1_icon}
                                            />
                                            <TextField
                                                id="sf-p1-title"
                                                name="promise_1_title"
                                                label="Promise 1 Title"
                                                value={settings.storefront?.promise_1_title ?? 'Nationwide Delivery'}
                                                error={errors.promise_1_title}
                                            />
                                            <TextField
                                                id="sf-p1-desc"
                                                name="promise_1_desc"
                                                label="Promise 1 Description"
                                                value={settings.storefront?.promise_1_desc ?? 'Fast & reliable shipping across Pakistan'}
                                                error={errors.promise_1_desc}
                                            />

                                            <TextField
                                                id="sf-p2-icon"
                                                name="promise_2_icon"
                                                label="Promise 2 Icon"
                                                value={settings.storefront?.promise_2_icon ?? '✂️'}
                                                error={errors.promise_2_icon}
                                            />
                                            <TextField
                                                id="sf-p2-title"
                                                name="promise_2_title"
                                                label="Promise 2 Title"
                                                value={settings.storefront?.promise_2_title ?? 'Premium Fabric'}
                                                error={errors.promise_2_title}
                                            />
                                            <TextField
                                                id="sf-p2-desc"
                                                name="promise_2_desc"
                                                label="Promise 2 Description"
                                                value={settings.storefront?.promise_2_desc ?? 'Carefully sourced quality materials'}
                                                error={errors.promise_2_desc}
                                            />

                                            <TextField
                                                id="sf-p3-icon"
                                                name="promise_3_icon"
                                                label="Promise 3 Icon"
                                                value={settings.storefront?.promise_3_icon ?? '🔄'}
                                                error={errors.promise_3_icon}
                                            />
                                            <TextField
                                                id="sf-p3-title"
                                                name="promise_3_title"
                                                label="Promise 3 Title"
                                                value={settings.storefront?.promise_3_title ?? 'Easy Returns'}
                                                error={errors.promise_3_title}
                                            />
                                            <TextField
                                                id="sf-p3-desc"
                                                name="promise_3_desc"
                                                label="Promise 3 Description"
                                                value={settings.storefront?.promise_3_desc ?? 'Hassle-free returns within 7 days'}
                                                error={errors.promise_3_desc}
                                            />

                                            <TextField
                                                id="sf-p4-icon"
                                                name="promise_4_icon"
                                                label="Promise 4 Icon"
                                                value={settings.storefront?.promise_4_icon ?? '💬'}
                                                error={errors.promise_4_icon}
                                            />
                                            <TextField
                                                id="sf-p4-title"
                                                name="promise_4_title"
                                                label="Promise 4 Title"
                                                value={settings.storefront?.promise_4_title ?? 'Customer Support'}
                                                error={errors.promise_4_title}
                                            />
                                            <TextField
                                                id="sf-p4-desc"
                                                name="promise_4_desc"
                                                label="Promise 4 Description"
                                                value={settings.storefront?.promise_4_desc ?? "We're available to help you"}
                                                error={errors.promise_4_desc}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t">
                                        <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">
                                            Newsletter & Footer
                                        </h3>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <TextField
                                                id="sf-newsletter-title"
                                                name="newsletter_title"
                                                label="Newsletter block title"
                                                value={settings.storefront?.newsletter_title ?? 'Join the SK Atelier Club'}
                                                error={errors.newsletter_title}
                                            />
                                            <TextField
                                                id="sf-newsletter-desc"
                                                name="newsletter_desc"
                                                label="Newsletter block description"
                                                value={settings.storefront?.newsletter_desc ?? 'Subscribe for private preview access, bespoke styling notes, and seasonal releases.'}
                                                error={errors.newsletter_desc}
                                            />
                                        </div>
                                        <TextareaField
                                            id="sf-footer-about"
                                            name="footer_about"
                                            label="Footer about statement"
                                            value={settings.storefront?.footer_about ?? 'Curated haute couture and ready-to-wear pieces, handcrafted with passion and timeless refinement.'}
                                            rows={3}
                                            error={errors.footer_about}
                                        />
                                        <TextField
                                            id="sf-footer-copyright"
                                            name="footer_copyright"
                                            label="Custom copyright text (leave empty for default)"
                                            value={settings.storefront?.footer_copyright ?? ''}
                                            error={errors.footer_copyright}
                                        />
                                    </div>
                                </>
                            )}
                        </SettingsForm>
                    </div>
                ) : null}

                {activeTab === 'contact' ? (
                    <div className="grid gap-6">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Contact information
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Add the details customers can use to reach your
                                business.
                            </p>
                        </div>
                        <SettingsForm group="contact">
                            {(errors) => (
                                <>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <TextField
                                            id="contact-email"
                                            name="email"
                                            label="Email"
                                            type="email"
                                            value={settings.contact.email}
                                            error={errors.email}
                                        />
                                        <TextField
                                            id="contact-phone"
                                            name="phone"
                                            label="Phone"
                                            type="tel"
                                            value={settings.contact.phone}
                                            error={errors.phone}
                                        />
                                        <TextField
                                            id="contact-alternate-phone"
                                            name="alternate_phone"
                                            label="Alternate phone"
                                            type="tel"
                                            value={
                                                settings.contact.alternate_phone
                                            }
                                            error={errors.alternate_phone}
                                        />
                                        <TextField
                                            id="contact-address"
                                            name="address"
                                            label="Address"
                                            value={settings.contact.address}
                                            error={errors.address}
                                        />
                                        <TextField
                                            id="contact-address-line-2"
                                            name="address_line_2"
                                            label="Address line 2"
                                            value={
                                                settings.contact.address_line_2
                                            }
                                            error={errors.address_line_2}
                                        />
                                    </div>
                                    <LocationFields
                                        country={country}
                                        region={region}
                                        city={city}
                                        postalCode={
                                            settings.contact.postal_code
                                        }
                                        errors={errors}
                                        onCountryChange={setCountry}
                                        onRegionChange={setRegion}
                                        onCityChange={setCity}
                                    />
                                    <TextareaField
                                        id="contact-business-hours"
                                        name="business_hours"
                                        label="Business hours"
                                        value={settings.contact.business_hours}
                                        placeholder="Monday–Friday, 9 AM–5 PM"
                                        rows={3}
                                        error={errors.business_hours}
                                    />
                                </>
                            )}
                        </SettingsForm>
                    </div>
                ) : null}

                {activeTab === 'social' ? (
                    <div className="grid gap-6">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Social links
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Add full profile URLs. Leave a field empty to
                                omit that network.
                            </p>
                        </div>
                        <SettingsForm group="social">
                            {(errors) => (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {(
                                        [
                                            ['facebook', 'Facebook'],
                                            ['instagram', 'Instagram'],
                                            ['tiktok', 'TikTok'],
                                            ['youtube', 'YouTube'],
                                            ['pinterest', 'Pinterest'],
                                            ['linkedin', 'LinkedIn'],
                                            ['x', 'X'],
                                        ] as const
                                    ).map(([name, label]) => (
                                        <TextField
                                            key={name}
                                            id={`social-${name}`}
                                            name={name}
                                            label={label}
                                            type="url"
                                            value={settings.social[name]}
                                            placeholder="https://"
                                            error={errors[name]}
                                        />
                                    ))}
                                </div>
                            )}
                        </SettingsForm>
                    </div>
                ) : null}

                {activeTab === 'mail' ? (
                    <div className="grid gap-6">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Mail configuration
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Configure SMTP delivery for application mail.
                                Stored passwords are encrypted.
                            </p>
                        </div>
                        <SettingsForm group="mail">
                            {(errors) => (
                                <>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <TextField
                                            id="mail-host"
                                            name="host"
                                            label="SMTP host"
                                            value={settings.mail.host}
                                            placeholder="smtp.example.com"
                                            required
                                            error={errors.host}
                                        />
                                        <TextField
                                            id="mail-port"
                                            name="port"
                                            label="SMTP port"
                                            type="number"
                                            value={settings.mail.port}
                                            required
                                            error={errors.port}
                                        />
                                        <SelectField
                                            id="mail-encryption"
                                            name="encryption"
                                            label="Encryption"
                                            value={settings.mail.encryption}
                                            options={[
                                                { value: 'tls', label: 'TLS' },
                                                { value: 'ssl', label: 'SSL' },
                                                {
                                                    value: 'none',
                                                    label: 'None',
                                                },
                                            ]}
                                        />
                                        <TextField
                                            id="mail-username"
                                            name="username"
                                            label="SMTP username"
                                            value={settings.mail.username}
                                            autoComplete="username"
                                            error={errors.username}
                                        />
                                        <TextField
                                            id="mail-from-address"
                                            name="from_address"
                                            label="From email"
                                            type="email"
                                            value={settings.mail.from_address}
                                            required
                                            error={errors.from_address}
                                        />
                                        <TextField
                                            id="mail-from-name"
                                            name="from_name"
                                            label="From name"
                                            value={settings.mail.from_name}
                                            required
                                            error={errors.from_name}
                                        />
                                        <div className="grid gap-2 sm:col-span-2">
                                            <Label htmlFor="mail-password">
                                                SMTP password
                                            </Label>
                                            <Input
                                                id="mail-password"
                                                name="password"
                                                type="password"
                                                autoComplete="new-password"
                                                placeholder={
                                                    settings.mail.has_password
                                                        ? 'Leave blank to keep the current password'
                                                        : 'Enter SMTP password'
                                                }
                                                aria-invalid={Boolean(
                                                    errors.password,
                                                )}
                                                aria-describedby={
                                                    errors.password
                                                        ? 'mail-password-error'
                                                        : undefined
                                                }
                                            />
                                            {errors.password ? (
                                                <InputError
                                                    id="mail-password-error"
                                                    message={errors.password}
                                                />
                                            ) : null}
                                            {settings.mail.has_password ? (
                                                <label className="flex w-fit items-center gap-2 text-sm text-muted-foreground">
                                                    <input
                                                        type="checkbox"
                                                        name="clear_password"
                                                        value="1"
                                                        className="size-4 rounded border-input accent-primary"
                                                    />
                                                    Remove saved password
                                                </label>
                                            ) : null}
                                        </div>
                                    </div>
                                </>
                            )}
                        </SettingsForm>
                    </div>
                ) : null}

                {activeTab === 'seo' ? (
                    <div className="grid gap-6">
                        <div>
                            <h2 className="text-lg font-semibold">
                                SEO & metadata
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Control how your store appears in search engines
                                and when shared on social media.
                            </p>
                        </div>
                        <SettingsForm group="seo">
                            {(errors) => (
                                <>
                                    <div>
                                        <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                            Default meta tags
                                        </h3>
                                        <div className="grid gap-4">
                                            <TextField
                                                id="seo-meta-title-template"
                                                name="meta_title_template"
                                                label="Title template"
                                                value={settings.seo.meta_title_template}
                                                placeholder="%s | %store_name%"
                                                error={errors.meta_title_template}
                                            />
                                            <div className="grid gap-2">
                                                <Label htmlFor="seo-meta-description">
                                                    Meta description
                                                </Label>
                                                <textarea
                                                    id="seo-meta-description"
                                                    name="meta_description"
                                                    rows={3}
                                                    defaultValue={settings.seo.meta_description}
                                                    maxLength={500}
                                                    placeholder="A short description of your store shown in search results (up to 160 chars recommended)."
                                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                                                    aria-invalid={Boolean(errors.meta_description)}
                                                />
                                                {errors.meta_description && (
                                                    <InputError message={String(errors.meta_description)} />
                                                )}
                                            </div>
                                            <TextField
                                                id="seo-meta-keywords"
                                                name="meta_keywords"
                                                label="Default meta keywords"
                                                value={settings.seo.meta_keywords ?? ''}
                                                placeholder="haute couture, designer fashion, bespoke atelier"
                                                error={errors.meta_keywords}
                                            />
                                            <TextField
                                                id="seo-canonical-url"
                                                name="canonical_url"
                                                label="Canonical URL"
                                                type="url"
                                                value={settings.seo.canonical_url}
                                                placeholder="https://yourstore.com"
                                                error={errors.canonical_url}
                                            />
                                            <div className="grid gap-2 sm:max-w-xs">
                                                <SelectField
                                                    id="seo-robots"
                                                    name="robots"
                                                    label="Robots directive"
                                                    value={settings.seo.robots || 'index, follow'}
                                                    options={[
                                                        { value: 'index, follow', label: 'index, follow' },
                                                        { value: 'noindex, follow', label: 'noindex, follow' },
                                                        { value: 'index, nofollow', label: 'index, nofollow' },
                                                        { value: 'noindex, nofollow', label: 'noindex, nofollow' },
                                                    ]}
                                                    error={errors.robots}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Home Page SEO */}
                                    <div className="border-t pt-4">
                                        <h3 className="mb-1 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                            Home Page SEO
                                        </h3>
                                        <p className="mb-3 text-xs text-muted-foreground">
                                            Custom SEO metadata for your storefront homepage (<code>/</code>).
                                        </p>
                                        <div className="grid gap-4">
                                            <TextField
                                                id="seo-home-title"
                                                name="home_title"
                                                label="Home meta title"
                                                value={settings.seo.home_title ?? ''}
                                                placeholder="SK Couture House | Haute Couture & Bespoke Luxury Fashion"
                                                error={errors.home_title}
                                            />
                                            <div className="grid gap-2">
                                                <Label htmlFor="seo-home-description">
                                                    Home meta description
                                                </Label>
                                                <textarea
                                                    id="seo-home-description"
                                                    name="home_description"
                                                    rows={3}
                                                    defaultValue={settings.seo.home_description ?? ''}
                                                    maxLength={500}
                                                    placeholder="A short description of your home page shown in search results."
                                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                                                    aria-invalid={Boolean(errors.home_description)}
                                                />
                                                {errors.home_description && (
                                                    <InputError message={String(errors.home_description)} />
                                                )}
                                            </div>
                                            <TextField
                                                id="seo-home-keywords"
                                                name="home_keywords"
                                                label="Home meta keywords"
                                                value={settings.seo.home_keywords ?? ''}
                                                placeholder="haute couture, evening gowns, bridal, bespoke"
                                                error={errors.home_keywords}
                                            />
                                        </div>
                                    </div>

                                    {/* All Collections Page SEO */}
                                    <div className="border-t pt-4">
                                        <h3 className="mb-1 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                            All Collections Page SEO
                                        </h3>
                                        <p className="mb-3 text-xs text-muted-foreground">
                                            Custom SEO metadata for the catalogue overview page (<code>/collections</code>). Individual collections have their own SEO.
                                        </p>
                                        <div className="grid gap-4">
                                            <TextField
                                                id="seo-collections-title"
                                                name="collections_title"
                                                label="Collections meta title"
                                                value={settings.seo.collections_title ?? ''}
                                                placeholder="Designer Collections | SK Couture House"
                                                error={errors.collections_title}
                                            />
                                            <div className="grid gap-2">
                                                <Label htmlFor="seo-collections-description">
                                                    Collections meta description
                                                </Label>
                                                <textarea
                                                    id="seo-collections-description"
                                                    name="collections_description"
                                                    rows={3}
                                                    defaultValue={settings.seo.collections_description ?? ''}
                                                    maxLength={500}
                                                    placeholder="Explore our curated seasonal edits and signature luxury collections."
                                                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                                                    aria-invalid={Boolean(errors.collections_description)}
                                                />
                                                {errors.collections_description && (
                                                    <InputError message={String(errors.collections_description)} />
                                                )}
                                            </div>
                                            <TextField
                                                id="seo-collections-keywords"
                                                name="collections_keywords"
                                                label="Collections meta keywords"
                                                value={settings.seo.collections_keywords ?? ''}
                                                placeholder="collections, pret, bridal couture, designer edits"
                                                error={errors.collections_keywords}
                                            />
                                        </div>
                                    </div>

                                    {/* Cart & Checkout Pages SEO */}
                                    <div className="border-t pt-4">
                                        <h3 className="mb-1 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                            Cart & Checkout Pages SEO
                                        </h3>
                                        <p className="mb-3 text-xs text-muted-foreground">
                                            Custom titles and descriptions for transactional pages.
                                        </p>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="grid gap-4">
                                                <TextField
                                                    id="seo-cart-title"
                                                    name="cart_title"
                                                    label="Cart page title"
                                                    value={settings.seo.cart_title ?? ''}
                                                    placeholder="Shopping Bag | SK Couture House"
                                                    error={errors.cart_title}
                                                />
                                                <TextField
                                                    id="seo-cart-description"
                                                    name="cart_description"
                                                    label="Cart meta description"
                                                    value={settings.seo.cart_description ?? ''}
                                                    placeholder="Review your selected couture pieces."
                                                    error={errors.cart_description}
                                                />
                                            </div>
                                            <div className="grid gap-4">
                                                <TextField
                                                    id="seo-checkout-title"
                                                    name="checkout_title"
                                                    label="Checkout page title"
                                                    value={settings.seo.checkout_title ?? ''}
                                                    placeholder="Secure Checkout | SK Couture House"
                                                    error={errors.checkout_title}
                                                />
                                                <TextField
                                                    id="seo-checkout-description"
                                                    name="checkout_description"
                                                    label="Checkout meta description"
                                                    value={settings.seo.checkout_description ?? ''}
                                                    placeholder="Complete your order securely."
                                                    error={errors.checkout_description}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                            Open Graph (social sharing)
                                        </h3>
                                        <div className="grid gap-4">
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <TextField
                                                    id="seo-og-title"
                                                    name="og_title"
                                                    label="OG title"
                                                    value={settings.seo.og_title}
                                                    placeholder="Your store name or headline"
                                                    error={errors.og_title}
                                                />
                                                <div className="grid gap-2">
                                                    <Label htmlFor="seo-og-description">
                                                        OG description
                                                    </Label>
                                                    <textarea
                                                        id="seo-og-description"
                                                        name="og_description"
                                                        rows={3}
                                                        defaultValue={settings.seo.og_description}
                                                        maxLength={500}
                                                        placeholder="Description shown when your site is shared on social media."
                                                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
                                                        aria-invalid={Boolean(errors.og_description)}
                                                    />
                                                    {errors.og_description && (
                                                        <InputError message={String(errors.og_description)} />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="grid gap-3 rounded-lg border p-4">
                                                <input
                                                    type="hidden"
                                                    name="og_image_path"
                                                    value={ogImage.path ?? ''}
                                                />
                                                <div className="flex items-center gap-4">
                                                    {ogImage.url ? (
                                                        <img
                                                            src={ogImage.url}
                                                            alt="OG image preview"
                                                            className="size-14 rounded-md border bg-background object-contain p-1"
                                                        />
                                                    ) : (
                                                        <div className="grid size-14 place-items-center rounded-md border bg-muted text-xs text-muted-foreground">
                                                            None
                                                        </div>
                                                    )}
                                                    <div className="grid gap-1">
                                                        <p className="text-sm font-medium">OG image</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Recommended size: 1200×630 px.
                                                        </p>
                                                    </div>
                                                </div>
                                                {ogImage.title ? (
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {ogImage.title}
                                                    </p>
                                                ) : null}
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        disabled={!canUpdate}
                                                        onClick={() => setActivePicker('og_image')}
                                                    >
                                                        <ImagePlus aria-hidden="true" />
                                                        Choose from gallery
                                                    </Button>
                                                    {ogImage.path ? (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            disabled={!canUpdate}
                                                            onClick={() =>
                                                                setOgImage({ path: null, url: null, title: null })
                                                            }
                                                            aria-label="Remove OG image"
                                                        >
                                                            <X aria-hidden="true" />
                                                            Remove
                                                        </Button>
                                                    ) : null}
                                                </div>
                                                {errors.og_image_path ? (
                                                    <InputError message={String(errors.og_image_path)} />
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                            Analytics
                                        </h3>
                                        <TextField
                                            id="seo-ga-id"
                                            name="google_analytics_id"
                                            label="Google Analytics ID"
                                            value={settings.seo.google_analytics_id}
                                            placeholder="G-XXXXXXXXXX"
                                            error={errors.google_analytics_id}
                                        />
                                    </div>
                                </>
                            )}
                        </SettingsForm>
                    </div>
                ) : null}

                {activeTab === 'variants' ? (
                    <div className="grid gap-6">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Product variants
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Create reusable product options and their
                                allowed values.
                            </p>
                        </div>
                        <SettingsForm group="variants">
                            {(errors, disabled) => (
                                <VariantEditor
                                    variants={variants}
                                    onChange={setVariants}
                                    disabled={disabled}
                                    error={
                                        Object.entries(errors).find(
                                            ([field]) =>
                                                field === 'variants' ||
                                                field.startsWith('variants.'),
                                        )?.[1]
                                    }
                                />
                            )}
                        </SettingsForm>
                    </div>
                ) : null}
            </section>
            <GalleryPicker
                mode="dialog"
                open={activePicker !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setActivePicker(null);
                    }
                }}
                selectionMode="single"
                allowedCategories={['image']}
                onSelect={selectGalleryImage}
            />
        </div>
    );
}

Settings.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Platform settings', href: '/settings/platform' },
    ],
};
