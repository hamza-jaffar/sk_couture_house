import Navbar from '@/components/frontend/navbar';
import SeoHead from '@/components/frontend/seo-head';
import type { PlatformSettings } from '@/types';
import { Deferred, Link, useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Pause,
    Play,
    ShoppingBag,
    Sparkles,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface SlideBanner {
    id: number;
    title: string | null;
    subtitle: string | null;
    description: string | null;
    media_type: 'image' | 'video';
    media_url: string | null;
    button_text: string | null;
    button_url: string | null;
    secondary_button_text: string | null;
    secondary_button_url: string | null;
    text_position: 'left' | 'center' | 'right';
    text_color: 'light' | 'dark';
    sort_order: number;
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
    category: { name: string; slug: string; order_type: string } | null;
    order_type: string;
}

interface Collection {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    banner_url: string | null;
    items_count: number;
}

interface Props {
    banners?: SlideBanner[];
    featuredProducts?: Product[];
    collections?: Collection[];
    newArrivals?: Product[];
}

// ─── Product Card Component ──────────────────────────────────────────────────

function ProductCard({
    product,
    currencyIcon,
}: {
    product: Product;
    currencyIcon: string;
}) {
    const isOnSale = product.sale_price !== null && product.sale_price < product.price;
    const displayPrice = isOnSale ? product.sale_price! : product.price;

    return (
        <Link href={`/products/${product.slug}`} className="group block">
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                {product.images[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.title}
                        className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <ShoppingBag className="h-10 w-10 text-neutral-300" />
                    </div>
                )}

                {isOnSale && (
                    <span className="absolute top-3 left-3 bg-rose-600 px-2.5 py-0.5 text-[10px] font-semibold tracking-widest text-white uppercase shadow-sm">
                        Sale
                    </span>
                )}

                {product.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
                        <span className="text-xs font-semibold tracking-widest text-neutral-600 uppercase">
                            Sold Out
                        </span>
                    </div>
                )}
            </div>

            <div className="mt-3 space-y-1">
                {product.category && (
                    <p className="text-[11px] font-medium tracking-widest text-neutral-400 uppercase">
                        {product.category.name}
                    </p>
                )}
                <p className="text-sm font-medium text-neutral-900 transition-colors group-hover:text-neutral-600 line-clamp-1">
                    {product.title}
                </p>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-900">
                        {currencyIcon}
                        {displayPrice.toLocaleString('en-PK', { minimumFractionDigits: 0 })}
                    </span>
                    {isOnSale && (
                        <span className="text-xs text-neutral-400 line-through">
                            {currencyIcon}
                            {product.price.toLocaleString('en-PK', { minimumFractionDigits: 0 })}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

// ─── Collection Card Component ───────────────────────────────────────────────

function CollectionCard({ collection }: { collection: Collection }) {
    return (
        <Link
            href={`/collections/${collection.slug}`}
            className="group relative block aspect-[3/4] overflow-hidden bg-neutral-100"
        >
            {collection.image_url ? (
                <img
                    src={collection.image_url}
                    alt={collection.name}
                    className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                />
            ) : (
                <div className="h-full w-full bg-neutral-200" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition-opacity group-hover:from-black/85" />
            <div className="absolute right-0 bottom-0 left-0 p-5 sm:p-6">
                <p className="text-lg font-semibold tracking-tight text-white">{collection.name}</p>
                <p className="mt-1 text-xs tracking-widest text-white/70 uppercase">
                    {collection.items_count} {collection.items_count === 1 ? 'Design' : 'Designs'}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium tracking-widest text-white/90 uppercase transition-all group-hover:gap-2.5">
                    Explore <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
            </div>
        </Link>
    );
}

// ─── Section Header ──────────────────────────────────────────────────────────

function SectionHeader({
    badge,
    title,
    subtitle,
    href,
    linkLabel,
}: {
    badge?: string;
    title: string;
    subtitle?: string;
    href?: string;
    linkLabel?: string;
}) {
    return (
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
                {badge && (
                    <span className="mb-2 inline-block text-[11px] font-semibold tracking-[0.2em] text-neutral-400 uppercase">
                        {badge}
                    </span>
                )}
                <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">{title}</h2>
                {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
            </div>
            {href && linkLabel && (
                <Link
                    href={href}
                    className="hidden items-center gap-1.5 text-sm font-semibold tracking-wide text-neutral-900 underline-offset-4 transition-colors hover:underline sm:inline-flex"
                >
                    {linkLabel} <ArrowRight className="h-4 w-4" />
                </Link>
            )}
        </div>
    );
}

// ─── Hero Slider Component ───────────────────────────────────────────────────

function HeroSlider({
    banners,
    storeName,
    tagline,
    fallbackImage,
    heroBadge,
}: {
    banners?: SlideBanner[];
    storeName: string;
    tagline: string;
    fallbackImage: string | null;
    heroBadge: string;
}) {
    const slides = banners && banners.length > 0 ? banners : null;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const totalSlides = slides?.length ?? 1;

    // Auto-advance slider every 6 seconds unless paused
    useEffect(() => {
        if (!slides || totalSlides <= 1 || isPaused) {
            return;
        }

        timerRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % totalSlides);
        }, 6000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [slides, totalSlides, isPaused]);

    const prevSlide = () => {
        if (!slides) return;
        setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    };

    const nextSlide = () => {
        if (!slides) return;
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
    };

    // If no banners configured, render high-aesthetic fallback hero
    if (!slides) {
        return (
            <section className="relative flex min-h-[85vh] items-end overflow-hidden bg-neutral-950 text-white">
                {fallbackImage && (
                    <img
                        src={fallbackImage}
                        alt={storeName}
                        className="absolute inset-0 h-full w-full object-cover object-center opacity-70"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />
                <div className="relative z-10 w-full px-6 pb-20 sm:px-12 lg:px-20">
                    <p className="mb-3 text-xs font-semibold tracking-[0.25em] text-white/70 uppercase">
                        {heroBadge}
                    </p>
                    <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
                        {storeName}
                    </h1>
                    <p className="mt-4 max-w-lg text-base text-white/80 leading-relaxed sm:text-lg">
                        {tagline}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4">
                        <Link
                            href="/collections"
                            className="inline-flex items-center gap-2 bg-white px-8 py-3.5 text-sm font-semibold tracking-wide text-neutral-900 transition-colors hover:bg-neutral-100"
                        >
                            Shop Collections <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    const currentSlide = slides[currentIndex];
    const isDarkText = currentSlide.text_color === 'dark';
    const textAlignment =
        currentSlide.text_position === 'center'
            ? 'items-center text-center'
            : currentSlide.text_position === 'right'
              ? 'items-end text-right ml-auto'
              : 'items-start text-left';

    return (
        <section
            className="group relative min-h-[85vh] sm:min-h-[90vh] overflow-hidden bg-neutral-950"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Background Media */}
            {slides.map((slide, index) => {
                const isActive = index === currentIndex;
                return (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            isActive ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
                        }`}
                    >
                        {slide.media_type === 'video' ? (
                            slide.media_url && (
                                <video
                                    src={slide.media_url}
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="h-full w-full object-cover object-center"
                                />
                            )
                        ) : slide.media_url ? (
                            <img
                                src={slide.media_url}
                                alt={slide.title ?? storeName}
                                className="h-full w-full object-cover object-center"
                            />
                        ) : null}

                        {/* Aesthetic Gradient Overlay */}
                        <div
                            className={`absolute inset-0 ${
                                isDarkText
                                    ? 'bg-gradient-to-t from-white/70 via-white/30 to-transparent'
                                    : 'bg-gradient-to-t from-black/85 via-black/40 to-black/20'
                            }`}
                        />
                    </div>
                );
            })}

            {/* Slide Content Layer */}
            <div className="relative z-10 flex min-h-[85vh] sm:min-h-[90vh] flex-col justify-end px-6 pb-20 sm:px-12 lg:px-20">
                <div className={`flex flex-col max-w-2xl ${textAlignment}`}>
                    {currentSlide.subtitle && (
                        <p
                            className={`mb-3 text-xs font-semibold tracking-[0.25em] uppercase ${
                                isDarkText ? 'text-neutral-700' : 'text-white/80'
                            }`}
                        >
                            {currentSlide.subtitle}
                        </p>
                    )}

                    {currentSlide.title && (
                        <h1
                            className={`text-4xl font-semibold leading-tight tracking-tight sm:text-6xl lg:text-7xl ${
                                isDarkText ? 'text-neutral-900' : 'text-white'
                            }`}
                        >
                            {currentSlide.title}
                        </h1>
                    )}

                    {currentSlide.description && (
                        <p
                            className={`mt-4 max-w-lg text-base leading-relaxed sm:text-lg ${
                                isDarkText ? 'text-neutral-700' : 'text-white/85'
                            }`}
                        >
                            {currentSlide.description}
                        </p>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-wrap gap-4">
                        {currentSlide.button_text && currentSlide.button_url && (
                            <Link
                                href={currentSlide.button_url}
                                className={`inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold tracking-wide transition-all shadow-sm ${
                                    isDarkText
                                        ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                                        : 'bg-white text-neutral-900 hover:bg-neutral-100'
                                }`}
                            >
                                {currentSlide.button_text} <ArrowRight className="h-4 w-4" />
                            </Link>
                        )}

                        {currentSlide.secondary_button_text && currentSlide.secondary_button_url && (
                            <Link
                                href={currentSlide.secondary_button_url}
                                className={`inline-flex items-center gap-2 border px-8 py-3.5 text-sm font-semibold tracking-wide transition-colors ${
                                    isDarkText
                                        ? 'border-neutral-900 text-neutral-900 hover:bg-neutral-900/10'
                                        : 'border-white/70 text-white hover:bg-white/10'
                                }`}
                            >
                                {currentSlide.secondary_button_text}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Slider Navigation Controls (Arrow Buttons & Dots) */}
            {totalSlides > 1 && (
                <>
                    <button
                        type="button"
                        onClick={prevSlide}
                        aria-label="Previous slide"
                        className="absolute top-1/2 left-4 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2.5 text-white backdrop-blur-md opacity-0 transition-opacity hover:bg-black/60 group-hover:opacity-100 sm:left-6"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                        type="button"
                        onClick={nextSlide}
                        aria-label="Next slide"
                        className="absolute top-1/2 right-4 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2.5 text-white backdrop-blur-md opacity-0 transition-opacity hover:bg-black/60 group-hover:opacity-100 sm:right-6"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Pagination Dots */}
                    <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setCurrentIndex(idx)}
                                aria-label={`Go to slide ${idx + 1}`}
                                className={`h-1.5 rounded-full transition-all ${
                                    idx === currentIndex
                                        ? 'w-8 bg-white'
                                        : 'w-2 bg-white/40 hover:bg-white/75'
                                }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}

// ─── Main Welcome Page Component ─────────────────────────────────────────────

export default function Welcome({
    banners,
    featuredProducts = [],
    collections = [],
    newArrivals = [],
}: Props) {
    const { settings } = usePage<{ settings?: PlatformSettings }>().props;

    const storeName = settings?.general?.name || 'SK Couture House';
    const tagline = settings?.general?.tagline || settings?.general?.description || 'Curated fashion for the modern woman';
    const currencyIcon = settings?.general?.currency_icon || 'Rs.';
    const fallbackImage = settings?.seo?.og_image_url || null;

    // Storefront editable text from settings with safe defaults
    const sf = settings?.storefront ?? {};
    const heroBadge = sf.hero_badge || 'New Collection';
    const featuredBadge = sf.featured_badge || 'Featured Pieces';
    const featuredTitle = sf.featured_title || 'Featured Pieces';
    const featuredSubtitle = sf.featured_subtitle || 'Handpicked styles from our latest arrivals';
    const collectionsTitle = sf.collections_title || 'Shop by Collection';
    const collectionsSubtitle = sf.collections_subtitle || 'Browse our curated categories';
    const newArrivalsTitle = sf.new_arrivals_title || 'New Arrivals';
    const newArrivalsSubtitle = sf.new_arrivals_subtitle || 'The freshest additions to our studio';

    // Value Promises
    const promise1 = {
        icon: sf.promise_1_icon || '🚚',
        title: sf.promise_1_title || 'Nationwide Delivery',
        desc: sf.promise_1_desc || 'Fast & reliable shipping across Pakistan',
    };
    const promise2 = {
        icon: sf.promise_2_icon || '✂️',
        title: sf.promise_2_title || 'Premium Fabric',
        desc: sf.promise_2_desc || 'Carefully sourced quality materials',
    };
    const promise3 = {
        icon: sf.promise_3_icon || '🔄',
        title: sf.promise_3_title || 'Easy Returns',
        desc: sf.promise_3_desc || 'Hassle-free returns within 7 days',
    };
    const promise4 = {
        icon: sf.promise_4_icon || '💬',
        title: sf.promise_4_title || 'Customer Support',
        desc: sf.promise_4_desc || "We're available to help you",
    };

    // Newsletter & Footer Text
    const newsletterTitle = sf.newsletter_title || 'Join the SK Atelier Club';
    const newsletterDesc =
        sf.newsletter_desc ||
        'Subscribe for private preview access, bespoke styling notes, and seasonal releases.';
    const footerAbout =
        sf.footer_about ||
        tagline ||
        'Curated haute couture and ready-to-wear pieces, handcrafted with passion and timeless refinement.';
    const footerCopyright =
        sf.footer_copyright || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`;

    // Newsletter Form
    const {
        data: newsletterForm,
        setData: setNewsletterData,
        post: postNewsletter,
        processing: newsletterProcessing,
        reset: resetNewsletterForm,
    } = useForm({
        email: '',
    });

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postNewsletter('/newsletter/subscribe', {
            preserveScroll: true,
            onSuccess: () => {
                resetNewsletterForm('email');
            },
            onError: (errs) => {
                if (errs.email) {
                    toast.error(errs.email);
                } else {
                    toast.error('Unable to subscribe. Please try again.');
                }
            },
        });
    };

    // SEO Meta
    const homeTitle = settings?.seo?.home_title || storeName;
    const homeDescription =
        settings?.seo?.home_description || settings?.seo?.meta_description || tagline;
    const homeKeywords = settings?.seo?.home_keywords || settings?.seo?.meta_keywords;

    return (
        <>
            <SeoHead
                rawTitle={homeTitle}
                description={homeDescription}
                keywords={homeKeywords}
                ogType="website"
            />

            <div className="min-h-screen overflow-x-hidden bg-white text-neutral-900">
                <Navbar />

                {/* ── 1. Deferred Hero Slider ────────────────────────────── */}
                <Deferred
                    data="banners"
                    fallback={
                        <section className="relative flex min-h-[85vh] items-end bg-neutral-900 text-white animate-pulse">
                            <div className="w-full px-6 pb-20 sm:px-12 lg:px-20 space-y-4">
                                <div className="h-4 w-32 bg-white/20 rounded" />
                                <div className="h-14 w-3/4 max-w-xl bg-white/20 rounded" />
                                <div className="h-4 w-1/2 max-w-md bg-white/20 rounded" />
                            </div>
                        </section>
                    }
                >
                    <HeroSlider
                        banners={banners}
                        storeName={storeName}
                        tagline={tagline}
                        fallbackImage={fallbackImage}
                        heroBadge={heroBadge}
                    />
                </Deferred>

                {/* ── 2. Quick Category Bar ──────────────────────────────── */}
                <div className="border-b border-neutral-100 bg-neutral-50/70 py-4">
                    <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                            <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase pr-2 whitespace-nowrap">
                                Browse:
                            </span>
                            <Link
                                href="/collections"
                                className="rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-xs font-medium text-neutral-800 transition-colors hover:border-neutral-900 hover:bg-neutral-900 hover:text-white whitespace-nowrap"
                            >
                                All Collections
                            </Link>
                            {collections.map((c) => (
                                <Link
                                    key={c.id}
                                    href={`/collections/${c.slug}`}
                                    className="rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-xs font-medium text-neutral-800 transition-colors hover:border-neutral-900 hover:bg-neutral-900 hover:text-white whitespace-nowrap"
                                >
                                    {c.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── 3. Deferred Featured Products ──────────────────────── */}
                <Deferred
                    data="featuredProducts"
                    fallback={
                        <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
                            <div className="h-8 w-48 bg-neutral-200 rounded mb-8 animate-pulse" />
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="aspect-[3/4] bg-neutral-100 rounded animate-pulse" />
                                ))}
                            </div>
                        </section>
                    }
                >
                    {featuredProducts.length > 0 && (
                        <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                            <SectionHeader
                                badge={featuredBadge}
                                title={featuredTitle}
                                subtitle={featuredSubtitle}
                                href="/collections"
                                linkLabel="View All Pieces"
                            />
                            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {featuredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        currencyIcon={currencyIcon}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </Deferred>

                {/* ── 4. Deferred Collections Grid ───────────────────────── */}
                <Deferred
                    data="collections"
                    fallback={
                        <section className="bg-neutral-50 py-16">
                            <div className="mx-auto max-w-screen-xl px-4">
                                <div className="h-8 w-48 bg-neutral-200 rounded mb-8 animate-pulse" />
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="aspect-[3/4] bg-neutral-200 rounded animate-pulse" />
                                    ))}
                                </div>
                            </div>
                        </section>
                    }
                >
                    {collections.length > 0 && (
                        <section className="bg-neutral-50/80 py-16 lg:py-20">
                            <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                                <SectionHeader
                                    title={collectionsTitle}
                                    subtitle={collectionsSubtitle}
                                    href="/collections"
                                    linkLabel="Browse All"
                                />
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {collections.slice(0, 6).map((collection) => (
                                        <CollectionCard key={collection.id} collection={collection} />
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                </Deferred>

                {/* ── 5. Deferred New Arrivals Section ───────────────────── */}
                <Deferred
                    data="newArrivals"
                    fallback={
                        <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 border-t border-neutral-100">
                            <div className="h-8 w-48 bg-neutral-200 rounded mb-8 animate-pulse" />
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="aspect-[3/4] bg-neutral-100 rounded animate-pulse" />
                                ))}
                            </div>
                        </section>
                    }
                >
                    {newArrivals.length > 0 && (
                        <section className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20 border-t border-neutral-100">
                            <SectionHeader
                                badge="Latest Additions"
                                title={newArrivalsTitle}
                                subtitle={newArrivalsSubtitle}
                                href="/collections"
                                linkLabel="Shop New Arrivals"
                            />
                            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {newArrivals.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        currencyIcon={currencyIcon}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </Deferred>

                {/* ── 6. Value Promises Strip ────────────────────────────── */}
                <section className="border-t border-neutral-100 bg-neutral-50/50 py-12">
                    <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                            {[promise1, promise2, promise3, promise4].map((item) => (
                                <div
                                    key={item.title}
                                    className="flex flex-col items-center gap-2 text-center"
                                >
                                    <span className="text-3xl">{item.icon}</span>
                                    <p className="text-sm font-semibold tracking-tight text-neutral-900">
                                        {item.title}
                                    </p>
                                    <p className="text-xs leading-relaxed text-neutral-500">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── 7. VIP Atelier Newsletter Club ─────────────────────── */}
                <section className="border-t border-neutral-100 bg-white py-16 sm:py-20">
                    <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[0.2em] text-neutral-400 uppercase">
                            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                            Private Circle
                        </span>
                        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
                            {newsletterTitle}
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                            {newsletterDesc}
                        </p>
                        <form
                            onSubmit={handleNewsletterSubmit}
                            className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center"
                        >
                            <input
                                type="email"
                                required
                                value={newsletterForm.email}
                                onChange={(e) => setNewsletterData('email', e.target.value)}
                                disabled={newsletterProcessing}
                                placeholder="Enter your email address"
                                className="h-11 rounded-none border border-neutral-300 px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none sm:w-80 disabled:opacity-60"
                            />
                            <button
                                type="submit"
                                disabled={newsletterProcessing}
                                className="h-11 bg-neutral-900 px-6 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-neutral-800 disabled:opacity-60"
                            >
                                {newsletterProcessing ? 'Subscribing...' : 'Subscribe'}
                            </button>
                        </form>
                    </div>
                </section>

                {/* ── 8. Comprehensive Storefront Footer ─────────────────── */}
                <footer className="border-t border-neutral-800 bg-neutral-950 py-16 text-white">
                    <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Brand Column */}
                            <div className="space-y-4">
                                <p className="text-xl font-semibold tracking-tight">{storeName}</p>
                                <p className="text-sm leading-relaxed text-neutral-400">
                                    {footerAbout}
                                </p>
                                {/* Social links from settings */}
                                {settings?.social && (
                                    <div className="flex flex-wrap gap-4 pt-2 text-xs font-medium text-neutral-400">
                                        {settings.social.instagram && (
                                            <a
                                                href={settings.social.instagram}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="transition-colors hover:text-white"
                                            >
                                                Instagram
                                            </a>
                                        )}
                                        {settings.social.facebook && (
                                            <a
                                                href={settings.social.facebook}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="transition-colors hover:text-white"
                                            >
                                                Facebook
                                            </a>
                                        )}
                                        {settings.social.tiktok && (
                                            <a
                                                href={settings.social.tiktok}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="transition-colors hover:text-white"
                                            >
                                                TikTok
                                            </a>
                                        )}
                                        {settings.social.youtube && (
                                            <a
                                                href={settings.social.youtube}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="transition-colors hover:text-white"
                                            >
                                                YouTube
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Collections Column */}
                            <div>
                                <p className="mb-4 text-xs font-semibold tracking-widest text-neutral-400 uppercase">
                                    Collections
                                </p>
                                <ul className="space-y-2.5 text-sm text-neutral-400">
                                    <li>
                                        <Link href="/collections" className="transition-colors hover:text-white">
                                            All Collections
                                        </Link>
                                    </li>
                                    {collections.slice(0, 5).map((c) => (
                                        <li key={c.id}>
                                            <Link
                                                href={`/collections/${c.slug}`}
                                                className="transition-colors hover:text-white"
                                            >
                                                {c.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Client Services & Account */}
                            <div>
                                <p className="mb-4 text-xs font-semibold tracking-widest text-neutral-400 uppercase">
                                    Client Services
                                </p>
                                <ul className="space-y-2.5 text-sm text-neutral-400">
                                    <li>
                                        <Link href="/login" className="transition-colors hover:text-white">
                                            Sign In
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/register" className="transition-colors hover:text-white">
                                            Create Account
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/customer/orders" className="transition-colors hover:text-white">
                                            Track Order
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/cart" className="transition-colors hover:text-white">
                                            Shopping Bag
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Contact Details */}
                            <div>
                                <p className="mb-4 text-xs font-semibold tracking-widest text-neutral-400 uppercase">
                                    Atelier & Contact
                                </p>
                                <ul className="space-y-2.5 text-sm text-neutral-400">
                                    {settings?.contact?.email && (
                                        <li>
                                            <a
                                                href={`mailto:${settings.contact.email}`}
                                                className="transition-colors hover:text-white"
                                            >
                                                {settings.contact.email}
                                            </a>
                                        </li>
                                    )}
                                    {settings?.contact?.phone && (
                                        <li>
                                            <a
                                                href={`tel:${settings.contact.phone}`}
                                                className="transition-colors hover:text-white"
                                            >
                                                {settings.contact.phone}
                                            </a>
                                        </li>
                                    )}
                                    {settings?.contact?.whatsapp_number && (
                                        <li>
                                            <a
                                                href={`https://wa.me/${settings.contact.whatsapp_number.replace(/[^0-9]/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="transition-colors hover:text-white"
                                            >
                                                WhatsApp: {settings.contact.whatsapp_number}
                                            </a>
                                        </li>
                                    )}
                                    {settings?.contact?.address && (
                                        <li className="leading-relaxed text-neutral-400 pt-1">
                                            {settings.contact.address}
                                            {settings.contact.city ? `, ${settings.contact.city}` : ''}
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        {/* Bottom Copyright */}
                        <div className="mt-14 border-t border-neutral-900 pt-8 text-center text-xs text-neutral-500">
                            {footerCopyright}
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
