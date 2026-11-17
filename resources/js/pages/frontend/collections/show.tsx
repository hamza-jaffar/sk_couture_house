import Navbar from '@/components/frontend/navbar';
import { Deferred, Head, InfiniteScroll, Link, router } from '@inertiajs/react';
import { ChevronDown, Minus, Plus } from 'lucide-react';
import { useCallback, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CategoryParent {
    name: string;
    slug: string;
}

interface Collection {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    banner_url: string | null;
    parent: CategoryParent | null;
}

interface Product {
    id: number;
    title: string;
    slug: string;
    price: number;
    sale_price: number | null;
    stock: number;
    type: string;
    is_featured: boolean;
    images: string[];
    brand: string;
    category: { name: string; slug: string } | null;
}

interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface Filters {
    sort?: string;
    availability?: string;
    min_price?: string;
    max_price?: string;
    search?: string;
}

interface Props {
    collection: Collection;
    products?: Paginator<Product>;
    filters: Filters;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
    { value: 'best_sellers', label: 'Best Sellers' },
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
];

const PRICE_MIN = 0;
const PRICE_MAX = 100000;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
    return `Rs.${price.toLocaleString('en-PK')}`;
}

// ─── Product Image Carousel ────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
    const [activeIdx, setActiveIdx] = useState(0);
    const images = product.images;

    return (
        <Link href={`/products/${product.slug}`} className="group block">
            {/* Image */}
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                {images.length > 0 ? (
                    <>
                        <img
                            src={images[activeIdx]}
                            alt={product.title}
                            className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                        {images.length > 1 && (
                            <img
                                src={images[1]}
                                alt={product.title}
                                className="absolute inset-0 h-full w-full object-cover object-top opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                            />
                        )}
                    </>
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <span className="text-xs uppercase tracking-widest text-neutral-400">
                            No Image
                        </span>
                    </div>
                )}

                {/* Dot indicators */}
                {images.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveIdx(i);
                                }}
                                aria-label={`Image ${i + 1}`}
                                className={[
                                    'h-1.5 rounded-full transition-all duration-200',
                                    i === activeIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/60',
                                ].join(' ')}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="mt-3 space-y-0.5">
                <p className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900">
                    {product.title}
                </p>
                <p className="text-xs text-neutral-500">{product.brand}</p>
                <div className="flex items-baseline gap-2 pt-0.5">
                    {product.sale_price !== null ? (
                        <>
                            <span className="text-sm font-semibold text-neutral-900">
                                {formatPrice(product.sale_price)}
                            </span>
                            <span className="text-xs text-neutral-400 line-through">
                                {formatPrice(product.price)}
                            </span>
                        </>
                    ) : (
                        <span className="text-sm font-semibold text-neutral-900">
                            {formatPrice(product.price)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

// ─── Product Card Skeleton ────────────────────────────────────────────────────

function ProductCardSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="aspect-[3/4] w-full bg-neutral-200" />
            <div className="mt-3 space-y-2">
                <div className="h-4 w-3/4 bg-neutral-200" />
                <div className="h-3 w-1/3 bg-neutral-100" />
                <div className="h-4 w-1/2 bg-neutral-200" />
            </div>
        </div>
    );
}

// ─── Filter Accordion Item ────────────────────────────────────────────────────

function FilterSection({
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
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-neutral-800 transition-colors hover:text-neutral-900"
            >
                <span>{title}</span>
                {open ? (
                    <Minus className="h-4 w-4 shrink-0 text-neutral-500" />
                ) : (
                    <Plus className="h-4 w-4 shrink-0 text-neutral-500" />
                )}
            </button>
            {open && <div className="pb-5">{children}</div>}
        </div>
    );
}

// ─── Price Range Slider ───────────────────────────────────────────────────────

function PriceRangeSlider({
    slug,
    filters,
}: {
    slug: string;
    filters: Filters;
}) {
    const [minVal, setMinVal] = useState(Number(filters.min_price ?? PRICE_MIN));
    const [maxVal, setMaxVal] = useState(Number(filters.max_price ?? PRICE_MAX));

    const minPercent = ((minVal - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
    const maxPercent = ((maxVal - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

    const apply = useCallback(
        (min: number, max: number) => {
            const params: Record<string, string> = {};
            if (filters.sort) params.sort = filters.sort;
            if (filters.availability) params.availability = filters.availability;
            if (min > PRICE_MIN) params.min_price = String(min);
            if (max < PRICE_MAX) params.max_price = String(max);

            // Full visit — resets InfiniteScroll merged data
            router.get(`/collections/${slug}`, params);
        },
        [filters, slug],
    );

    return (
        <div className="space-y-4">
            {/* Track + dual thumbs */}
            <div className="relative h-1.5 w-full">
                {/* grey base */}
                <div className="absolute inset-0 rounded-full bg-neutral-200" />
                {/* coloured fill between thumbs */}
                <div
                    className="absolute h-full rounded-full bg-neutral-900"
                    style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
                />

                {/* Min thumb */}
                <input
                    type="range"
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step={500}
                    value={minVal}
                    onChange={(e) => {
                        const v = Math.min(Number(e.target.value), maxVal - 500);
                        setMinVal(v);
                    }}
                    onMouseUp={() => apply(minVal, maxVal)}
                    onTouchEnd={() => apply(minVal, maxVal)}
                    className="price-thumb pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent"
                    style={{ zIndex: minVal > PRICE_MAX - 1000 ? 5 : 3 }}
                />

                {/* Max thumb */}
                <input
                    type="range"
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step={500}
                    value={maxVal}
                    onChange={(e) => {
                        const v = Math.max(Number(e.target.value), minVal + 500);
                        setMaxVal(v);
                    }}
                    onMouseUp={() => apply(minVal, maxVal)}
                    onTouchEnd={() => apply(minVal, maxVal)}
                    className="price-thumb pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent"
                    style={{ zIndex: 4 }}
                />
            </div>

            {/* Labels */}
            <div className="flex items-center justify-between text-xs text-neutral-600">
                <span>{formatPrice(minVal)}</span>
                <span>{formatPrice(maxVal)}</span>
            </div>
        </div>
    );
}

// ─── Filters Sidebar ──────────────────────────────────────────────────────────

function FiltersSidebar({
    filters,
    slug,
}: {
    filters: Filters;
    slug: string;
}) {
    const applyFilter = useCallback(
        (key: string, value: string | null) => {
            const updated: Record<string, string> = {};
            if (filters.sort) updated.sort = filters.sort;
            if (filters.availability) updated.availability = filters.availability;
            if (filters.min_price) updated.min_price = filters.min_price;
            if (filters.max_price) updated.max_price = filters.max_price;

            if (value === null || value === '') {
                delete updated[key];
            } else {
                updated[key] = value;
            }

            // Full visit — no preserveState so InfiniteScroll resets its merged data
            router.get(`/collections/${slug}`, updated);
        },
        [filters, slug],
    );

    return (
        <aside className="w-full shrink-0 lg:w-52">
            {/* Availability */}
            <FilterSection title="Availability">
                <div className="space-y-2.5">
                    {[
                        { value: '', label: 'All' },
                        { value: 'in_stock', label: 'In Stock' },
                        { value: 'out_of_stock', label: 'Out of Stock' },
                    ].map((opt) => (
                        <label key={opt.value} className="flex cursor-pointer items-center gap-2.5">
                            <input
                                type="radio"
                                name="availability"
                                value={opt.value}
                                checked={(filters.availability ?? '') === opt.value}
                                onChange={() => applyFilter('availability', opt.value || null)}
                                className="h-4 w-4 cursor-pointer accent-neutral-900"
                            />
                            <span className="text-sm text-neutral-700">{opt.label}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Price */}
            <FilterSection title="Price" defaultOpen>
                <PriceRangeSlider slug={slug} filters={filters} />
            </FilterSection>
        </aside>
    );
}

// ─── Sort Dropdown ────────────────────────────────────────────────────────────

function SortDropdown({ current, slug }: { current: string | undefined; slug: string }) {
    const [open, setOpen] = useState(false);
    const selectedLabel =
        SORT_OPTIONS.find((o) => o.value === (current ?? 'best_sellers'))?.label ?? 'Best Sellers';

    const select = (value: string) => {
        setOpen(false);
        // Full visit — resets InfiniteScroll merged data on sort change
        router.get(`/collections/${slug}`, { sort: value });
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-1.5 text-sm transition-colors hover:text-neutral-900"
            >
                <span className="font-medium text-neutral-500">Sort by:</span>
                <span className="font-semibold text-neutral-800">{selectedLabel}</span>
                <ChevronDown className="h-4 w-4 text-neutral-500" />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-full z-20 mt-1.5 min-w-48 border border-neutral-200 bg-white shadow-lg">
                        {SORT_OPTIONS.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => select(opt.value)}
                                className={[
                                    'block w-full px-4 py-3 text-left text-sm transition-colors hover:bg-neutral-50',
                                    (current ?? 'best_sellers') === opt.value
                                        ? 'font-semibold text-neutral-900'
                                        : 'text-neutral-700',
                                ].join(' ')}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Products Grid ────────────────────────────────────────────────────────────

function ProductsSection({
    products,
    filters,
    collection,
}: {
    products: Paginator<Product> | undefined;
    filters: Filters;
    collection: Collection;
}) {
    if (!products) {
        return (
            <div className="min-w-0 flex-1">
                <div className="mb-5 flex items-center justify-between">
                    <div className="h-4 w-24 animate-pulse bg-neutral-200" />
                    <div className="h-4 w-32 animate-pulse bg-neutral-200" />
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-w-0 flex-1">
            {/* Bar: count + sort */}
            <div className="mb-5 flex items-center justify-between gap-4">
                <p className="text-sm text-neutral-600">
                    {products.total} {products.total === 1 ? 'product' : 'products'}
                </p>
                <SortDropdown current={filters.sort} slug={collection.slug} />
            </div>

            {/* Infinite scroll */}
            <InfiniteScroll
                data="products"
                onlyNext
                loading={
                    <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                }
            >
                {products.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <p className="text-base font-medium text-neutral-500">
                            No products found for the selected filters.
                        </p>
                        <Link
                            href={`/collections/${collection.slug}`}
                            className="mt-4 text-sm font-semibold underline underline-offset-2 hover:text-neutral-600"
                        >
                            Clear filters
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
                        {products.data.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </InfiniteScroll>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CollectionsShow({ collection, products, filters }: Props) {
    // Banner: prefer dedicated banner, fall back to category image
    const bannerSrc = collection.banner_url ?? collection.image_url;

    // Breadcrumb
    const crumbs: { label: string; href?: string }[] = [
        { label: 'Home', href: '/' },
        { label: 'Collections', href: '/collections' },
    ];
    if (collection.parent) {
        crumbs.push({
            label: collection.parent.name,
            href: `/collections/${collection.parent.slug}`,
        });
    }
    crumbs.push({ label: collection.name });

    return (
        <>
            <Head title={collection.name} />

            {/*
              Dual-thumb range slider thumb styles — cannot be expressed via
              Tailwind utilities, so we inject a tiny <style> block.
            */}
            <style>{`
                .price-thumb {
                    pointer-events: none;
                }
                .price-thumb::-webkit-slider-thumb {
                    pointer-events: all;
                    -webkit-appearance: none;
                    appearance: none;
                    height: 18px;
                    width: 18px;
                    border-radius: 50%;
                    background: #171717;
                    border: 2px solid #fff;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.25);
                    cursor: pointer;
                    position: relative;
                }
                .price-thumb::-moz-range-thumb {
                    pointer-events: all;
                    height: 18px;
                    width: 18px;
                    border-radius: 50%;
                    background: #171717;
                    border: 2px solid #fff;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.25);
                    cursor: pointer;
                }
            `}</style>

            <div className="min-h-screen overflow-x-hidden bg-white">
                <Navbar />

                {/* Hero Banner — banner_url first, falls back to image_url */}
                {bannerSrc && (
                    <div className="relative h-72 w-full overflow-hidden sm:h-96 lg:h-[480px]">
                        <img
                            src={bannerSrc}
                            alt={collection.name}
                            className="h-full w-full object-cover object-center"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                )}

                <main className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-neutral-500">
                        {crumbs.map((crumb, i) => (
                            <span key={i} className="flex items-center gap-1">
                                {i > 0 && <span className="text-neutral-300">/</span>}
                                {crumb.href ? (
                                    <Link
                                        href={crumb.href}
                                        className="transition-colors hover:text-neutral-900"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="font-medium text-neutral-700">
                                        {crumb.label}
                                    </span>
                                )}
                            </span>
                        ))}
                    </nav>

                    {/* Filters + Products */}
                    <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
                        <FiltersSidebar filters={filters} slug={collection.slug} />

                        <Deferred
                            data="products"
                            fallback={
                                <div className="min-w-0 flex-1">
                                    <div className="mb-5 flex items-center justify-between">
                                        <div className="h-4 w-24 animate-pulse bg-neutral-200" />
                                        <div className="h-4 w-32 animate-pulse bg-neutral-200" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
                                        {Array.from({ length: 8 }).map((_, i) => (
                                            <ProductCardSkeleton key={i} />
                                        ))}
                                    </div>
                                </div>
                            }
                        >
                            <ProductsSection
                                products={products}
                                filters={filters}
                                collection={collection}
                            />
                        </Deferred>
                    </div>
                </main>
            </div>
        </>
    );
}
