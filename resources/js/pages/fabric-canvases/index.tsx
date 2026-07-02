import { Head, Link, usePage } from '@inertiajs/react'
import Heading from '@/components/heading'
import { Button } from '@/components/ui/button'

type PageProps = {
    fabricCanvases: any[];
};

const FabricCanvasesIndex = () => {
    const { fabricCanvases } = usePage<PageProps>().props;
    
    return (
        <>
            <Head title="Fabric Canvases" />

            <div className="max-w-6xl w-full mx-auto p-4 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <Heading
                        variant="small"
                        title="Fabric Canvases"
                        description="Manage your fabric canvases."
                    />
                    <Button asChild>
                        <Link href="/fabric-canvases/create">
                            Add Fabric Canvas
                        </Link>
                    </Button>
                </div>

                <div className="rounded-md border overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="border-b bg-muted/50">
                            <tr>
                                <th className="p-4 font-medium">Name</th>
                                <th className="p-4 font-medium">Origin Mill</th>
                                <th className="p-4 font-medium">Density/Weight</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fabricCanvases.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                        No fabric canvases found.
                                    </td>
                                </tr>
                            ) : (
                                fabricCanvases.map((fc) => (
                                    <tr key={fc.id} className="border-b">
                                        <td className="p-4">{fc.name}</td>
                                        <td className="p-4">{fc.origin_mill}</td>
                                        <td className="p-4">{fc.density_weight}</td>
                                        <td className="p-4 text-right">
                                            <Link href={`/fabric-canvases/${fc.id}/edit`} className="text-blue-600 hover:underline">
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

export default FabricCanvasesIndex
