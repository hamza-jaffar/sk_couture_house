import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCan } from "@/hooks/use-can";
import { useCurrentUrl } from "@/hooks/use-current-url";
import { cn, toUrl } from "@/lib/utils";
import { NavItem } from "@/types/ui";
import { Link } from "@inertiajs/react";
import { SunMoon, User, UserCog, UserShield } from "lucide-react";
import React from "react";

const sidebarNavItems: NavItem[] = [
    {
        title: "Profile",
        href: "/settings/profile",
        icon: User,
        permission: "",
    },
    {
        title: "Role & Permission",
        href: "/settings/roles",
        icon: UserShield,
        permission: "roles.view",
    },

    {
        title: "Users",
        href: "/settings/users",
        icon: UserCog,
        permission: "users.view",
    },
    {
        title: "Appearance",
        href: "/settings/appearance",
        icon: SunMoon,
        permission: "",
    },
];

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const can = useCan();

    return (
        <div className="px-4 py-6">
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <div className="flex flex-col md:flex-row md:space-x-12">
                <aside className="w-full max-w-xl md:w-48">
                    <nav
                        className="flex flex-col space-y-1 space-x-0"
                        aria-label="Settings"
                    >
                        {sidebarNavItems
                            .filter(
                                (item) =>
                                    !item.permission || can(item.permission),
                            )
                            .map((item) => (
                                <Link key={toUrl(item.href)} href={item.href}>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className={cn(
                                            "flex w-full items-center justify-start gap-2",
                                            {
                                                "bg-primary text-white":
                                                    isCurrentOrParentUrl(
                                                        item.href,
                                                    ),
                                            },
                                        )}
                                    >
                                        {item.icon && (
                                            <item.icon className="h-4 w-4" />
                                        )}
                                        {item.title}
                                    </Button>
                                </Link>
                            ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="min-w-0 flex-1">
                    <section className="space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
