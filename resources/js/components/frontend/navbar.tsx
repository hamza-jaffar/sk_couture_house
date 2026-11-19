import { Link, usePage } from '@inertiajs/react';
import {
    ChevronRight,
    Menu,
    Search,
    Send,
    ShoppingBag,
    User,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type NavItem = {
    label: string;
    href?: string;
    children?: NavItem[];
};

// ─── Navigation Data (Multi-level luxury hierarchy) ─────────────────────────

const NAV_ITEMS: NavItem[] = [
    {
        label: 'New Arrivals',
        children: [
            { label: 'All New In', href: '#' },
            {
                label: 'Apparel',
                children: [
                    { label: 'Dresses & Gowns', href: '#' },
                    { label: 'Tops & Blouses', href: '#' },
                    { label: 'Tailored Trousers', href: '#' },
                    {
                        label: 'Outerwear',
                        children: [
                            { label: 'Silk Trench Coats', href: '#' },
                            { label: 'Wool Blazers', href: '#' },
                            { label: 'Statement Jackets', href: '#' },
                        ],
                    },
                ],
            },
            {
                label: 'Accessories',
                children: [
                    { label: 'Leather Bags', href: '#' },
                    { label: 'Fine Jewelry', href: '#' },
                    { label: 'Silk Scarves', href: '#' },
                    { label: 'Eyewear', href: '#' },
                ],
            },
            { label: 'Footwear', href: '#' },
            { label: 'Capsule Edit', href: '#' },
        ],
    },
    {
        label: 'Best Sellers',
        children: [
            { label: 'All Best Sellers', href: '#' },
            { label: 'Most Coveted', href: '#' },
            { label: 'Iconic Pieces', href: '#' },
            { label: 'Curated Favorites', href: '#' },
        ],
    },
    {
        label: 'Brands',
        children: [
            { label: 'All Designers', href: '#' },
            {
                label: 'Haute Couture',
                children: [
                    { label: 'Atelier SK', href: '#' },
                    { label: 'Maison Noir', href: '#' },
                    { label: 'L’Étoile Paris', href: '#' },
                ],
            },
            {
                label: 'Contemporary',
                children: [
                    { label: 'Studio Minimal', href: '#' },
                    { label: 'Linen & Silk', href: '#' },
                ],
            },
            { label: 'Artisanal & Sustainable', href: '#' },
            { label: 'Exclusive Collaborations', href: '#' },
        ],
    },
    {
        label: "Women's Clothing",
        children: [
            { label: 'Explore All', href: '#' },
            {
                label: 'Tops & Shirts',
                children: [
                    { label: 'Silk Blouses', href: '#' },
                    { label: 'Structured Shirts', href: '#' },
                    { label: 'Sleeveless Tops', href: '#' },
                    { label: 'Knit Tops', href: '#' },
                ],
            },
            {
                label: 'Bottoms',
                children: [
                    { label: 'Wide-Leg Trousers', href: '#' },
                    { label: 'Tailored Cigarette Pants', href: '#' },
                    { label: 'Pleated Skirts', href: '#' },
                    { label: 'Silk Maxi Skirts', href: '#' },
                ],
            },
            { label: 'Evening Dresses', href: '#' },
            { label: 'Two-Piece Co-ords', href: '#' },
            { label: 'Suits & Tailoring', href: '#' },
        ],
    },
    {
        label: 'Essentials',
        children: [
            { label: 'All Essentials', href: '#' },
            { label: 'Premium Cotton Basics', href: '#' },
            { label: 'Raw Denim', href: '#' },
            { label: 'Fine Knitwear', href: '#' },
            { label: 'Silk Loungewear', href: '#' },
        ],
    },
    {
        label: 'Fragrances',
        children: [
            { label: 'Discovery Collection', href: '#' },
            {
                label: 'Eau de Parfum',
                children: [
                    { label: 'Oud Mystique', href: '#' },
                    { label: 'Velvet Rose', href: '#' },
                    { label: 'Smoky Amber', href: '#' },
                ],
            },
            { label: 'Extrait de Parfum', href: '#' },
            { label: 'Home Scents & Candles', href: '#' },
            { label: 'Bespoke Gift Boxes', href: '#' },
        ],
    },
];

// ─── Brand Logo ──────────────────────────────────────────────────────────────

function Logo({
    settings,
}: {
    settings?: { general?: { logo_url?: string | null; name?: string } };
}) {
    const storeName = settings?.general?.name ?? 'LULUSAR';
    const logoUrl = settings?.general?.logo_url;

    return (
        <Link href="/" className="group flex shrink-0 items-center gap-2">
            {logoUrl ? (
                <img
                    src={logoUrl}
                    alt={storeName}
                    className="h-6 w-auto object-contain transition-opacity group-hover:opacity-85 sm:h-7"
                />
            ) : (
                <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center border border-foreground bg-foreground text-background transition-transform duration-300 group-hover:rotate-45 sm:size-7">
                        <svg
                            viewBox="0 0 24 24"
                            className="size-3.5 fill-current"
                            aria-hidden="true"
                        >
                            <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
                        </svg>
                    </span>
                    <span className="text-[15px] font-bold tracking-[0.2em] text-foreground uppercase sm:text-[17px] sm:tracking-[0.25em]">
                        {storeName}
                    </span>
                </div>
            )}
        </Link>
    );
}

// ─── Desktop Recursive Dropdown Item ─────────────────────────────────────────

function DesktopDropdownItem({ item }: { item: NavItem }) {
    const [open, setOpen] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasChildren = Boolean(item.children && item.children.length > 0);

    function handleMouseEnter() {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setOpen(true);
    }

    function handleMouseLeave() {
        timeoutRef.current = setTimeout(() => setOpen(false), 120);
    }

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    if (!hasChildren) {
        return (
            <Link
                href={item.href ?? '#'}
                className="group/link flex items-center px-5 py-2.5 text-[13px] tracking-[0.03em] text-foreground/75 transition-all duration-150 hover:bg-neutral-100/70 hover:pl-6 hover:text-foreground dark:hover:bg-neutral-900/60"
            >
                <span className="transition-transform duration-150 group-hover/link:translate-x-0.5">
                    {item.label}
                </span>
            </Link>
        );
    }

    return (
        <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                className={`group/parent flex w-full cursor-pointer items-center justify-between px-5 py-2.5 text-[13px] tracking-[0.03em] transition-all duration-150 ${
                    open
                        ? 'bg-neutral-100/70 text-foreground dark:bg-neutral-900/60'
                        : 'text-foreground/75 hover:bg-neutral-100/70 hover:text-foreground dark:hover:bg-neutral-900/60'
                }`}
            >
                {item.href ? (
                    <Link href={item.href} className="flex-1">
                        {item.label}
                    </Link>
                ) : (
                    <span className="flex-1">{item.label}</span>
                )}
                {/* Chevron is shown only inside dropdown to indicate sub-level flyouts */}
                <ChevronRight
                    className={`ml-3 size-3.5 shrink-0 transition-transform duration-200 ${
                        open ? 'translate-x-0.5 text-foreground' : 'text-foreground/40'
                    }`}
                />
            </div>

            {/* Submenu Flyout (Squared luxury container, handles infinite nesting) */}
            {open && (
                <div className="absolute left-full top-0 z-50 min-w-56 border border-neutral-200/90 bg-background py-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.1)] dark:border-neutral-800 dark:shadow-[0_12px_30px_rgba(0,0,0,0.4)]">
                    {item.children!.map((child, idx) => (
                        <DesktopDropdownItem key={idx} item={child} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Desktop Top-Level Nav Item ──────────────────────────────────────────────

function DesktopTopNavItem({ item }: { item: NavItem }) {
    const [open, setOpen] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasChildren = Boolean(item.children && item.children.length > 0);

    function handleMouseEnter() {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setOpen(true);
    }

    function handleMouseLeave() {
        timeoutRef.current = setTimeout(() => setOpen(false), 120);
    }

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    if (!hasChildren) {
        return (
            <div className="relative flex h-full items-center">
                <Link
                    href={item.href ?? '#'}
                    className="relative flex h-full items-center text-[13px] font-medium tracking-[0.04em] text-foreground/80 transition-colors duration-200 hover:text-foreground after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:scale-x-0 after:bg-foreground after:transition-transform after:duration-200 hover:after:scale-x-100"
                >
                    {item.label}
                </Link>
            </div>
        );
    }

    return (
        <div
            className="relative flex h-full items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Top link: clean text with NO chevron in header, elegant luxury underline indicator on hover */}
            <Link
                href={item.href ?? '#'}
                className={`relative flex h-full items-center text-[13px] font-medium tracking-[0.04em] transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-foreground after:transition-transform after:duration-200 ${
                    open
                        ? 'text-foreground after:scale-x-100'
                        : 'text-foreground/80 hover:text-foreground after:scale-x-0 hover:after:scale-x-100'
                }`}
            >
                {item.label}
            </Link>

            {/* Dropdown Menu Container (Squared, crisp, elevated shadow) */}
            {open && (
                <div className="absolute left-0 top-full z-50 min-w-56 border border-neutral-200/90 bg-background py-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.1)] dark:border-neutral-800 dark:shadow-[0_12px_30px_rgba(0,0,0,0.4)]">
                    {item.children!.map((child, idx) => (
                        <DesktopDropdownItem key={idx} item={child} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Mobile Recursive Nav Item ───────────────────────────────────────────────

function MobileNavItem({
    item,
    depth = 0,
    onClose,
}: {
    item: NavItem;
    depth?: number;
    onClose: () => void;
}) {
    const [open, setOpen] = useState(false);
    const hasChildren = Boolean(item.children && item.children.length > 0);

    const paddingLeft =
        depth === 0
            ? 'pl-5 pr-4'
            : depth === 1
              ? 'pl-8 pr-4'
              : depth === 2
                ? 'pl-11 pr-4'
                : 'pl-14 pr-4';

    if (!hasChildren) {
        return (
            <Link
                href={item.href ?? '#'}
                onClick={onClose}
                className={`flex w-full items-center py-3 text-[13px] tracking-wide text-foreground/80 transition-colors hover:bg-neutral-100 hover:text-foreground dark:hover:bg-neutral-900 ${paddingLeft}`}
            >
                {item.label}
            </Link>
        );
    }

    return (
        <div className="border-b border-border/20 last:border-b-0">
            <div
                className={`flex w-full items-center justify-between transition-colors hover:bg-neutral-100/70 dark:hover:bg-neutral-900/50 ${paddingLeft}`}
            >
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="flex w-full items-center justify-between py-3 text-left"
                >
                    <span
                        className={`text-[13px] tracking-wide text-foreground ${
                            depth === 0 ? 'font-medium' : 'text-foreground/85'
                        }`}
                    >
                        {item.label}
                    </span>
                    <ChevronRight
                        className={`size-4 shrink-0 text-foreground/40 transition-transform duration-200 ${
                            open ? 'rotate-90 text-foreground' : ''
                        }`}
                    />
                </button>
            </div>
            {open && (
                <div className="border-l border-neutral-300/80 bg-neutral-50/60 dark:border-neutral-700 dark:bg-neutral-900/40">
                    {item.children!.map((child, idx) => (
                        <MobileNavItem
                            key={idx}
                            item={child}
                            depth={depth + 1}
                            onClose={onClose}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Luxury Full-Screen Search Modal ─────────────────────────────────────────

function SearchOverlay({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleClose = () => {
        (document.activeElement as HTMLElement)?.blur();
        onClose();
    };

    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 60);
        } else {
            setSearchTerm('');
        }
    }, [open]);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                handleClose();
            }
        }
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    const suggestions = [
        'Evening Gown',
        'Silk Blouse',
        'Cashmere Knit',
        'Tailored Blazer',
        'Discovery Fragrance Set',
        'Leather Tote',
    ];

    return (
        <div
            className={`fixed inset-0 z-60 overflow-y-auto overflow-x-hidden transition-all duration-300 ${
                open ? 'visible pointer-events-auto opacity-100' : 'invisible pointer-events-none opacity-0'
            }`}
            inert={!open ? true : undefined}
        >
            {/* Backdrop with blur */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={handleClose}
            />

            {/* Elevated Search Modal Container (Squared) */}
            <div className="relative mx-auto mt-0 max-w-4xl border-b border-neutral-200 bg-background px-6 pt-10 pb-12 shadow-2xl dark:border-neutral-800 sm:px-12">
                <div className="flex items-center justify-between pb-6">
                    <span className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                        Search Catalogue
                    </span>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex cursor-pointer items-center gap-1.5 text-xs tracking-wider text-muted-foreground uppercase transition-colors hover:text-foreground"
                        aria-label="Close search"
                    >
                        <span>Close</span>
                        <X className="size-4" />
                    </button>
                </div>

                <div className="relative flex items-center border-b-2 border-foreground pb-3">
                    <Search className="mr-3 size-5 text-foreground/50 sm:mr-4 sm:size-6" />
                    <input
                        ref={inputRef}
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Type to search garments, collections, notes…"
                        className="flex-1 bg-transparent text-lg font-light tracking-wide text-foreground outline-none placeholder:text-muted-foreground/60 sm:text-2xl"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            className="text-xs tracking-wider text-muted-foreground uppercase hover:text-foreground"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Popular searches */}
                <div className="mt-8">
                    <span className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground/80 uppercase">
                        Trending Searches
                    </span>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {suggestions.map((item) => (
                            <button
                                key={item}
                                type="button"
                                onClick={() => setSearchTerm(item)}
                                className="cursor-pointer border border-border/70 px-3.5 py-1.5 text-xs tracking-wider text-foreground/80 transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-8 hidden md:flex items-center justify-between border-t border-border/40 pt-4 text-[11px] text-muted-foreground">
                    <span>
                        Press{' '}
                        <kbd className="border border-border px-1.5 py-0.5 font-mono text-[10px]">
                            ESC
                        </kbd>{' '}
                        to exit
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── Main Premium Navbar Component ───────────────────────────────────────────

export default function Navbar() {
    const { settings, auth, nav_links, cart_count, customer } = usePage<any>().props;
    const navItems: NavItem[] = (nav_links as NavItem[] | undefined) ?? NAV_ITEMS;
    const cartBadge = typeof cart_count === 'number' ? cart_count : 0;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);

    const closeMobile = () => {
        (document.activeElement as HTMLElement)?.blur();
        setMobileOpen(false);
    };

    // Lock body scroll and prevent touch scroll when mobile menu is active
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
        };
    }, [mobileOpen]);

    return (
        <>
            <SearchOverlay
                open={searchOpen}
                onClose={() => setSearchOpen(false)}
            />

            {/* Main Sticky Header */}
            <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-background/95 backdrop-blur-md transition-shadow dark:border-neutral-800/80">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
                    {/* Brand Logo */}
                    <Logo settings={settings as any} />

                    {/* Desktop Navigation Links (No chevrons in header) */}
                    <nav
                        aria-label="Main navigation"
                        className="hidden h-full items-center gap-7 lg:flex xl:gap-9"
                    >
                        {navItems.map((item) => (
                            <DesktopTopNavItem key={item.label} item={item} />
                        ))}
                    </nav>

                    {/* Right Utility Icons matching exact reference image layout */}
                    <div className="flex items-center gap-0.5 sm:gap-2">
                        {/* Search */}
                        <button
                            type="button"
                            onClick={() => setSearchOpen(true)}
                            aria-label="Open search"
                            className="group flex size-8 items-center justify-center text-foreground/80 transition-colors hover:text-foreground sm:size-9"
                        >
                            <Search className="size-4.5 transition-transform duration-200 group-hover:scale-110" />
                        </button>

                        {/* Account (hidden on smallest screens to prevent header cramming, available in mobile menu) */}
                        <Link
                            href={auth?.user ? '/dashboard' : customer ? '/customer/account' : '/login'}
                            aria-label={
                                auth?.user ? 'Account dashboard' : customer ? 'My Account' : 'Sign in'
                            }
                            className="group hidden size-8 items-center justify-center text-foreground/80 transition-colors hover:text-foreground sm:flex sm:size-9"
                        >
                            <User className="size-4.5 transition-transform duration-200 group-hover:scale-110" />
                        </Link>

                        {/* Shopping Bag / Cart */}
                        <Link
                            href="/cart"
                            aria-label="Shopping bag"
                            className="group relative flex size-8 items-center justify-center text-foreground/80 transition-colors hover:text-foreground sm:size-9"
                        >
                            <ShoppingBag className="size-4.5 transition-transform duration-200 group-hover:scale-110" />
                            {/* Refined luxury badge */}
                            <span className="absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-foreground text-[8px] font-bold text-background sm:size-4 sm:text-[9px]">
                                {cartBadge}
                            </span>
                        </Link>

                        {/* Subtle Vertical Divider from Reference UI */}
                        {/* <div
                            className="mx-1 hidden h-4 w-px bg-border/80 sm:block sm:mx-1.5"
                            aria-hidden="true"
                        /> */}

                        {/* Send / Contact Plane */}
                        {/* <Link
                            href="#contact"
                            aria-label="Contact Concierge"
                            className="group hidden size-8 items-center justify-center text-foreground/80 transition-colors hover:text-foreground sm:flex sm:size-9"
                        >
                            <Send className="size-4.5 transition-transform duration-200 group-hover:scale-110" />
                        </Link> */}

                        {/* Mobile Hamburger Toggle */}
                        <button
                            type="button"
                            onClick={() => setMobileOpen((v) => !v)}
                            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={mobileOpen}
                            className="flex size-8 items-center justify-center text-foreground/80 transition-colors hover:text-foreground sm:size-9 lg:hidden"
                        >
                            {mobileOpen ? (
                                <X className="size-5" />
                            ) : (
                                <Menu className="size-5" />
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer Navigation (Rendered OUTSIDE <header> so backdrop-blur does not trap it) */}
            <div
                className={`fixed inset-0 z-50 overflow-hidden lg:hidden ${
                    mobileOpen
                        ? 'visible pointer-events-auto'
                        : 'invisible pointer-events-none'
                }`}
                inert={!mobileOpen ? true : undefined}
            >
                {/* Backdrop */}
                <div
                    className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
                        mobileOpen ? 'opacity-100' : 'opacity-0'
                    }`}
                    onClick={closeMobile}
                />

                {/* Drawer Panel */}
                <div
                    className={`fixed right-0 top-0 bottom-0 z-50 flex h-dvh w-full max-w-75 flex-col border-l border-neutral-200 bg-background shadow-2xl transition-transform duration-300 ease-in-out dark:border-neutral-800 sm:max-w-xs ${
                        mobileOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    {/* Drawer Header */}
                    <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/60 px-5">
                        <Logo settings={settings as any} />
                        <button
                            type="button"
                            onClick={closeMobile}
                            aria-label="Close menu"
                            className="flex size-9 items-center justify-center text-foreground/70 transition-colors hover:text-foreground"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Mobile Navigation Links (Takes all remaining height and scrolls smoothly) */}
                    <nav
                        aria-label="Mobile navigation"
                        className="flex-1 divide-y divide-border/20 overflow-y-auto py-2"
                    >
                        {navItems.map((item) => (
                            <MobileNavItem
                                key={item.label}
                                item={item}
                                onClose={closeMobile}
                            />
                        ))}
                    </nav>

                    {/* Drawer Footer */}
                    <div className="shrink-0 border-t border-border/60 bg-muted/20 px-5 py-4">
                        <Link
                            href={auth?.user ? '/dashboard' : customer ? '/customer/account' : '/login'}
                            onClick={closeMobile}
                            className="flex w-full items-center justify-center gap-2 border border-foreground bg-foreground px-4 py-2.5 text-xs font-semibold tracking-widest text-background uppercase transition-opacity hover:opacity-90"
                        >
                            <User className="size-4" />
                            {auth?.user ? 'Dashboard' : customer ? 'My Account' : 'Sign In'}
                        </Link>

                        <div className="mt-3 flex items-center justify-center gap-4 text-[11px] tracking-wider text-muted-foreground uppercase">
                            <Link
                                href="#contact"
                                onClick={closeMobile}
                                className="hover:text-foreground"
                            >
                                Contact Concierge
                            </Link>
                            <span>•</span>
                            <Link
                                href="#stores"
                                onClick={closeMobile}
                                className="hover:text-foreground"
                            >
                                Stores
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
