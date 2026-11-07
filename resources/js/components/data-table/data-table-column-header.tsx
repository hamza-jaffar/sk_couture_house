import type { Column } from "@tanstack/table-core";
import {
    ArrowDownIcon,
    ArrowUpIcon,
    ChevronsUpDownIcon,
    EyeOffIcon,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<
    TData extends Record<string, any>,
    TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    column: Column<any, TData, TValue>;
    title: string;
}

export function DataTableColumnHeader<
    TData extends Record<string, any>,
    TValue,
>({ column, title, className }: DataTableColumnHeaderProps<TData, TValue>) {
    if (!column.getCanSort()) {
        return (
            <div
                className={cn(
                    "text-xs font-semibold tracking-wider uppercase text-muted-foreground",
                    className,
                )}
            >
                {title}
            </div>
        );
    }

    const isSorted = column.getIsSorted();

    return (
        <div className={cn("flex items-center space-x-2", className)}>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="data-[state=open]:bg-accent -ml-3 h-8 text-xs font-semibold tracking-wider uppercase text-muted-foreground hover:text-foreground"
                        >
                            <span>{title}</span>
                            {isSorted === "desc" ? (
                                <ArrowDownIcon className="ml-2 size-3.5" />
                            ) : isSorted === "asc" ? (
                                <ArrowUpIcon className="ml-2 size-3.5" />
                            ) : (
                                <ChevronsUpDownIcon className="ml-2 size-3.5 opacity-50" />
                            )}
                        </Button>
                    }
                />
                <DropdownMenuContent align="start" className="w-36">
                    <DropdownMenuItem
                        onClick={() => column.toggleSorting(false)}
                    >
                        <ArrowUpIcon className="mr-2 size-3.5 text-muted-foreground/70" />
                        Asc
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => column.toggleSorting(true)}
                    >
                        <ArrowDownIcon className="mr-2 size-3.5 text-muted-foreground/70" />
                        Desc
                    </DropdownMenuItem>
                    {column.getCanHide() && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => column.toggleVisibility(false)}
                            >
                                <EyeOffIcon className="mr-2 size-3.5 text-muted-foreground/70" />
                                Hide
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
