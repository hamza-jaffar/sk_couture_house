import SeoHead from '@/components/frontend/seo-head';

type PageData = {
    id: number;
    title: string;
    slug: string;
    content: string;
    meta_title: string | null;
    meta_description: string | null;
    meta_keywords: string | null;
    canonical_url: string | null;
    og_image: string | null;
    updated_at: string | null;
};

type Props = {
    page: PageData;
};

export default function FrontendPageShow({ page }: Props) {
    return (
        <>
            <SeoHead
                title={page.meta_title || page.title}
                description={page.meta_description}
                keywords={page.meta_keywords}
                canonical={page.canonical_url}
                ogImage={page.og_image}
                ogType="article"
            />

            <div className="min-h-screen bg-background">
                <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
                    <article>
                        <header className="mb-10 border-b pb-8">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                {page.title}
                            </h1>
                            {page.updated_at && (
                                <p className="mt-3 text-sm text-muted-foreground">
                                    Last updated:{' '}
                                    {new Date(page.updated_at).toLocaleDateString('en-PK', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            )}
                        </header>

                        <div
                            className="prose prose-neutral max-w-none dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: page.content }}
                        />
                    </article>
                </main>
            </div>
        </>
    );
}
