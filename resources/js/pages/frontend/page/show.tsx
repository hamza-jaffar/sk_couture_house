import { Head } from '@inertiajs/react';

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
            <Head>
                <title>{page.meta_title ?? page.title}</title>
                {page.meta_description && (
                    <meta name="description" content={page.meta_description} />
                )}
                {page.meta_keywords && (
                    <meta name="keywords" content={page.meta_keywords} />
                )}
                {page.canonical_url && (
                    <link rel="canonical" href={page.canonical_url} />
                )}
                {page.og_image && (
                    <meta property="og:image" content={page.og_image} />
                )}
                <meta property="og:title" content={page.meta_title ?? page.title} />
                {page.meta_description && (
                    <meta property="og:description" content={page.meta_description} />
                )}
            </Head>

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
