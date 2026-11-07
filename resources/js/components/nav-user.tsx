import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { Form, Link, usePage } from "@inertiajs/react";
import { ChevronsUpDownIcon, LogOutIcon, Settings } from "lucide-react";
import UserInfo from "@/components/user-info";

export function NavUser() {
    const { isMobile } = useSidebar();
    const { auth } = usePage().props;

    if (!auth.user) {
        return null;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <SidebarMenuButton
                                size="lg"
                                className="aria-expanded:bg-muted aria-expanded:text-foreground"
                            />
                        }
                    >
                        <UserInfo user={auth.user} />
                        <ChevronsUpDownIcon className="ml-auto size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="p-0 font-normal">
                                <UserInfo user={auth.user} />
                            </DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <Link
                                // className="flex gap-2 items-center"
                                href="/settings/profile"
                            >
                                <DropdownMenuItem>
                                    <Settings />
                                    Settings
                                </DropdownMenuItem>
                            </Link>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <Form method="POST" action="/logout">
                                    <button
                                        type="submit"
                                        className="flex gap-2 items-center cursor-pointer"
                                    >
                                        <LogOutIcon size={12} />
                                        Log out
                                    </button>
                                </Form>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
