import { Head, Link, usePage } from '@inertiajs/react'
import Heading from '@/components/heading'
import { Button } from '@/components/ui/button'

type PageProps = {
    collections: any[];
};

const CollectionsIndex = () => {
    const { collections } = usePage<PageProps>().props;
    
    return (
        <>
            <Head title="Collections" />

            <div className="max-w-6xl w-full mx-auto p-4 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title="Collections"
                        description="Manage your product collections."
                    />
                    <Button asChild>
                        <Link href="/collections/create">
                            Add Collection
                        </Link>
                    </Button>
                </div>

                <div className="rounded-md border">
                    <table className="w-full text-sm text-left">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="p-4 font-medium">Title</th>
                                <th className="p-4 font-medium">Description</th>
                                <th className="p-4 font-medium">Featured</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {collections.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                        No collections found.
                                    </td>
                                </tr>
                            ) : (
                                collections.map((collection) => (
                                    <tr key={collection.id} className="border-b">
                                        <td className="p-4">{collection.title}</td>
                                        <td className="p-4 truncate max-w-[200px]">{collection.desc}</td>
                                        <td className="p-4">{collection.is_featured ? 'Yes' : 'No'}</td>
                                        <td className="p-4 text-right">
                                            <Link href={`/collections/${collection.id}/edit`} className="text-blue-600 hover:underline">
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}

export default CollectionsIndex
