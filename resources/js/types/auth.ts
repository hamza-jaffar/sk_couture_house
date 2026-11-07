import { PaginationBase } from "./pagination";
import type { Role } from "./roles";

export type UserRole = Pick<Role, "id" | "name" | "is_system">;

export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles?: UserRole[];
    [key: string]: unknown;
};

export type PaginatedUser = {
    data: User[];
} & PaginationBase;

export type UserFilters = {
    search: string;
    role_id: string;
    sort: string;
    direction: "asc" | "desc";
    page: number;
    per_page: number;
};

export type Auth = {
    user: User;
    permissions: string[];
};
