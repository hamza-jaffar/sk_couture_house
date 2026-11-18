import PageForm from '@/components/forms/page-form';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function CreatePage() {
    return (
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <Head title="Create Page" />

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
                    title="Create New Page"
                    description="Create a custom content page with SEO metadata."
                />
            </div>

            <PageForm action="/dashboard/pages" method="post" />
        </div>
    );
}

CreatePage.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pages', href: '/dashboard/pages' },
        { title: 'Create Page' },
    ],
};
