import { createInertiaApp } from "@inertiajs/react";
import { Toaster } from "@/components/ui/sonner";
import AppLayout from "@/layouts/app-layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initializeTheme } from "./hooks/use-appearance";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name.startsWith('dashboard/'):
                return AppLayout
        }
    },
    withApp(app) {
        return (
            <TooltipProvider>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: "#4B5563",
    },
});

initializeTheme();
