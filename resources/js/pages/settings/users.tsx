import {
    DataTable,
    DataTableColumnHeader,
    type DataTableColumnDef,
} from '@/components/data-table';
import Heading from '@/components/heading';
import FormDialog from '@/components/form-dialog';
import UserForm from '@/components/forms/setting/user-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { PaginatedUser, User, UserFilters, UserRole } from '@/types';
import {
    bulkDestroy,
    destroy,
    index,
    store,
    update,
} from '@/actions/Modules/User/Http/Controllers/Settings/UserController';
import { Combobox } from '@base-ui/react/combobox';
import { Deferred, Form, Head, router, usePage } from '@inertiajs/react';
import type { PaginationState, SortingState } from '@tanstack/table-core';
import {
    Check,
    ChevronDown,
    MoreHorizontal,
    PenIcon,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCan } from '@/hooks/use-can';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Props = {
    users?: PaginatedUser;
    filters: UserFilters;
    roles?: UserRole[];
    isAdmin: boolean;
};

type RoleOption = {
    value: string;
    label: string;
    role?: UserRole;
};

type RoleFilterProps = {
    roles: UserRole[];
    value: string;
    onValueChange: (value: string) => void;
};

type PendingDelete = {
    ids: number[];
    label: string;
};

function RoleFilter({ roles, value, onValueChange }: RoleFilterProps) {
    const options = useMemo<RoleOption[]>(
        () => [
            { value: 'all', label: 'All roles' },
            ...roles.map((role) => ({
                value: String(role.id),
                label: role.name,
                role,
            })),
        ],
        [roles],
    );
    const items = useMemo(
        () =>
            Combobox.createItems(options, {
                getValue: (option) => option.value,
                getLabel: (option) => option.label,
            }),
        [options],
    );

    return (
        <Combobox.Root
            items={items}
            value={value || 'all'}
            onValueChange={(selectedValue) => {
                if (selectedValue !== null) {
                    onValueChange(selectedValue);
                }
            }}
        >
            <Combobox.Trigger
                render={
                    <button
                        type="button"
                        aria-label="Filter users by role"
                        className="flex h-8 min-w-40 items-center justify-between gap-2 rounded-lg border border-input bg-background px-2.5 text-sm font-normal capitalize transition-colors outline-none hover:bg-accent focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                        <Combobox.Value placeholder="All roles" />
                        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                    </button>
                }
            />
            <Combobox.Portal>
                <Combobox.Positioner
                    align="start"
                    sideOffset={4}
                    className="z-50 outline-none"
                >
                    <Combobox.Popup
                        aria-label="Filter users by role"
                        className="w-(--anchor-width) min-w-64 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md"
                    >
                        <div className="relative border-b p-2">
                            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Combobox.Input
                                aria-label="Search roles"
                                placeholder="Search roles..."
                                className="h-8 w-full rounded-md bg-transparent py-1 pr-2 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <Combobox.Empty>
                            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                No roles found.
                            </p>
                        </Combobox.Empty>
                        <Combobox.List className="max-h-64 overflow-y-auto p-1">
                            {(option: RoleOption) => (
                                <Combobox.Item
                                    key={option.value}
                                    value={option.value}
                                    className="flex cursor-default items-center gap-2 rounded-md px-2 py-2 text-sm outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                                >
                                    <Combobox.ItemIndicator className="flex size-4 shrink-0 items-center justify-center">
                                        <Check className="size-4" />
                                    </Combobox.ItemIndicator>
                                    <span className="min-w-0 flex-1 truncate capitalize">
                                        {option.label}
                                    </span>
                                    {option.role && (
                                        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                            {option.role.is_system
                                                ? 'System'
                                                : 'Custom'}
                                        </span>
                                    )}
                                </Combobox.Item>
                            )}
                        </Combobox.List>
                    </Combobox.Popup>
                </Combobox.Positioner>
            </Combobox.Portal>
        </Combobox.Root>
    );
}

