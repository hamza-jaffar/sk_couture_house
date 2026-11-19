import PageForm, { type PageData } from '@/components/forms/page-form';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

type Props = {
    page: PageData;
};

export default function EditPage({ page }: Props) {
    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title={`Edit Page — ${page.title}`} />

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => router.visit('/dashboard/pages')}
                    >
                        <ArrowLeft className="size-4" />
                    </Button>
                    <Heading
                        variant="small"
                        title={`Edit: ${page.title}`}
                        description={
                            page.is_system
                                ? 'System page — slug is fixed; content and SEO metadata are editable.'
                                : 'Custom page — all fields are editable.'
                        }
                    />
                </div>
            </div>

            <PageForm
                page={page}
                action={`/dashboard/pages/${page.slug}`}
                method="patch"
            />
        </div>
    );
}

EditPage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pages', href: '/dashboard/pages' },
        { title: 'Edit Page' },
    ],
};
