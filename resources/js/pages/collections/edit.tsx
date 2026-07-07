import CollectionsController from '@/actions/App/Http/Controllers/CollectionsController'
import Heading from '@/components/heading'
import InputError from '@/components/input-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { useForm, Form, Head, Link, router, usePage } from '@inertiajs/react'

type CategoryOption = {
    id: number;
    name: string;
};

type CollectionItem = {
    id: number;
    piece_title: string;
    desc: string | null;
    note: string | null;
    gsm: string | null;
    image?: string | null;
};

type Collection = {
    id: number;
    title: string;
    desc: string | null;
    is_featured: boolean;
    category_id?: number | null;
    items: CollectionItem[];
};

type PageProps = {
    collection: Collection;
    categories: CategoryOption[];
};

const EditCollection = () => {
    const { collection, categories } = usePage<PageProps>().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        piece_title: '',
        gsm: '',
        note: '',
        desc: '',
        image: null as File | null,
    });

    const deleteItem = (itemId: number) => {
        if (confirm('Are you sure you want to delete this piece?')) {
            router.delete(`/collections/${collection.id}/items/${itemId}`, {
                preserveScroll: true,
            });
        }
    };

    const submitItem = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/collections/${collection.id}/items`, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <>
            <Head title="Edit Collection" />

            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-10">
                <Heading
                    variant="small"
                    title="Edit Collection"
                    description={`Update ${collection.title} collection.`}
                />

                {/* ── Collection Details Form ── */}
                <Form
                    {...CollectionsController.update.form(collection.id)}
                    options={{ preserveScroll: true }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    className="mt-1 block w-full"
                                    name="title"
                                    placeholder="Collection Title"
                                    defaultValue={collection.title}
                                    required
                                />
                                <InputError className="mt-2" message={errors.title} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="desc">Description</Label>
                                <Textarea
                                    id="desc"
                                    className="mt-1 block w-full"
                                    name="desc"
                                    placeholder="Collection Description"
                                    defaultValue={collection.desc ?? ''}
                                />
                                <InputError className="mt-2" message={errors.desc} />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input type="hidden" name="is_featured" value="0" />
                                <Checkbox
                                    id="is_featured"
                                    name="is_featured"
                                    defaultChecked={collection.is_featured}
                                    value="1"
                                />
                                <Label htmlFor="is_featured">Featured Collection (Un-features other collections)</Label>
                            </div>
                            <InputError className="mt-2" message={errors.is_featured} />

                            <div className="grid gap-2">
                                <Label htmlFor="category_id">Category</Label>
                                <select
                                    id="category_id"
                                    name="category_id"
                                    defaultValue={collection.category_id ?? ''}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Uncategorized</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                                <InputError className="mt-2" message={errors.category_id} />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button disabled={processing}>Save Changes</Button>
                            </div>
                        </>
                    )}
                </Form>

                <Separator />

                {/* ── Collection Items ── */}
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Collection Items"
                        description="Manage the pieces that belong to this collection."
                    />

                    {/* Existing Items Table */}
                    {collection.items.length > 0 && (
                        <div className="rounded-md border overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="p-3 font-medium">Piece Title</th>
                                        <th className="p-3 font-medium">GSM</th>
                                        <th className="p-3 font-medium">Note</th>
                                        <th className="p-3 font-medium">Description</th>
                                        <th className="p-3 font-medium">Image</th>
                                        <th className="p-3 font-medium text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {collection.items.map((item) => (
                                        <tr key={item.id} className="border-b">
                                            <td className="p-3 font-medium">{item.piece_title}</td>
                                            <td className="p-3 text-muted-foreground">{item.gsm ?? '—'}</td>
                                            <td className="p-3 text-muted-foreground max-w-[150px] truncate">{item.note ?? '—'}</td>
                                            <td className="p-3 text-muted-foreground max-w-[200px] truncate">{item.desc ?? '—'}</td>
                                            <td className="p-3 text-muted-foreground">
                                                {item.image ? (
                                                    <img src={`/storage/${item.image}`} alt="Preview" className="w-10 h-10 object-cover rounded" />
                                                ) : '—'}
                                            </td>
                                            <td className="p-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => deleteItem(item.id)}
                                                    className="text-destructive hover:underline text-xs"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {collection.items.length === 0 && (
                        <p className="text-sm text-muted-foreground">No items yet. Add one below.</p>
                    )}

                    {/* Add Item Form */}
                    <div className="rounded-md border p-6 space-y-4">
                        <h3 className="text-sm font-semibold">Add New Item</h3>
                        <form onSubmit={submitItem} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="piece_title">Piece Title <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="piece_title"
                                        name="piece_title"
                                        placeholder="e.g. Sartorial Structure"
                                        value={data.piece_title}
                                        onChange={e => setData('piece_title', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.piece_title} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="gsm">GSM</Label>
                                    <Input
                                        id="gsm"
                                        name="gsm"
                                        placeholder="e.g. 380 GSM"
                                        value={data.gsm}
                                        onChange={e => setData('gsm', e.target.value)}
                                    />
                                    <InputError message={errors.gsm} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="note">Note</Label>
                                <Input
                                    id="note"
                                    name="note"
                                    placeholder="Short atelier note"
                                    value={data.note}
                                    onChange={e => setData('note', e.target.value)}
                                />
                                <InputError message={errors.note} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="item_desc">Description</Label>
                                <Textarea
                                    id="item_desc"
                                    name="desc"
                                    placeholder="Full description of this piece..."
                                    value={data.desc}
                                    onChange={e => setData('desc', e.target.value)}
                                />
                                <InputError message={errors.desc} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="image">Image (Optional)</Label>
                                <Input
                                    id="image"
                                    name="image"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={e => setData('image', e.target.files?.[0] || null)}
                                />
                                <InputError message={errors.image} />
                            </div>

                            <Button disabled={processing} type="submit">
                                Add Item
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditCollection;