export default function Users({ users, filters, roles, isAdmin }: Props) {
    const can = useCan();
    const currentUserId = usePage().props.auth.user.id;
    const [search, setSearch] = useState(filters.search);
    const [isLoading, setIsLoading] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
        null,
    );
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const canDeleteUser = useCallback(
        (user: User) =>
            can('users.delete') &&
            user.id !== currentUserId &&
            (isAdmin || !user.roles?.some((role) => role.name === 'admin')),
        [can, currentUserId, isAdmin],
    );
    const canEditUser = useCallback(
        (user: User) =>
            can('users.update') &&
            user.id !== currentUserId &&
            (isAdmin || !user.roles?.some((role) => role.name === 'admin')),
        [can, currentUserId, isAdmin],
    );

    useEffect(() => {
        setSearch(filters.search);
    }, [filters.search]);

    const visitUsers = useCallback(
        (changes: Partial<UserFilters>, resetPage = true) => {
            const nextFilters = {
                ...filters,
                ...changes,
                page: resetPage ? 1 : (changes.page ?? filters.page),
            };
            const query = Object.fromEntries(
                Object.entries(nextFilters).filter(
                    ([, value]) => value !== '' && value !== 'all',
                ),
            );

            setIsLoading(true);
            router.get(
                index.url({ query }),
                {},
                {
                    only: ['users', 'filters'],
                    preserveState: true,
                    preserveScroll: true,
                    preserveErrors: true,
                    replace: true,
                    onFinish: () => setIsLoading(false),
                },
            );
        },
        [filters],
    );

    useEffect(() => {
        if (search === filters.search) {
            return;
        }

        const timeout = window.setTimeout(() => {
            visitUsers({ search });
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [filters.search, search, visitUsers]);

    const submitDelete = useCallback(() => {
        if (!pendingDelete) {
            return;
        }

        setDeleting(true);
        setDeleteError(null);
        const shouldMoveToPreviousPage =
            users !== undefined &&
            users.current_page > 1 &&
            pendingDelete.ids.length >= users.data.length &&
            users.total > pendingDelete.ids.length;
        const options = {
            preserveScroll: true,
            only: ['users', 'filters'],
            onSuccess: () => {
                setPendingDelete(null);

                if (shouldMoveToPreviousPage && users) {
                    visitUsers({ page: users.current_page - 1 }, false);
                }
            },
            onError: (errors: Record<string, string>) => {
                setDeleteError(errors.ids ?? errors.user ?? null);
            },
            onFinish: () => setDeleting(false),
        };

        if (pendingDelete.ids.length === 1) {
            router.delete(destroy.url(pendingDelete.ids[0]), {
                data: {},
                ...options,
            });
            return;
        }

        router.delete(bulkDestroy.url(), {
            data: { ids: pendingDelete.ids },
            ...options,
        });
    }, [pendingDelete, users, visitUsers]);

    const columns = useMemo<DataTableColumnDef<User>[]>(
        () => [
            {
                id: 'select',
                header: ({ table }) => {
                    const selectableRows = table
                        .getRowModel()
                        .rows.filter((row) => canDeleteUser(row.original));
                    const selectedCount = selectableRows.filter((row) =>
                        row.getIsSelected(),
                    ).length;

                    return (
                        <Checkbox
                            aria-label="Select all deletable users on this page"
                            disabled={selectableRows.length === 0}
                            checked={
                                selectedCount === selectableRows.length &&
                                selectableRows.length > 0
                            }
                            indeterminate={
                                selectedCount > 0 &&
                                selectedCount < selectableRows.length
                            }
                            onCheckedChange={(checked) => {
                                selectableRows.forEach((row) =>
                                    row.toggleSelected(checked === true),
                                );
                            }}
                        />
                    );
                },
                cell: ({ row }) => (
                    <Checkbox
                        aria-label={`Select ${row.original.name}`}
                        checked={row.getIsSelected()}
                        disabled={!canDeleteUser(row.original)}
                        onCheckedChange={(checked) =>
                            row.toggleSelected(checked === true)
                        }
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                id: 'name',
                accessorKey: 'name',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="User" />
                ),
                cell: ({ row }) => (
                    <div className="flex min-w-40 items-center gap-3">
                        <Avatar className="size-9">
                            <AvatarImage src={row.original.avatar} alt="" />
                            <AvatarFallback className="text-xs font-medium">
                                {row.original.name
                                    .split(/\s+/)
                                    .slice(0, 2)
                                    .map((part) => part[0])
                                    .join('')
                                    .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{row.original.name}</span>
                    </div>
                ),
            },
            {
                id: 'email',
                accessorKey: 'email',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Email" />
                ),
                cell: ({ row }) => <span>{row.original.email}</span>,
            },
            {
                id: 'roles',
                header: 'Roles',
                enableSorting: false,
                cell: ({ row }) =>
                    row.original.roles?.length ? (
                        <div className="flex flex-wrap gap-1.5">
                            {row.original.roles.map((role) => (
                                <span
                                    key={role.id}
                                    className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground capitalize"
                                >
                                    <span>{role.name}</span>
                                    <span className="ml-1 font-normal opacity-75">
                                        {role.is_system ? 'System' : 'Custom'}
                                    </span>
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className="text-muted-foreground">No role</span>
                    ),
            },
            {
                id: 'created_at',
                accessorKey: 'created_at',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Created" />
                ),
                cell: ({ row }) => row.original.created_at.slice(0, 10),
            },
            {
                id: 'actions',
                enableHiding: false,
                cell: ({ row }) => {
                    const canEdit = canEditUser(row.original);
                    const canDelete = canDeleteUser(row.original);

                    if (!canEdit && !canDelete) {
                        if (row.original.id === currentUserId) {
                            return (
                                <span className="text-xs text-muted-foreground">
                                    Current account
                                </span>
                            );
                        }

                        if (
                            row.original.roles?.some(
                                (role) => role.name === 'admin',
                            )
                        ) {
                            return (
                                <span className="text-xs text-muted-foreground">
                                    Admin only
                                </span>
                            );
                        }

                        return null;
                    }

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Actions for ${row.original.name}`}
                                    >
                                        <MoreHorizontal />
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="end">
                                {canEdit && (
                                    <DropdownMenuItem
                                        onClick={() => {
                                            setEditingUser(row.original);
                                            setFormOpen(true);
                                        }}
                                    >
                                        <PenIcon />
                                        Change role
                                    </DropdownMenuItem>
                                )}
                                {canDelete && (
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() =>
                                            setPendingDelete({
                                                ids: [row.original.id],
                                                label: `${row.original.name} (${row.original.email})`,
                                            })
                                        }
                                    >
                                        <Trash2 />
                                        Delete user
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ],
        [canDeleteUser, canEditUser, currentUserId],
    );

    const sorting: SortingState = [
        {
            id: filters.sort,
            desc: filters.direction === 'desc',
        },
    ];
    const pagination: PaginationState = {
        pageIndex: (users?.current_page ?? filters.page) - 1,
        pageSize: users?.per_page ?? filters.per_page,
    };

    return (
        <div className="space-y-6">
            <Head title="Platform Users" />
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <Heading
                    variant="small"
                    title="Platform Users"
                    description="Manage internal staff members, administrators, and their system access."
                />
                {can('users.create') && (
                    <Button
                        onClick={() => {
                            setEditingUser(null);
                            setFormOpen(true);
                        }}
                    >
                        <Plus />
                        Create user
                    </Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={users?.data ?? []}
                getRowId={(user) => String(user.id)}
                selectionResetKey={JSON.stringify(filters)}
                manualFiltering
                manualSorting
                manualPagination
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search users..."
                sorting={sorting}
                onSortingChange={(next) => {
                    const value =
                        typeof next === 'function' ? next(sorting) : next;

                    visitUsers({
                        sort: value[0]?.id ?? 'name',
                        direction: value[0]?.desc ? 'desc' : 'asc',
                    });
                }}
                pagination={pagination}
                onPaginationChange={(next) => {
                    const value =
                        typeof next === 'function' ? next(pagination) : next;

                    visitUsers(
                        {
                            page: value.pageIndex + 1,
                            per_page: value.pageSize,
                        },
                        false,
                    );
                }}
                pageCount={users?.last_page ?? 0}
                totalRows={users?.total ?? 0}
                initialPageSize={users?.per_page ?? filters.per_page}
                pageSizeOptions={[10, 20, 50, 100]}
                isLoading={isLoading || users === undefined}
                toolbarFilters={() => (
                    <Deferred
                        data="roles"
                        fallback={<Skeleton className="h-8 w-40" />}
                    >
                        <RoleFilter
                            roles={roles ?? []}
                            value={filters.role_id}
                            onValueChange={(roleId) =>
                                visitUsers({
                                    role_id: roleId === 'all' ? '' : roleId,
                                })
                            }
                        />
                    </Deferred>
                )}
                batchActions={
                    can('users.delete')
                        ? (_table, selectedUsers) => (
                              <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                      setPendingDelete({
                                          ids: selectedUsers.map(
                                              (user) => user.id,
                                          ),
                                          label: `${selectedUsers.length} selected users`,
                                      })
                                  }
                              >
                                  <Trash2 />
                                  Delete selected
                              </Button>
                          )
                        : undefined
                }
            />

            <Form
                key={`${editingUser?.id ?? 'new-user'}-${formOpen}`}
                {...(editingUser ? update.form(editingUser.id) : store.form())}
                resetOnSuccess
                options={{
                    only: ['users', 'filters'],
                    preserveScroll: true,
                }}
                onSuccess={() => {
                    setFormOpen(false);
                    setEditingUser(null);
                }}
            >
                {({ processing, errors }) => (
                    <FormDialog
                        open={formOpen}
                        onOpenChange={(open) => {
                            setFormOpen(open);

                            if (!open) {
                                setEditingUser(null);
                            }
                        }}
                        name={editingUser ? 'Edit user' : 'Create user'}
                        width="w-full max-w-2xl"
                        processing={processing}
                        submitDisabled={roles === undefined}
                    >
                        <UserForm
                            key={editingUser?.id ?? 'new-user-form'}
                            user={editingUser}
                            roles={roles}
                            isAdmin={isAdmin}
                            errors={errors}
                        />
                    </FormDialog>
                )}
            </Form>

            <AlertDialog
                open={pendingDelete !== null}
                onOpenChange={(open) => {
                    if (!open && !deleting) {
                        setPendingDelete(null);
                        setDeleteError(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete users?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteError ??
                                `${pendingDelete?.label} will be permanently deleted. You cannot delete your own account, and only administrators can delete administrator accounts.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={deleting}
                            onClick={submitDelete}
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

Users.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Platform Users', href: '/settings/users' },
    ],
};
