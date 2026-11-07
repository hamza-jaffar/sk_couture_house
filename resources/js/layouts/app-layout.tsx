import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BreadcrumbItem } from "@/types/ui";
import { usePage } from "@inertiajs/react";
import React from "react";

const AppLayout = ({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) => {
    const isOpen = usePage().props.sidebarOpen;

    return (
        <div className="[--header-height:calc(--spacing(13))] h-dvh w-full overflow-hidden">
            <SidebarProvider
                className="flex h-full min-h-0 flex-col overflow-hidden"
                defaultOpen={isOpen}
            >
                <SiteHeader breadcrumbs={breadcrumbs} />
                <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
                    <AppSidebar />
                    <SidebarInset className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
                        {children}
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </div>
    );
};

export default AppLayout;
