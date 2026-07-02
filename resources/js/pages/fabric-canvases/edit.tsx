import FabricCanvasController from '@/actions/App/Http/Controllers/FabricCanvasController'
import Heading from '@/components/heading'
import InputError from '@/components/input-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Form, Head, usePage } from '@inertiajs/react'

type PageProps = {
    fabricCanvas: any;
};

const EditFabricCanvas = () => {
    const { fabricCanvas } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Edit Fabric Canvas" />

            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
                <Heading
                    variant="small"
                    title="Edit Fabric Canvas"
                    description={`Update ${fabricCanvas.name} fabric canvas.`}
                />

                <Form
                    {...FabricCanvasController.update.form(fabricCanvas.id)}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        name="name"
                                        placeholder="Name"
                                        defaultValue={fabricCanvas.name}
                                        required
                                    />
                                    <InputError className="mt-2" message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="origin_mill">Origin Mill</Label>
                                    <Input
                                        id="origin_mill"
                                        className="mt-1 block w-full"
                                        name="origin_mill"
                                        placeholder="Origin Mill"
                                        defaultValue={fabricCanvas.origin_mill ?? ''}
                                    />
                                    <InputError className="mt-2" message={errors.origin_mill} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="density_weight">Density / Weight</Label>
                                    <Input
                                        id="density_weight"
                                        className="mt-1 block w-full"
                                        name="density_weight"
                                        placeholder="Density / Weight"
                                        defaultValue={fabricCanvas.density_weight ?? ''}
                                    />
                                    <InputError className="mt-2" message={errors.density_weight} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="structure">Structure</Label>
                                    <Input
                                        id="structure"
                                        className="mt-1 block w-full"
                                        name="structure"
                                        placeholder="Structure"
                                        defaultValue={fabricCanvas.structure ?? ''}
                                    />
                                    <InputError className="mt-2" message={errors.structure} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="formulation">Formulation</Label>
                                    <Input
                                        id="formulation"
                                        className="mt-1 block w-full"
                                        name="formulation"
                                        placeholder="Formulation"
                                        defaultValue={fabricCanvas.formulation ?? ''}
                                    />
                                    <InputError className="mt-2" message={errors.formulation} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="rigidity">Rigidity</Label>
                                    <Input
                                        id="rigidity"
                                        className="mt-1 block w-full"
                                        name="rigidity"
                                        placeholder="Rigidity"
                                        defaultValue={fabricCanvas.rigidity ?? ''}
                                    />
                                    <InputError className="mt-2" message={errors.rigidity} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="breathability">Breathability</Label>
                                    <Input
                                        id="breathability"
                                        className="mt-1 block w-full"
                                        name="breathability"
                                        placeholder="Breathability"
                                        defaultValue={fabricCanvas.breathability ?? ''}
                                    />
                                    <InputError className="mt-2" message={errors.breathability} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="warmth">Warmth (Number)</Label>
                                    <Input
                                        id="warmth"
                                        type="number"
                                        className="mt-1 block w-full"
                                        name="warmth"
                                        placeholder="Warmth"
                                        defaultValue={fabricCanvas.warmth ?? ''}
                                    />
                                    <InputError className="mt-2" message={errors.warmth} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="luster">Luster (Number)</Label>
                                    <Input
                                        id="luster"
                                        type="number"
                                        className="mt-1 block w-full"
                                        name="luster"
                                        placeholder="Luster"
                                        defaultValue={fabricCanvas.luster ?? ''}
                                    />
                                    <InputError className="mt-2" message={errors.luster} />
                                </div>
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="desc">Description</Label>
                                <Textarea
                                    id="desc"
                                    className="mt-1 block w-full"
                                    name="desc"
                                    placeholder="Description"
                                    defaultValue={fabricCanvas.desc ?? ''}
                                />
                                <InputError className="mt-2" message={errors.desc} />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button disabled={processing}>
                                    Save Changes
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    )
}

export default EditFabricCanvas
