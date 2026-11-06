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
        <div className="[--header-height:calc(--spacing(13))]">
            <SidebarProvider className="flex flex-col" defaultOpen={isOpen}>
                <SiteHeader breadcrumbs={breadcrumbs} />
                <div className="flex flex-1">
                    <AppSidebar />
                    <SidebarInset>{children}</SidebarInset>
                </div>
            </SidebarProvider>
        </div>
    );
};

export default AppLayout;
