import { Head, usePage } from '@inertiajs/react';

type PageProps = {
    page: {
        title: string;
        html: string;
    };
};

const PageShow = () => {
    const { page } = usePage<PageProps>().props;

    return (
        <>
            <Head title={page.title} />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 md:px-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold tracking-tight">{page.title}</h1>
                </div>
                <article
                    className="prose prose-neutral max-w-none"
                    dangerouslySetInnerHTML={{ __html: page.html }}
                />
            </div>
        </>
    );
};

export default PageShow;
