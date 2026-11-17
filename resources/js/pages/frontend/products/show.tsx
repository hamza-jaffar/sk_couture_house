import Navbar from '@/components/frontend/navbar';
import { Head, Link } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Heart,
    Minus,
    Plus,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CategoryInfo {
    id: number;
    name: string;
    slug: string;
    parent?: {
        name: string;
        slug: string;
    } | null;
}

interface ProductVariant {
    id: number;
    sku: string | null;
    price: number;
    sale_price: number | null;
    stock: number;
    option_values?: Record<string, string> | null;
    image_url: string | null;
}

interface ProductDetail {
    id: number;
    title: string;
    slug: string;
    short_description: string | null;
    description: string | null;
    product_specifications: string | null;
    care_instructions: string | null;
    price: number;
    sale_price: number | null;
    sku: string | null;
    stock: number;
    type: string;
    images: string[];
    variant_options: Array<{ name: string; values: string[] }>;
    variants: ProductVariant[];
    category: CategoryInfo | null;
}

interface RecommendedProduct {
    id: number;
    title: string;
    slug: string;
    price: number;
    sale_price: number | null;
    brand: string;
    images: string[];
    category: { name: string; slug: string } | null;
}

interface Props {
    product: ProductDetail;
    recommended: RecommendedProduct[];
    shipping_and_return?: string;
}

// ─── Currency Formatter ───────────────────────────────────────────────────────

function formatPrice(amount: number): string {
    return `Rs.${amount.toLocaleString('en-PK')}`;
}

// ─── Accordion Section Component ──────────────────────────────────────────────

function AccordionItem({
    title,
    children,
    defaultOpen = false,
}: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-neutral-200">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-neutral-900 transition-colors hover:text-black"
            >
                <span>{title}</span>
                {open ? (
                    <Minus className="h-4 w-4 shrink-0 text-neutral-500" />
                ) : (
                    <Plus className="h-4 w-4 shrink-0 text-neutral-500" />
                )}
            </button>
            {open && (
                <div className="pb-5 pt-1 text-[13px] leading-relaxed text-neutral-600">
                    {children}
                </div>
            )}
        </div>
    );
}

// ─── Size Chart Modal ─────────────────────────────────────────────────────────

function SizeChartModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />
            <div className="relative z-10 w-full max-w-lg bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                        Size Chart
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-neutral-400 hover:text-black transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <p className="mt-3 text-xs text-neutral-500">
                    Measurements are listed in inches. Sizing may vary slightly per silhouette.
                </p>

                <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-xs text-neutral-700">
                        <thead className="border-b border-neutral-200 bg-neutral-50 uppercase text-[10px] font-semibold tracking-wider text-neutral-500">
                            <tr>
                                <th className="px-4 py-2.5">Size</th>
                                <th className="px-4 py-2.5">Bust</th>
                                <th className="px-4 py-2.5">Waist</th>
                                <th className="px-4 py-2.5">Hips</th>
                                <th className="px-4 py-2.5">Length</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {[
                                { size: 'XS', bust: '34"', waist: '28"', hip: '38"', length: '54"' },
                                { size: 'S', bust: '36"', waist: '30"', hip: '40"', length: '54"' },
                                { size: 'M', bust: '39"', waist: '33"', hip: '43"', length: '55"' },
                                { size: 'L', bust: '42"', waist: '36"', hip: '46"', length: '55"' },
                                { size: 'XL', bust: '45"', waist: '39"', hip: '49"', length: '56"' },
                            ].map((row) => (
                                <tr key={row.size} className="hover:bg-neutral-50/50">
                                    <td className="px-4 py-2.5 font-bold text-neutral-900">
                                        {row.size}
                                    </td>
                                    <td className="px-4 py-2.5">{row.bust}</td>
                                    <td className="px-4 py-2.5">{row.waist}</td>
                                    <td className="px-4 py-2.5">{row.hip}</td>
                                    <td className="px-4 py-2.5">{row.length}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-neutral-900 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-black transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Product Detail Page ─────────────────────────────────────────────────

export default function ProductShow({
    product,
    recommended = [],
    shipping_and_return = '',
}: Props) {
    // Product Images
    const rawImages = product.images ?? [];
    const images = rawImages.length > 0 ? rawImages : [];
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Quantity state
    const [quantity, setQuantity] = useState(1);

    // Sizes
    const sizeOptions = useMemo(() => {
        const found = product.variant_options?.find((opt) =>
            /size/i.test(opt.name),
        );
        return found?.values?.length ? found.values : ['XS', 'S', 'M', 'L', 'XL'];
    }, [product.variant_options]);

    const [selectedSize, setSelectedSize] = useState<string>(sizeOptions[0] ?? 'XS');

    // Description expand toggle
    const [isExpanded, setIsExpanded] = useState(false);

    // Size chart modal
    const [sizeChartOpen, setSizeChartOpen] = useState(false);

    // Recommendations carousel
    const [recPageIndex, setRecPageIndex] = useState(0);
    const recsPerPage = 4;
    const totalRecPages = Math.ceil(recommended.length / recsPerPage) || 1;

    const currentRecs = useMemo(() => {
        const start = recPageIndex * recsPerPage;
        return recommended.slice(start, start + recsPerPage);
    }, [recommended, recPageIndex]);

    const handlePrevRec = () => {
        setRecPageIndex((prev) => (prev > 0 ? prev - 1 : totalRecPages - 1));
    };

    const handleNextRec = () => {
        setRecPageIndex((prev) => (prev + 1 < totalRecPages ? prev + 1 : 0));
    };

    // Breadcrumb Info
    const collectionName = product.category?.name ?? 'Collection';
    const collectionSlug = product.category?.slug;

    return (
        <>
            <Head title={`${product.title} — SK Couture`} />
            <div className="min-h-screen overflow-x-hidden bg-white text-neutral-900">
                <Navbar />

                <main className="mx-auto max-w-[1360px] px-4 pt-4 pb-16 sm:px-6 lg:px-10">
                    {/* ─── Breadcrumb ────────────────────────────────────────────── */}
                    <nav className="mb-6 flex items-center gap-1.5 text-xs text-neutral-500">
                        <Link href="/" className="hover:text-neutral-900 transition-colors">
                            Home
                        </Link>
                        <span className="text-neutral-400">/</span>
                        {collectionSlug ? (
                            <Link
                                href={`/collections/${collectionSlug}`}
                                className="hover:text-neutral-900 transition-colors"
                            >
                                {collectionName}
                            </Link>
                        ) : (
                            <span>{collectionName}</span>
                        )}
                        <span className="text-neutral-400">/</span>
                        <span className="text-neutral-800">{product.title}</span>
                    </nav>

                    {/* ─── Main Product Showcase Grid ────────────────────────────── */}
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
                        {/* ─── Left Column: Gallery (7 of 12 cols) ───────────────────── */}
                        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-3.5 items-start">
                            {/* Vertical Thumbnail Strip on Left */}
                            {images.length > 1 ? (
                                <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto w-full sm:w-28 shrink-0 pb-2 sm:pb-0 scrollbar-none">
                                    {images.map((imgUrl, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setSelectedImageIdx(idx)}
                                            onMouseEnter={() => setSelectedImageIdx(idx)}
                                            className={[
                                                'relative aspect-[3/4] w-20 sm:w-full shrink-0 overflow-hidden bg-neutral-100 transition-all cursor-pointer',
                                                selectedImageIdx === idx
                                                    ? 'border border-neutral-900'
                                                    : 'border border-transparent opacity-80 hover:opacity-100',
                                            ].join(' ')}
                                        >
                                            <img
                                                src={imgUrl}
                                                alt={`${product.title} view ${idx + 1}`}
                                                className="h-full w-full object-cover object-top"
                                            />
                                        </button>
                                    ))}
                                </div>
                            ) : null}

                            {/* Main Active Image Viewport */}
                            <div className="relative flex-1 aspect-[3/4] w-full overflow-hidden bg-neutral-100">
                                {images.length > 0 ? (
                                    <img
                                        src={images[selectedImageIdx] ?? images[0]}
                                        alt={product.title}
                                        className="h-full w-full object-cover object-top transition-transform duration-700 ease-out hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-neutral-50 text-xs font-medium tracking-widest text-neutral-400 uppercase">
                                        No Image Available
                                    </div>
                                )}

                                {/* Wishlist Heart Icon Button */}
                                <button
                                    type="button"
                                    onClick={() => setIsWishlisted(!isWishlisted)}
                                    className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/90 shadow-sm transition-transform hover:scale-110 active:scale-95"
                                    aria-label="Wishlist"
                                >
                                    <Heart
                                        className={[
                                            'size-4.5 transition-colors',
                                            isWishlisted
                                                ? 'fill-rose-500 text-rose-500'
                                                : 'text-neutral-700',
                                        ].join(' ')}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* ─── Right Column: Details & Purchase (5 of 12 cols) ──────── */}
                        <div className="lg:col-span-5 flex flex-col justify-start">
                            {/* Collection Line + View Collection Link */}
                            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                                <span>{collectionName}</span>
                                {collectionSlug && (
                                    <Link
                                        href={`/collections/${collectionSlug}`}
                                        className="text-[#c026d3] hover:text-[#a21caf] underline underline-offset-2 transition-colors ml-1"
                                    >
                                        View collection
                                    </Link>
                                )}
                            </div>

                            {/* Title & Price Row */}
                            <div className="mt-2.5 flex items-start justify-between gap-4">
                                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
                                    {product.title}
                                </h1>
                                <div className="text-right shrink-0">
                                    <div className="text-xl font-bold text-neutral-900 sm:text-2xl">
                                        {formatPrice(product.sale_price ?? product.price)}
                                    </div>
                                    <div className="text-[11px] text-neutral-400">
                                        Tax included.
                                    </div>
                                </div>
                            </div>

                            {/* Description text with Read More */}
                            <div className="mt-5 text-[13px] leading-relaxed text-neutral-600">
                                <div className={!isExpanded ? 'line-clamp-3' : undefined}>
                                    {product.description ? (
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: product.description,
                                            }}
                                        />
                                    ) : product.short_description ? (
                                        <p>{product.short_description}</p>
                                    ) : (
                                        <p>
                                            This exclusive piece is encrusted with thoughtfully composed motifs
                                            and fine luxury fabrics tailored for an effortless silhouette.
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="mt-1 text-xs font-semibold text-neutral-900 underline underline-offset-2 hover:text-neutral-600"
                                >
                                    {isExpanded ? 'Read Less' : 'Read More'}
                                </button>
                            </div>

                            {/* Size Selection */}
                            <div className="mt-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-neutral-900">
                                        Size:
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setSizeChartOpen(true)}
                                        className="text-xs font-medium text-[#c026d3] hover:text-[#a21caf] underline underline-offset-2 transition-colors"
                                    >
                                        Size chart
                                    </button>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {sizeOptions.map((size) => {
                                        const isSelected = selectedSize === size;
                                        return (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => setSelectedSize(size)}
                                                className={[
                                                    'w-11 h-10 flex items-center justify-center text-xs font-semibold transition-all',
                                                    isSelected
                                                        ? 'border-2 border-neutral-900 text-neutral-900 bg-white'
                                                        : 'border border-neutral-300 text-neutral-700 bg-white hover:border-neutral-500',
                                                ].join(' ')}
                                            >
                                                {size}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="mt-2 text-xs text-neutral-400">
                                    Model is wearing small size.
                                </p>
                            </div>

                            {/* Quantity & ADD TO BAG */}
                            <div className="mt-6 flex items-stretch gap-3">
                                {/* Quantity box with up/down arrows */}
                                <div className="relative flex h-12 w-20 shrink-0 items-center justify-between border border-neutral-300 bg-white px-3">
                                    <span className="text-sm font-semibold text-neutral-900">
                                        {quantity}
                                    </span>
                                    <div className="flex flex-col gap-0.5">
                                        <button
                                            type="button"
                                            onClick={() => setQuantity((q) => q + 1)}
                                            className="text-neutral-500 hover:text-black transition-colors"
                                            aria-label="Increase"
                                        >
                                            <ChevronUp className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                            className="text-neutral-500 hover:text-black transition-colors"
                                            aria-label="Decrease"
                                        >
                                            <ChevronDown className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* ADD TO BAG Button */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        alert(`Added ${quantity} item(s) to bag.`);
                                    }}
                                    className="h-12 flex-1 bg-[#3a3a3a] text-center text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-black active:scale-[0.99] flex items-center justify-center"
                                >
                                    Add to bag
                                </button>
                            </div>

                            {/* Accordions */}
                            <div className="mt-8 border-t border-neutral-200">
                                {/* Product Specifications */}
                                <AccordionItem title="Product Specifications">
                                    {product.product_specifications ? (
                                        <div className="whitespace-pre-line text-neutral-600">
                                            {product.product_specifications}
                                        </div>
                                    ) : (
                                        <ul className="list-inside list-disc space-y-1.5 text-neutral-600">
                                            <li>Fabric: Pure Raw Silk / Handloom Cotton blend</li>
                                            <li>Workmanship: Hand-embellished crystal & thread accents</li>
                                            <li>Fit: Contemporary relaxed couture silhouette</li>
                                            <li>Includes: Garment piece with bespoke signature garment bag</li>
                                        </ul>
                                    )}
                                </AccordionItem>

                                {/* Care Instructions */}
                                <AccordionItem title="Care Instructions">
                                    {product.care_instructions ? (
                                        <div className="whitespace-pre-line text-neutral-600">
                                            {product.care_instructions}
                                        </div>
                                    ) : (
                                        <ul className="list-inside list-disc space-y-1.5 text-neutral-600">
                                            <li>Dry clean only. Do not wash with water.</li>
                                            <li>Handle delicate hand-worked crystal embroidery with care.</li>
                                            <li>Iron at low temperature using a cloth barrier or steam iron.</li>
                                            <li>Store in a clean, dry, breathable garment bag.</li>
                                        </ul>
                                    )}
                                </AccordionItem>

                                {/* Shipping & Return */}
                                <AccordionItem title="Shipping & Return">
                                    {shipping_and_return ? (
                                        <div className="whitespace-pre-line text-neutral-600">
                                            {shipping_and_return}
                                        </div>
                                    ) : (
                                        <div className="space-y-2 text-neutral-600">
                                            <p>
                                                <strong>Domestic Delivery:</strong> Dispatched within 5–7 working days across Pakistan.
                                            </p>
                                            <p>
                                                <strong>International Delivery:</strong> Worldwide express delivery delivered in 8–12 business days.
                                            </p>
                                            <p>
                                                <strong>Exchange Policy:</strong> Unworn items with original tags are eligible for exchange within 7 days of delivery. Custom-sized items are final sale.
                                            </p>
                                        </div>
                                    )}
                                </AccordionItem>
                            </div>
                        </div>
                    </div>

                    {/* ─── Bottom Section: Product Recommendations ───────────────── */}
                    {recommended.length > 0 && (
                        <section className="relative mt-24 border-t border-neutral-200 pt-14">
                            <h2 className="mb-8 text-base font-bold uppercase tracking-widest text-neutral-900">
                                Product Recommendations
                            </h2>

                            {/* Left & Right Carousel Arrows */}
                            {totalRecPages > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handlePrevRec}
                                        aria-label="Previous"
                                        className="absolute -left-3 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white shadow-md border border-neutral-200 text-neutral-700 hover:text-black hover:bg-neutral-50 transition-all"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleNextRec}
                                        aria-label="Next"
                                        className="absolute -right-3 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white shadow-md border border-neutral-200 text-neutral-700 hover:text-black hover:bg-neutral-50 transition-all"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </>
                            )}

                            {/* 4 Cards in Row */}
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:gap-6">
                                {currentRecs.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/products/${item.slug}`}
                                        className="group block"
                                    >
                                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
                                            {item.images && item.images.length > 0 ? (
                                                <img
                                                    src={item.images[0]}
                                                    alt={item.title}
                                                    className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-xs uppercase text-neutral-400">
                                                    No Image
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3 space-y-0.5">
                                            <p className="line-clamp-1 text-sm font-semibold text-neutral-900 group-hover:underline underline-offset-2">
                                                {item.title}
                                            </p>
                                            <p className="text-xs uppercase tracking-wider text-neutral-500">
                                                {item.brand}
                                            </p>
                                            <p className="pt-0.5 text-sm font-bold text-neutral-900">
                                                {formatPrice(item.sale_price ?? item.price)}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Indicator Dots */}
                            {totalRecPages > 1 && (
                                <div className="mt-8 flex justify-center gap-2">
                                    {Array.from({ length: totalRecPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setRecPageIndex(i)}
                                            aria-label={`Slide ${i + 1}`}
                                            className={[
                                                'h-1.5 rounded-full transition-all duration-300',
                                                recPageIndex === i
                                                    ? 'w-4 bg-neutral-900'
                                                    : 'w-1.5 bg-neutral-300 hover:bg-neutral-500',
                                            ].join(' ')}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    )}
                </main>
            </div>

            {/* Size Chart Modal */}
            <SizeChartModal
                isOpen={sizeChartOpen}
                onClose={() => setSizeChartOpen(false)}
            />
        </>
    );
}
