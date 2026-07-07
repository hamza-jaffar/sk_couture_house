import { Head, Link, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Category } from '@/types/data';

type PageProps = {
    categories: Category[];
};

const CategoriesIndex = () => {
    const { categories } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Categories" />
            <div className="max-w-6xl w-full mx-auto p-4 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title="Categories"
                        description="Create categories such as Casual, Function, and link them to collections and items."
                    />
                    <Button asChild>
                        <Link href="/categories/create">Add Category</Link>
                    </Button>
                </div>

                <div className="rounded-md border">
                    <table className="w-full text-sm text-left">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="p-4 font-medium">Name</th>
                                <th className="p-4 font-medium">Featured Collection</th>
                                <th className="p-4 font-medium">Items</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-muted-foreground">No categories found.</td>
                                </tr>
                            ) : (
                                categories.map((category) => (
                                    <tr key={category.id} className="border-b">
                                        <td className="p-4">
                                            <div className="font-medium">{category.name}</div>
                                            {category.desc ? <div className="text-xs text-muted-foreground">{category.desc}</div> : null}
                                        </td>
                                        <td className="p-4">{category.featured_collection?.title ?? '—'}</td>
                                        <td className="p-4">{category.collections.length}</td>
                                        <td className="p-4 text-right">
                                            <Link href={`/categories/${category.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default CategoriesIndex;
