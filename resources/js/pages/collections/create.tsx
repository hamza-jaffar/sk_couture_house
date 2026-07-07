import CollectionsController from '@/actions/App/Http/Controllers/CollectionsController';
import Heading from '@/components/heading'
import InputError from '@/components/input-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, Head, usePage } from '@inertiajs/react'

type CategoryOption = {
    id: number;
    name: string;
};

type PageProps = {
    categories: CategoryOption[];
};

const CreateCollection = () => {
    const { categories } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Add Collection" />

            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
                <Heading
                    variant="small"
                    title="Add Collection"
                    description="Create a new collection."
                />

                <Form
                    {...CollectionsController.store.form()}
                    options={{
                        preserveScroll: true,
                    }}
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
                                />
                                <InputError className="mt-2" message={errors.desc} />
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <input type="hidden" name="is_featured" value="0" />
                                <Checkbox 
                                    id="is_featured" 
                                    name="is_featured"
                                    value="1"
                                />
                                <Label htmlFor="is_featured">Featured Collection (Un-features other collections)</Label>
                            </div>
                            <InputError className="mt-2" message={errors.is_featured} />

                            <div className="grid gap-2">
                                <Label htmlFor="category_id">Category</Label>
                                <select id="category_id" name="category_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                    <option value="">Uncategorized</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                                <InputError className="mt-2" message={errors.category_id} />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button disabled={processing}>
                                    Save
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    )
}

export default CreateCollection
