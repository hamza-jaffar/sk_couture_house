import { InertiaLinkProps } from "@inertiajs/react";
import { LucideIcon } from "lucide-react";

export type FlashToast = {
    type: "success" | "info" | "warning" | "error";
    message: string;
};

export type BreadcrumbItem = {
    title: string;
    href: NonNullable<InertiaLinkProps["href"]>;
};

export type NavItem = {
    title: string;
    href: NonNullable<InertiaLinkProps["href"]>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    permission?: string;
};
