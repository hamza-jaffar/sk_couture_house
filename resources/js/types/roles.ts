import { PaginationBase } from "./pagination";

export type Permission = {
    id: number;
    name: string;
    guard_name?: string;
};

export type Role = {
    id: number;
    name: string;
    guard_name: string;
    is_system: boolean;
    permission_ids: number[];
    permissions_count: number;
    users_count: number;
    created_at: string;
    updated_at: string;
};

export type RoleFilters = {
    search: string;
    is_system: "all" | "0" | "1";
    permission_id: string;
    sort: string;
    direction: "asc" | "desc";
    page: number;
    per_page: number;
};

export type PaginatedRoles = {
    data: Role[];
} & PaginationBase;
