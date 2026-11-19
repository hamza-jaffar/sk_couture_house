import { Head, usePage } from '@inertiajs/react';
import type { PlatformSettings } from '@/types';

export interface SeoHeadProps {
    title?: string | null;
    rawTitle?: string | null;
    description?: string | null;
    keywords?: string | null;
    canonical?: string | null;
    robots?: string | null;
    ogTitle?: string | null;
    ogDescription?: string | null;
    ogImage?: string | null;
    ogType?: 'website' | 'product' | 'article';
    jsonLd?: Record<string, any> | Array<Record<string, any>> | null;
}

export default function SeoHead({
    title,
    rawTitle,
    description,
    keywords,
    canonical,
    robots,
    ogTitle,
    ogDescription,
    ogImage,
    ogType = 'website',
    jsonLd,
}: SeoHeadProps) {
    const { settings } = usePage<{ settings?: PlatformSettings }>().props;
    const seo = settings?.seo;
    const general = settings?.general;

    const storeName = general?.name || 'SK Couture House';
    const titleTemplate = seo?.meta_title_template || '%s | %store_name%';

    let formattedTitle: string;
    if (rawTitle) {
        formattedTitle = rawTitle;
    } else if (title) {
        if (titleTemplate.includes('%s')) {
            formattedTitle = titleTemplate
                .replace('%s', title)
                .replace('%store_name%', storeName);
        } else {
            formattedTitle = `${title} | ${storeName}`;
        }
    } else {
        formattedTitle = seo?.og_title || storeName;
    }

    const metaDescription =
        description ||
        seo?.meta_description ||
        general?.description ||
        undefined;

    const metaKeywords = keywords || seo?.meta_keywords || undefined;
    const metaRobots = robots || seo?.robots || 'index, follow';
    const canonicalUrl = canonical || seo?.canonical_url || undefined;
    const socialTitle = ogTitle || title || formattedTitle;
    const socialDescription = ogDescription || metaDescription;
    const socialImage =
        ogImage ||
        seo?.og_image_url ||
        general?.logo_url ||
        undefined;

    return (
        <Head>
            <title>{formattedTitle}</title>
            {metaDescription && (
                <meta name="description" content={metaDescription} />
            )}
            {metaKeywords && <meta name="keywords" content={metaKeywords} />}
            {metaRobots && <meta name="robots" content={metaRobots} />}
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

            {/* Open Graph */}
            <meta property="og:type" content={ogType} />
            <meta property="og:site_name" content={storeName} />
            <meta property="og:title" content={socialTitle} />
            {socialDescription && (
                <meta property="og:description" content={socialDescription} />
            )}
            {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
            {socialImage && <meta property="og:image" content={socialImage} />}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={socialTitle} />
            {socialDescription && (
                <meta name="twitter:description" content={socialDescription} />
            )}
            {socialImage && <meta name="twitter:image" content={socialImage} />}

            {/* JSON-LD Structured Data */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Head>
    );
}
