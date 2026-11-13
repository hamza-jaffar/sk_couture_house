import { usePage } from "@inertiajs/react";
import { TerminalIcon } from "lucide-react";
import AppLogoIcon from "./app-logo-icon";

const AppLogo = () => {
    const { settings } = usePage().props;
    return (
        <div className="flex gap-4">
            {/* <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <TerminalIcon className="size-4" />
            </div> */}
                <AppLogoIcon />
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                    {settings.general.name ?? "SK Couture House"}
                </span>
                <span className="truncate text-xs"> {settings.general.tagline ?? ""}</span>
            </div>
        </div>
    );
};

export default AppLogo;
