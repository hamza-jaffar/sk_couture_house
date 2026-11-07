import { Head } from "@inertiajs/react";
import AppearanceTabs from "@/components/appearance-tabs";
import Heading from "@/components/heading";

export default function Appearance() {
    return (
        <>
            <Head title="Appearance Settings" />

            <h1 className="sr-only">Appearance settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Appearance settings"
                    description="Update the appearance settings for your account"
                />
                <AppearanceTabs />
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: "Dashboard",
            href: "/dashboard",
        },
        {
            title: "Appearance settings",
            href: "/settings/appearance",
        },
    ],
};
