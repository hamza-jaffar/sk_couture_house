import {
    edit,
    index,
} from "@/actions/Modules/Product/Http/Controller/ProductController";
import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import type { ProductRecord } from "@/types";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    CalendarRange,
    ExternalLink,
    ImageIcon,
    Layers,
    Pencil,
    Star,
} from "lucide-react";
import { useState } from "react";

type Props = {
    product: ProductRecord;
};

const STATUS_STYLES: Record<ProductRecord["status"], string> = {
    published: "bg-green-500/15 text-green-600 dark:text-green-400",
    draft: "bg-muted text-muted-foreground",
    archived: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
};

export default function ShowProduct({ product }: Props) {
    const { settings, orderTypeOptions } = usePage().props;
    const [activeImage, setActiveImage] = useState(0);
    const hasImages = product.images.length > 0;
    const isVariable = product.type === "variable";

    const orderTypeLabel =
        orderTypeOptions.find(
            (opt) => opt.value === product.effective_order_type,
        )?.label ?? product.effective_order_type;

    const now = new Date();
    const saleActive =
        !!product.sale_price &&
        (!product.sale_start_at || new Date(product.sale_start_at) <= now) &&
        (!product.sale_end_at || new Date(product.sale_end_at) >= now);
    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title={product.title} />

            {/* ── Page header ── */}
            <header className="flex flex-wrap items-start justify-between gap-4">
                <Heading
                    title={product.title}
                    description={`/${product.slug}`}
                />
                <div className="flex shrink-0 items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.visit(index.url())}
                    >
                        Back to products
                    </Button>
                    <Link href={edit.url(product.slug)}>
                        <Button>
                            <Pencil className="size-4" />
                            Edit product
                        </Button>
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
                {/* ══════════════════════════════
                    LEFT COLUMN
                ══════════════════════════════ */}
                <div className="flex flex-col gap-6">
                    {/* ── Images ── */}
                    <section className="grid gap-4 rounded-xl border p-4">
                        <h3 className="font-semibold">Images</h3>

                        {hasImages ? (
                            <div className="grid gap-3">
                                {/* Main preview */}
                                <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted">
                                    <img
                                        src={
                                            product.images[activeImage].url ??
                                            ""
                                        }
                                        alt={`${product.title} — image ${activeImage + 1}`}
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                                {/* Thumbnails */}
                                {product.images.length > 1 && (
                                    <div className="flex flex-wrap gap-2">
                                        {product.images.map((img, i) => (
                                            <button
                                                key={img.path}
                                                type="button"
                                                onClick={() =>
                                                    setActiveImage(i)
                                                }
                                                className={[
                                                    "size-16 overflow-hidden rounded-lg border-2 transition-all",
                                                    i === activeImage
                                                        ? "border-primary ring-2 ring-ring/30"
                                                        : "border-transparent opacity-60 hover:opacity-100",
                                                ].join(" ")}
                                            >
                                                <img
                                                    src={img.url ?? ""}
                                                    alt={`Thumbnail ${i + 1}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground">
                                <ImageIcon className="size-7 opacity-40" />
                                <p className="text-sm">No images uploaded</p>
                            </div>
                        )}
                    </section>

                    {/* ── Short description ── */}
                    {product.short_description && (
                        <section className="grid gap-3 rounded-xl border p-4">
                            <h3 className="font-semibold">Summary</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                {product.short_description}
                            </p>
                        </section>
                    )}

                    {/* ── Full description ── */}
                    <section className="grid gap-3 rounded-xl border p-4">
                        <h3 className="font-semibold">Description</h3>
                        {product.description ? (
                            <div
                                className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed"
                                dangerouslySetInnerHTML={{
                                    __html: product.description,
                                }}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No description provided.
                            </p>
                        )}
                    </section>

                    {/* ── Variants table ── */}
                    {isVariable && product.variants.length > 0 && (
                        <section className="grid gap-4 rounded-xl border p-4">
                            <div className="flex items-center gap-2">
                                <Layers className="size-4 text-muted-foreground" />
                                <h3 className="font-semibold">
                                    Variants
                                    <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                                        {product.variants_count}
                                    </span>
                                </h3>
                            </div>
                            {product.variant_options &&
                                product.variant_options.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {product.variant_options.map((opt) => (
                                            <div
                                                key={opt.name}
                                                className="rounded-lg bg-muted/60 px-3 py-1.5 text-xs"
                                            >
                                                <span className="font-medium">
                                                    {opt.name}:
                                                </span>{" "}
                                                <span className="text-muted-foreground">
                                                    {opt.values.join(", ")}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/40">
                                        <tr className="text-left text-xs font-medium text-muted-foreground">
                                            <th className="px-4 py-2.5">
                                                Variant
                                            </th>
                                            <th className="px-4 py-2.5">
                                                Attributes
                                            </th>
                                            <th className="px-4 py-2.5 text-right">
                                                SKU
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {product.variants.map((variant) => (
                                            <tr
                                                key={variant.sku}
                                                className="hover:bg-muted/20 transition-colors"
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    {variant.name}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                    {variant.attributes &&
                                                        Object.entries(
                                                            variant.attributes,
                                                        )
                                                            .map(
                                                                ([k, v]) =>
                                                                    `${k}: ${v}`,
                                                            )
                                                            .join(", ")}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground text-right">
                                                    {variant.sku}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* ── SEO metadata ── */}
                    {(product.meta_title ||
                        product.meta_description ||
                        product.meta_keywords ||
                        product.canonical_url ||
                        product.og_title) && (
                        <section className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
                            <h3 className="font-semibold sm:col-span-2">
                                Search &amp; social metadata
                            </h3>
                            {[
                                ["Meta title", product.meta_title],
                                ["Meta description", product.meta_description],
                                ["Meta keywords", product.meta_keywords],
                                ["Social title", product.og_title],
                                ["Social description", product.og_description],
                                ["Robots", product.robots_meta],
                            ].map(
                                ([label, value]) =>
                                    value && (
                                        <div key={label} className="grid gap-1">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                {label}
                                            </p>
                                            <p className="text-sm">{value}</p>
                                        </div>
                                    ),
                            )}
                            {product.canonical_url && (
                                <div className="grid gap-1 sm:col-span-2">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Canonical URL
                                    </p>
                                    <a
                                        href={product.canonical_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-sm text-primary underline underline-offset-2"
                                    >
                                        {product.canonical_url}
                                        <ExternalLink className="size-3 shrink-0" />
                                    </a>
                                </div>
                            )}
                            {product.og_image_url && (
                                <div className="grid gap-2 sm:col-span-2">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Social preview image
                                    </p>
                                    <img
                                        src={product.og_image_url}
                                        alt="OG preview"
                                        className="h-28 w-auto rounded-lg border object-cover"
                                    />
                                </div>
                            )}
                        </section>
                    )}
                </div>

                {/* ══════════════════════════════
                    RIGHT SIDEBAR
                ══════════════════════════════ */}
                <div className="flex flex-col gap-4">
                    {/* ── Status & overview ── */}
                    <section className="grid gap-4 rounded-xl border p-4">
                        <h3 className="font-semibold">Overview</h3>

                        <div className="grid gap-3 text-sm">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">
                                    Status
                                </span>
                                {product.deleted_at ? (
                                    <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                                        In trash
                                    </span>
                                ) : (
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[product.status]}`}
                                    >
                                        {product.status}
                                    </span>
                                )}
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">
                                    Type
                                </span>
                                <span className="font-medium capitalize">
                                    {product.type}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">
                                    Order Type
                                </span>
                                <span className="font-medium capitalize">
                                    {orderTypeLabel}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">
                                    Collection
                                </span>
                                <span className="font-medium">
                                    {product.category?.name ?? (
                                        <span className="font-normal text-muted-foreground">
                                            None
                                        </span>
                                    )}
                                </span>
                            </div>

                            {product.is_featured && (
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-muted-foreground">
                                        Featured
                                    </span>
                                    <span className="inline-flex items-center gap-1 font-medium text-amber-500">
                                        <Star className="size-3.5 fill-amber-500" />
                                        Yes
                                    </span>
                                </div>
                            )}

                            <Separator />

                            <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">
                                    Created
                                </span>
                                <span className="text-xs">
                                    {product.created_at.slice(0, 10)}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* ── Pricing ── */}
                    <section className="grid gap-4 rounded-xl border p-4">
                        <h3 className="font-semibold">Pricing</h3>

                        <div className="grid gap-3 text-sm">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">
                                    Regular price
                                </span>
                                <span className="font-semibold">
                                    {formatPrice(
                                        product.price,
                                        settings.general.currency_icon,
                                    )}
                                </span>
                            </div>

                            {product.sale_price && (
                                <>
                                    <Separator />
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-muted-foreground">
                                            Sale price
                                        </span>
                                        <span
                                            className={`font-semibold ${saleActive ? "text-green-600 dark:text-green-400" : ""}`}
                                        >
                                            {formatPrice(
                                                product.sale_price,
                                                settings.general.currency_icon,
                                            )}
                                            {saleActive && (
                                                <span className="ml-1.5 rounded-full bg-green-500/10 px-1.5 py-0.5 text-xs font-normal text-green-600 dark:text-green-400">
                                                    Active
                                                </span>
                                            )}
                                        </span>
                                    </div>

                                    {(product.sale_start_at ||
                                        product.sale_end_at) && (
                                        <div className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2.5">
                                            <CalendarRange className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                                            <div className="grid gap-0.5 text-xs">
                                                {product.sale_start_at && (
                                                    <span>
                                                        From{" "}
                                                        <strong>
                                                            {product.sale_start_at.slice(
                                                                0,
                                                                10,
                                                            )}
                                                        </strong>
                                                    </span>
                                                )}
                                                {product.sale_end_at && (
                                                    <span>
                                                        Until{" "}
                                                        <strong>
                                                            {product.sale_end_at.slice(
                                                                0,
                                                                10,
                                                            )}
                                                        </strong>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </section>

                    {/* ── Inventory ── */}
                    <section className="grid gap-4 rounded-xl border p-4">
                        <h3 className="font-semibold">Inventory</h3>

                        <div className="grid gap-3 text-sm">
                            {!isVariable && product.sku && (
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-muted-foreground">
                                        SKU
                                    </span>
                                    <span className="font-mono text-xs">
                                        {product.sku}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">
                                    {isVariable ? "Total stock" : "Stock"}
                                </span>
                                <span
                                    className={`font-semibold ${product.stock === 0 ? "text-destructive" : ""}`}
                                >
                                    {product.stock}
                                    {product.stock === 0 && (
                                        <span className="ml-1.5 text-xs font-normal">
                                            Out of stock
                                        </span>
                                    )}
                                </span>
                            </div>

                            {isVariable && (
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-muted-foreground">
                                        Variants
                                    </span>
                                    <span className="font-medium">
                                        {product.variants_count}
                                    </span>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

ShowProduct.layout = {
    breadcrumbs: [
        { title: "Dashboard", href: "/dashboard" },
        { title: "Products", href: "/dashboard/product" },
        { title: "View", href: "#" },
    ],
};
