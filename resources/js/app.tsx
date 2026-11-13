import { createInertiaApp, router } from "@inertiajs/react";
import { Toaster } from "@/components/ui/sonner";
import AppLayout from "@/layouts/app-layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initializeTheme } from "./hooks/use-appearance";
import SettingsLayout from "@/layouts/settings/layout";

const fallbackName = import.meta.env.VITE_APP_NAME || "Laravel";

// Updated reactively by router so the title callback always sees the latest store name
let currentAppName = fallbackName;

void createInertiaApp({
    title: (title) => (title ? `${title} - ${currentAppName}` : currentAppName),
    layout: (name) => {
        switch (true) {
            case name.startsWith("dashboard/"):
                return AppLayout;
            case name.startsWith("settings/"):
                return [AppLayout, SettingsLayout];
            default:
                return null;
        }
    },
    withApp(app, { page }) {
        // Keep the store name in sync with every page load / navigation
        const name = (page.props as { name?: string }).name;
        if (name) {
            currentAppName = name;
        }

        return (
            <TooltipProvider>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: "#1447e6",
    },
});

// Also update on every subsequent navigation (SPA transitions)
router.on("success", (event) => {
    const name = (event.detail.page.props as { name?: string }).name;
    if (name) {
        currentAppName = name;
    }
});

initializeTheme();
