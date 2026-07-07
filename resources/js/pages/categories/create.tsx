import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Head, router, usePage } from '@inertiajs/react';
import { useMemo, useState, type FormEvent } from 'react';

type CollectionOption = {
    id: number;
    title: string;
};

type PageProps = {
    collections: CollectionOption[];
};

const CreateCategory = () => {
    const { collections } = usePage<PageProps>().props;
    const [processing, setProcessing] = useState(false);
    const csrfToken = useMemo(() => {
        if (typeof document === 'undefined') return '';
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
    }, []);

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const values = Object.fromEntries(formData.entries()) as Record<string, string>;
        values._token = csrfToken;

        setProcessing(true);
        router.post('/categories', values, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <>
            <Head title="Add Category" />
            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
                <Heading variant="small" title="Add Category" description="Create a category and choose an optional featured collection." />

                <form onSubmit={submit} className="space-y-6">
                    <input type="hidden" name="_token" value={csrfToken} />

                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" placeholder="e.g. Casual" required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="desc">Description</Label>
                        <Textarea id="desc" name="desc" placeholder="Optional description" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="featured_collection_id">Featured Collection</Label>
                        <select id="featured_collection_id" name="featured_collection_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option value="">None</option>
                            {collections.map((collection) => (
                                <option key={collection.id} value={collection.id}>{collection.title}</option>
                            ))}
                        </select>
                    </div>

                    <Button disabled={processing}>Save</Button>
                </form>
            </div>
        </>
    );
};

export default CreateCategory;
