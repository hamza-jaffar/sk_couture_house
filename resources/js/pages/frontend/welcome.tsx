import Navbar from '@/components/frontend/navbar';
import SeoHead from '@/components/frontend/seo-head';
import type { PlatformSettings } from '@/types';
import { usePage } from '@inertiajs/react';

export default function Welcome() {
    const { settings } = usePage<{ settings?: PlatformSettings }>().props;
    const homeTitle = settings?.seo?.home_title || settings?.general?.name || 'SK Couture House';
    const homeDescription = settings?.seo?.home_description || settings?.seo?.meta_description || settings?.general?.description;
    const homeKeywords = settings?.seo?.home_keywords || settings?.seo?.meta_keywords;

    return (
        <>
            <SeoHead
                rawTitle={homeTitle}
                description={homeDescription}
                keywords={homeKeywords}
                ogType="website"
            />
            <div className="min-h-screen bg-background overflow-x-hidden">
                <Navbar />
                <main className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
                    <p className="text-center text-muted-foreground">
                        Welcome to the store.
                    </p>
                </main>
            </div>
        </>
    );
}
