import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types";
import { useInitials } from "@/hooks/use-initials";

const UserInfo = ({ user }: { user: User }) => {
    const getInitials = useInitials();
    return (
        <div className="flex! items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
            </div>
        </div>
    );
};

export default UserInfo;
