import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCurrentUrl } from "@/hooks/use-current-url";
import { cn, toUrl } from "@/lib/utils";
import { NavItem } from "@/types/ui";
import { Link } from "@inertiajs/react";
import { SunMoon, User, UserShield } from "lucide-react";
import React from "react";

const sidebarNavItems: NavItem[] = [
    {
        title: "Profile",
        href: "/settings/profile",
        icon: User,
    },
    {
        title: "Role & Permission",
        href: "/settings/roles",
        icon: UserShield,
    },
    {
        title: "Appearance",
        href: "/settings/appearance",
        icon: SunMoon,
    },
];

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    return (
        <div className="px-4 py-6">
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav
                        className="flex flex-col space-y-1 space-x-0"
                        aria-label="Settings"
                    >
                        {sidebarNavItems.map((item, index) => (
                            <Link
                                key={`${toUrl(item.href)}-${index}`}
                                href={item.href}
                            >
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start flex gap-2 items-center",
                                        {
                                            "bg-primary text-white":
                                                isCurrentOrParentUrl(item.href),
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
