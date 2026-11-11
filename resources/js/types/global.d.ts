import type { Auth } from "@/types/auth";
import { PlatformSettings } from "./settings";

declare module "react" {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module "@inertiajs/core" {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            settings: PlatformSettings;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
