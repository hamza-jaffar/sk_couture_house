import { usePage } from "@inertiajs/react";
import React from "react";

const AppLogoIcon = () => {
    const { settings } = usePage().props;
    return (
        <div className="size-8">
            <img src={settings.general.favicon_url ?? ""} />
        </div>
    );
};

export default AppLogoIcon;
