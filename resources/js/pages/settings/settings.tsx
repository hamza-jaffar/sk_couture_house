import SettingController from '@/actions/App/Http/Controllers/Settings/SettingController'
import Heading from '@/components/heading'
import InputError from '@/components/input-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Frontend } from '@/types'
import { Form, Head, usePage } from '@inertiajs/react'

type PageProps = {
    auth: Frontend;
};

const Settings = () => {
    const { frontend } = usePage<PageProps>().props; 
    return (
        <>
            <Head title="Site settings" />

            <h1 className="sr-only">Site settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Site Settings"
                    description="Update the data that will be show in site"
                />

                <Form
                    {...SettingController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                        {/* Full Nmae */}
                        <div className="grid gap-2">
                                <Label htmlFor="email">Your Name</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    defaultValue={frontend.information.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Enter you name"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.name}
                                />
                            </div>

                            {/* Email Address */}
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>

                                <Input
                                    id="email"
                                    className="mt-1 block w-full"
                                    defaultValue={frontend.information.email}
                                    name="email"
                                    required
                                    autoComplete="email"
                                    placeholder="Enter you email"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.email}
                                />
                            </div>

                            {/* Phone Number */}
                            <div className="grid gap-2">
                                <Label htmlFor="email">Phone Number</Label>

                                <Input
                                    id="phone_number"
                                    className="mt-1 block w-full"
                                    defaultValue={frontend.information.phone_number}
                                    name="phone_number"
                                    required
                                    autoComplete="phone_number"
                                    placeholder="Enter you Phone Number"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.phone_number}
                                />
                            </div>

                            {/* Cordinates Inputs */}
                            <div className='flex flex-col sm:flex-row gap-2 w-full'>
                                <div className="grid gap-2 w-full">
                                    <Label htmlFor="north_cordinate">North Cordinate</Label>

                                    <Input
                                        id="north_cordinateil"
                                        className="mt-1 block w-full"
                                        defaultValue={frontend.information.north_cordinate}
                                        name="north_cordinate"
                                        required
                                        autoComplete="north_cordinate"
                                        placeholder="Enter you North Cordinates"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.north_cordinate}
                                    />
                                </div>
                                <div className="grid gap-2 w-full">
                                    <Label htmlFor="east_cordinate">East Cordinate</Label>

                                    <Input
                                        id="east_cordinate"
                                        className="mt-1 block w-full"
                                        defaultValue={frontend.information.east_cordinate}
                                        name="east_cordinate"
                                        required
                                        autoComplete="east_cordinate"
                                        placeholder="Enter you East Cordinate"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.east_cordinate}
                                    />
                                </div>
                            </div>

                            {/* Social Links */}
                                {/* Instagram */}
                                <div className="grid gap-2 w-full">
                                    <Label htmlFor="instagram_link">Instagram Link</Label>

                                    <Input
                                        id="instagram_link"
                                        type='url'
                                        className="mt-1 block w-full"
                                        defaultValue={frontend.information.instagram_link}
                                        name="instagram_link"
                                        autoComplete="instagram_link"
                                        placeholder="Enter you Instagram Link"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.instagram_link}
                                    />
                                </div>

                                {/* Facebook */}
                                <div className="grid gap-2 w-full">
                                    <Label htmlFor="facebook_link">Facebook Link</Label>

                                    <Input
                                        id="facebook_link"
                                        type='url'
                                        className="mt-1 block w-full"
                                        defaultValue={frontend.information.facebook_link}
                                        name="facebook_link"
                                        autoComplete="facebook_link"
                                        placeholder="Enter you Facebook Link"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.facebook_link}
                                    />
                                </div>

                                {/* YouTube */}
                                <div className="grid gap-2 w-full">
                                    <Label htmlFor="youtube_link">Youtube Link</Label>

                                    <Input
                                        id="youtube_link"
                                        type='url'
                                        className="mt-1 block w-full"
                                        defaultValue={frontend.information.youtube_link}
                                        name="youtube_link"
                                        autoComplete="youtube_link"
                                        placeholder="Enter you Youtube Link"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.youtube_link}
                                    />
                                </div>

                                {/* Tiktok */}
                                <div className="grid gap-2 w-full">
                                    <Label htmlFor="tiktok_link">Tiktok Link</Label>

                                    <Input
                                        id="tiktok_link"
                                        type='url'
                                        className="mt-1 block w-full"
                                        defaultValue={frontend.information.tiktok_link}
                                        name="tiktok_link"
                                        autoComplete="tiktok_link"
                                        placeholder="Enter you Tiktok Link"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.tiktok_link}
                                    />
                                </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
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

export default Settings