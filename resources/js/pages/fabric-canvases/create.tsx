import FabricCanvasController from '@/actions/App/Http/Controllers/FabricCanvasController'
import Heading from '@/components/heading'
import InputError from '@/components/input-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Form, Head } from '@inertiajs/react'

const CreateFabricCanvas = () => {
    return (
        <>
            <Head title="Add Fabric Canvas" />

            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
                <Heading
                    variant="small"
                    title="Add Fabric Canvas"
                    description="Create a new fabric canvas."
                />

                <Form
                    {...FabricCanvasController.store.form()}
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
                                />
                                <InputError className="mt-2" message={errors.desc} />
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

export default CreateFabricCanvas
