import LucideIcon from '@/components/ui/lucide-icon';
import type { PlatformSettings } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Clock,
    Lock,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';

type FooterLink = { label: string; href: string };
type FooterLinkGroup = { title: string; links: FooterLink[] };
type FooterLinks = Record<string, FooterLinkGroup>;

type SocialLink = {
    platform: string;
    href: string;
    icon: string;
};

const SOCIAL_MAP: Record<string, { label: string; icon: string }> = {
    instagram: { label: 'Instagram', icon: 'Instagram' },
    facebook: { label: 'Facebook', icon: 'Facebook' },
    tiktok: { label: 'TikTok', icon: 'Music2' },
    youtube: { label: 'YouTube', icon: 'Youtube' },
    pinterest: { label: 'Pinterest', icon: 'Pin' },
    linkedin: { label: 'LinkedIn', icon: 'Linkedin' },
    x: { label: 'X (Twitter)', icon: 'Twitter' },
};

export default function Footer() {
    const { settings, footer_links } = usePage<{
        settings?: PlatformSettings;
        footer_links?: FooterLinks;
    }>().props;

    const storeName = settings?.general?.name || 'SK Couture House';
    const sf = settings?.storefront ?? {};

    const footerAbout =
        sf.footer_about ||
        settings?.general?.tagline ||
        'Crafting timeless luxury and bespoke haute couture silhouettes. Each creation embodies heritage craftsmanship, hand-finished detailing, and effortless modern elegance.';

    const footerCopyright =
        sf.footer_copyright ||
        `© ${new Date().getFullYear()} ${storeName}. All rights reserved. Handcrafted with precision.`;

    // Active social accounts
    const activeSocials: SocialLink[] = Object.entries(SOCIAL_MAP)
        .filter(([key]) => Boolean(settings?.social?.[key as keyof typeof settings.social]))
        .map(([key, info]) => ({
            platform: info.label,
            href: settings!.social[key as keyof typeof settings.social] as string,
            icon: info.icon,
        }));

    // Dynamic link groups passed from backend
    const dynamicGroups = footer_links ? Object.values(footer_links) : [];

    return (
        <footer className="relative border-t border-neutral-800 bg-[#0a0a0a] text-neutral-300">
            {/* Subtle luxury top gradient accent */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-400/25 to-transparent" />

            {/* ── 1. Luxury Assurance Bar ────────────────────────────────────────── */}
            <div className="border-b border-neutral-800/80 bg-neutral-950/60 py-6">
                <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-amber-500/90">
                                <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold tracking-wider text-neutral-100 uppercase">
                                    Haute Couture
                                </p>
                                <p className="text-[11px] text-neutral-500">
                                    Bespoke handmade silhouettes
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-amber-500/90">
                                <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold tracking-wider text-neutral-100 uppercase">
                                    Certified Authentic
                                </p>
                                <p className="text-[11px] text-neutral-500">
                                    100% fine fabrics & stones
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-amber-500/90">
                                <Lock className="h-4 w-4" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold tracking-wider text-neutral-100 uppercase">
                                    Secure Checkout
                                </p>
                                <p className="text-[11px] text-neutral-500">
                                    Encrypted payment protection
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-amber-500/90">
                                <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold tracking-wider text-neutral-100 uppercase">
                                    VIP Concierge
                                </p>
                                <p className="text-[11px] text-neutral-500">
                                    Personal styling assistance
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 2. Main Navigation Columns ────────────────────────────────────── */}
            <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
                    {/* Brand / Maison Column (4 cols) */}
                    <div className="space-y-6 lg:col-span-4">
                        <div className="space-y-2">
                            <Link href="/" className="inline-block">
                                <h3 className="font-serif text-2xl font-light tracking-[0.2em] text-neutral-100 uppercase sm:text-3xl">
                                    {storeName}
                                </h3>
                            </Link>
                            <p className="text-[10px] tracking-[0.3em] text-amber-500/90 uppercase">
                                Atelier &bull; Haute Couture
                            </p>
                        </div>

                        <p className="text-sm leading-relaxed text-neutral-400">
                            {footerAbout}
                        </p>

                        {/* Social Links */}
                        {activeSocials.length > 0 && (
                            <div className="space-y-2.5">
                                <p className="text-[11px] font-semibold tracking-[0.2em] text-neutral-400 uppercase">
                                    Connect With The Atelier
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {activeSocials.map(({ platform, href, icon }) => (
                                        <a
                                            key={platform}
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex h-9 w-9 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/60 text-neutral-400 transition-all hover:border-neutral-500 hover:bg-neutral-800 hover:text-white"
                                            aria-label={platform}
                                            title={platform}
                                        >
                                            <LucideIcon
                                                name={icon}
                                                className="h-4 w-4 transition-transform group-hover:scale-110"
                                                strokeWidth={1.5}
                                            />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dynamic Navigation Columns (5 cols total) */}
                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:col-span-4">
                        {dynamicGroups.map((group) => (
                            <div key={group.title} className="space-y-4">
                                <p className="text-[11px] font-semibold tracking-[0.25em] text-neutral-300 uppercase">
                                    {group.title}
                                </p>
                                <ul className="space-y-3 text-[13px]">
                                    {group.links.map((link) => (
                                        <li key={link.href + link.label}>
                                            <Link
                                                href={link.href}
                                                className="text-neutral-400 transition-colors hover:text-white"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Atelier Boutique & Concierge Column (4 cols) */}
                    <div className="space-y-4 lg:col-span-4">
                        <p className="text-[11px] font-semibold tracking-[0.25em] text-neutral-300 uppercase">
                            Atelier & Concierge
                        </p>

                        <div className="space-y-3.5 text-[13px]">
                            {/* Address */}
                            {settings?.contact?.address && (
                                <div className="flex items-start gap-3 text-neutral-400">
                                    <MapPin
                                        className="mt-0.5 h-4 w-4 shrink-0 text-amber-500/80"
                                        strokeWidth={1.5}
                                    />
                                    <span className="leading-relaxed">
                                        {settings.contact.address}
                                        {settings.contact.city
                                            ? `, ${settings.contact.city}`
                                            : ''}
                                        {settings.contact.country
                                            ? `, ${settings.contact.country}`
                                            : ''}
                                    </span>
                                </div>
                            )}

                            {/* Hours */}
                            {settings?.contact?.business_hours && (
                                <div className="flex items-center gap-3 text-neutral-400">
                                    <Clock
                                        className="h-4 w-4 shrink-0 text-amber-500/80"
                                        strokeWidth={1.5}
                                    />
                                    <span>{settings.contact.business_hours}</span>
                                </div>
                            )}

                            {/* Phone */}
                            {settings?.contact?.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone
                                        className="h-4 w-4 shrink-0 text-amber-500/80"
                                        strokeWidth={1.5}
                                    />
                                    <a
                                        href={`tel:${settings.contact.phone}`}
                                        className="text-neutral-300 transition-colors hover:text-white"
                                    >
                                        {settings.contact.phone}
                                    </a>
                                </div>
                            )}

                            {/* WhatsApp VIP Concierge */}
                            {settings?.contact?.whatsapp_number && (
                                <div className="flex items-center gap-3">
                                    <MessageCircle
                                        className="h-4 w-4 shrink-0 text-emerald-500/90"
                                        strokeWidth={1.5}
                                    />
                                    <a
                                        href={`https://wa.me/${settings.contact.whatsapp_number.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-neutral-300 transition-colors hover:text-white"
                                    >
                                        <span>WhatsApp VIP: {settings.contact.whatsapp_number}</span>
                                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                                            Online
                                        </span>
                                    </a>
                                </div>
                            )}

                            {/* Email */}
                            {settings?.contact?.email && (
                                <div className="flex items-center gap-3">
                                    <Mail
                                        className="h-4 w-4 shrink-0 text-amber-500/80"
                                        strokeWidth={1.5}
                                    />
                                    <a
                                        href={`mailto:${settings.contact.email}`}
                                        className="text-neutral-300 transition-colors hover:text-white"
                                    >
                                        {settings.contact.email}
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Customer Portal Quick Buttons */}
                        <div className="pt-2 flex flex-wrap gap-2">
                            <Link
                                href="/customer/orders"
                                className="inline-flex items-center gap-1.5 rounded-sm border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:border-neutral-700 hover:bg-neutral-800 hover:text-white"
                            >
                                Track Order
                            </Link>
                            <Link
                                href="/customer/account"
                                className="inline-flex items-center gap-1.5 rounded-sm border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:border-neutral-700 hover:bg-neutral-800 hover:text-white"
                            >
                                Client Portal
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 3. Bottom Legal & Payment Badges Bar ──────────────────────────── */}
            <div className="border-t border-neutral-800/80 bg-neutral-950 py-8">
                <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
                    {/* Copyright & Heritage note */}
                    <div className="space-y-1">
                        <p className="text-xs text-neutral-500">{footerCopyright}</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
