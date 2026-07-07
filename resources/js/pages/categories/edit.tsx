import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Category, Collection } from '@/types/data';
import { Head, Link, router, usePage } from '@inertiajs/react';

type CollectionOption = {
    id: number;
    title: string;
};

type PageProps = {
    category: Category;
    collections: CollectionOption[];
};

const EditCategory = () => {
    const { category, collections } = usePage<PageProps>().props;

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        router.post(`/categories/${category.id}`, {
            _method: 'put',
            name: formData.get('name'),
            desc: formData.get('desc'),
            featured_collection_id: formData.get('featured_collection_id') || null,
        });
    };

    return (
        <>
            <Head title={`Edit ${category.name}`} />
            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
                <Heading variant="small" title="Edit Category" description={`Manage ${category.name} and its linked items.`} />

                <form onSubmit={submit} className="space-y-6 rounded-md border p-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" defaultValue={category.name} required />
                        <InputError className="mt-2" message={undefined} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="desc">Description</Label>
                        <Textarea id="desc" name="desc" defaultValue={category.desc ?? ''} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="featured_collection_id">Featured Collection</Label>
                        <select id="featured_collection_id" name="featured_collection_id" defaultValue={category.featured_collection?.id ?? ''} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option value="">None</option>
                            {collections.map((collection) => (
                                <option key={collection.id} value={collection.id}>{collection.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit">Save Changes</Button>
                        <Link href="/categories" className="text-sm text-muted-foreground hover:underline">Back to categories</Link>
                    </div>
                </form>

                <div className="rounded-md border p-6">
                    <h3 className="text-sm font-semibold mb-4">Linked Items</h3>
                    {category.collections.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No items are linked to this category yet.</p>
                    ) : (
                        <ul className="space-y-2 text-sm">
                            {category.collections.map((item) => (
                                <li key={item.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                                    <span>{item.title}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
};

export default EditCategory;
