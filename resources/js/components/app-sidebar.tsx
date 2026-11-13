import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    LifeBuoyIcon,
    SendIcon,
    FrameIcon,
    PieChartIcon,
    MapIcon,
    TerminalIcon,
    LayoutDashboard,
    Folder,
    Layers,
    Shirt,
    Star,
    Tag,
} from "lucide-react";
import AppLogo from "./app-logo";

const data = {
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: <LayoutDashboard />,
        },
        {
            title: "Collections",
            url: "/dashboard/collection",
            icon: <Layers />,
        },
        {
            title: "Products",
            url: "/dashboard/product",
            icon: <Shirt />,
            permission: "products.view",
        },
        {
            title: "Coupons",
            url: "/dashboard/coupons",
            icon: <Tag />,
            permission: "coupons.view",
        },
        {
            title: "Reviews",
            url: "/dashboard/reviews",
            icon: <Star />,
            permission: "reviews.view",
        },
        {
            title: "Gallery",
            url: "/dashboard/gallery",
            icon: <Folder />,
            permission: "gallery.view",
        },
    ],
    navSecondary: [
        {
            title: "Support",
            url: "#",
            icon: <LifeBuoyIcon />,
        },
        {
            title: "Feedback",
            url: "#",
            icon: <SendIcon />,
        },
    ],
    projects: [
        {
            name: "Design Engineering",
            url: "#",
            icon: <FrameIcon />,
        },
        {
            name: "Sales & Marketing",
            url: "#",
            icon: <PieChartIcon />,
        },
        {
            name: "Travel",
            url: "#",
            icon: <MapIcon />,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar
            className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
            {...props}
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" render={<a href="#" />}>
                            <AppLogo />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavProjects projects={data.projects} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
