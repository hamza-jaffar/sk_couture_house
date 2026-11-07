import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import InputError from "@/components/ui/input-error";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Auth } from "@/types";
import { Form, Head, usePage } from "@inertiajs/react";

type PageProps = {
    auth: Auth;
};

const Profile = () => {
    const { auth } = usePage<PageProps>().props;
    return (
        <div className="max-w-3xl">
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Profile"
                    description="Update your name and email address"
                />

                <Form
                    action="/settings/profile"
                    method="PATCH"
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.name}
                                    name="name"
                                    required
                                    autoComplete="name"
                                    placeholder="Full name"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.name}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full"
                                    defaultValue={auth.user.email}
                                    name="email"
                                    required
                                    autoComplete="username"
                                    placeholder="Email address"
                                />

                                <InputError
                                    className="mt-2"
                                    message={errors.email}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    type="submit"
                                    data-test="update-profile-button"
                                >
                                    {processing ? <> <Spinner /> Saving... </> : "Save"}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </div>
    );
};

export default Profile;

Profile.layout = {
    breadcrumbs: [
        {
            title: "Dashboard",
            href: "/dashboard",
        },
        {
            title: "Profile settings",
            href: "/settings/profile",
        },
    ],
};
