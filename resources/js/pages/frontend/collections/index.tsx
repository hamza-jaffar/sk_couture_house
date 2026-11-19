import Navbar from '@/components/frontend/navbar';
import SeoHead from '@/components/frontend/seo-head';
import type { PlatformSettings } from '@/types';
import { Deferred, Link, usePage } from '@inertiajs/react';

// ─── Types ───────────────────────────────────────────────────────────────────

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
    collections?: Collection[];
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CollectionSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="aspect-[3/4] w-full bg-neutral-200" />
            <div className="mt-3 h-5 w-2/3 bg-neutral-200" />
            <div className="mt-2 h-4 w-1/4 bg-neutral-100" />
        </div>
    );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function CollectionCard({ collection }: { collection: Collection }) {
    return (
        <Link href={`/collections/${collection.slug}`} className="group block">
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                {collection.image_url ? (
                    <img
                        src={collection.image_url}
                        alt={collection.name}
                        className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-neutral-100">
                        <span className="text-sm uppercase tracking-widest text-neutral-400">
                            No Image
                        </span>
                    </div>
                )}
            </div>
            <div className="mt-3">
                <p className="text-[15px] font-semibold tracking-tight text-neutral-900 underline-offset-2 transition-all group-hover:underline">
                    {collection.name}
                </p>
                <p className="mt-0.5 text-sm text-neutral-500">
                    {collection.items_count} {collection.items_count === 1 ? 'Item' : 'Items'}
                </p>
            </div>
        </Link>
    );
}

// ─── Grid (rendered after deferred data loads) ────────────────────────────────

function CollectionsGrid({ collections }: { collections: Collection[] }) {
    if (collections.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-lg font-medium text-neutral-500">No collections available yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c) => (
                <CollectionCard key={c.id} collection={c} />
            ))}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CollectionsIndex({ collections }: Props) {
    const { settings } = usePage<{ settings?: PlatformSettings }>().props;
    const title = settings?.seo?.collections_title || 'Collections';
    const description = settings?.seo?.collections_description;
    const keywords = settings?.seo?.collections_keywords;

    return (
        <>
            <SeoHead
                title={title}
                description={description}
                keywords={keywords}
                ogType="website"
            />
            <div className="min-h-screen overflow-x-hidden bg-white">
                <Navbar />
                <main className="mx-auto max-w-screen-xl px-4 py-10 sm:px-6 lg:px-8">
                    <h1 className="mb-8 text-3xl font-bold tracking-tight text-neutral-900">
                        Collections
                    </h1>

                    <Deferred
                        data="collections"
                        fallback={
                            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <CollectionSkeleton key={i} />
                                ))}
                            </div>
                        }
                    >
                        <CollectionsGrid collections={collections ?? []} />
                    </Deferred>
                </main>
            </div>
        </>
    );
}
