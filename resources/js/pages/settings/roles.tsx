import Heading from '@/components/heading';
import FormDialog from '@/components/form-dialog';
import RoleForm from '@/components/forms/setting/role-form';
import {
    DataTable,
    DataTableColumnHeader,
    type DataTableColumnDef,
} from '@/components/data-table';
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useCan } from '@/hooks/use-can';
import { Combobox } from '@base-ui/react/combobox';
import type { PaginatedRoles, Permission, Role, RoleFilters } from '@/types';
import {
    bulkDestroy,
    destroy,
    index,
    store,
    update,
} from '@/actions/Modules/User/Http/Controllers/Settings/RolePermissionController';
import { Deferred, Form, Head, router } from '@inertiajs/react';
import type { PaginationState, SortingState } from '@tanstack/table-core';
import {
    Check,
    ChevronDown,
    Eye,
    MoreHorizontal,
    PenIcon,
    Plus,
    Search,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    User,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Props = {
    roles?: PaginatedRoles;
    filters: RoleFilters;
    permissions?: Permission[];
};

type PendingDelete = {
    ids: number[];
    label: string;
};

type PermissionFilterOption = {
    value: string;
    label: string;
    category: string;
    action: string;
};

type PermissionFilterProps = {
    permissions: Permission[];
    value: string;
    onValueChange: (value: string) => void;
};

function PermissionFilter({
    permissions,
    value,
    onValueChange,
}: PermissionFilterProps) {
    const options = useMemo<PermissionFilterOption[]>(
        () => [
            {
                value: 'all',
                label: 'All permissions',
                category: 'All',
                action: 'permissions',
            },
            ...permissions.map((permission) => {
                const [category, ...actionParts] = permission.name.split('.');

                return {
                    value: String(permission.id),
                    label: permission.name,
                    category,
                    action: actionParts.join('.'),
                };
            }),
        ],
        [permissions],
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
                    <Button
                        type="button"
                        variant="outline"
                        className="h-8 min-w-48 justify-between font-normal"
                        aria-label="Filter by permission"
                    >
                        <Combobox.Value placeholder="All permissions" />
                        <ChevronDown className="size-4 text-muted-foreground" />
                    </Button>
                }
            />
            <Combobox.Portal>
                <Combobox.Positioner
                    align="start"
                    sideOffset={4}
                    className="z-50 outline-none"
                >
                    <Combobox.Popup
                        aria-label="Filter roles by permission"
                        className="w-(--anchor-width) min-w-64 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md"
                    >
                        <div className="relative border-b p-2">
                            <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Combobox.Input
                                aria-label="Search permissions"
                                placeholder="Search permissions..."
                                className="h-8 w-full rounded-md bg-transparent py-1 pr-2 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>
                        <Combobox.Empty>
                            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                No permissions found.
                            </p>
                        </Combobox.Empty>
                        <Combobox.List className="max-h-64 overflow-y-auto p-1">
                            {(option: PermissionFilterOption) => (
                                <Combobox.Item
                                    key={option.value}
                                    value={option.value}
                                    className="flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                                >
                                    <Combobox.ItemIndicator className="flex size-4 shrink-0 items-center justify-center">
                                        <Check className="size-4" />
                                    </Combobox.ItemIndicator>
                                    <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground capitalize">
                                        {option.category}
                                    </span>
                                    <span className="min-w-0 truncate">
                                        {option.action}
                                    </span>
                                </Combobox.Item>
                            )}
                        </Combobox.List>
                    </Combobox.Popup>
                </Combobox.Positioner>
            </Combobox.Portal>
        </Combobox.Root>
    );
}

const RoleIndex = ({ roles, filters, permissions }: Props) => {
    const can = useCan();
    const [search, setSearch] = useState(filters.search);
    const [isLoading, setIsLoading] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [viewingRole, setViewingRole] = useState<Role | null>(null);
    const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(
        null,
    );
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        setSearch(filters.search);
    }, [filters.search]);

    const visitRoles = useCallback(
        (changes: Partial<RoleFilters>, resetPage = true) => {
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
                    only: ['roles', 'filters'],
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
            visitRoles({ search });
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [filters.search, search, visitRoles]);

    const openCreateForm = () => {
        setEditingRole(null);
        setFormOpen(true);
    };

    const rolePermissionGroups = useMemo(() => {
        if (viewingRole === null || permissions === undefined) {
            return undefined;
        }

        const permissionIds = new Set(viewingRole.permission_ids);
        const groups = new Map<string, Permission[]>();

        for (const permission of permissions) {
            if (!permissionIds.has(permission.id)) {
                continue;
            }

            const [category] = permission.name.split('.');
            const group = groups.get(category) ?? [];
            group.push(permission);
            groups.set(category, group);
        }

        return Array.from(groups.entries()).sort(([left], [right]) =>
            left.localeCompare(right),
        );
    }, [permissions, viewingRole]);

    const submitDelete = () => {
        if (!pendingDelete) {
            return;
        }

        setDeleting(true);
        setDeleteError(null);
        const options = {
            preserveScroll: true,
            only: ['roles', 'filters'],
            onSuccess: () => setPendingDelete(null),
            onError: (errors: Record<string, string>) => {
                setDeleteError(errors.ids ?? errors.role ?? null);
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
    };

    const columns = useMemo<DataTableColumnDef<Role>[]>(
        () => [
            {
                id: 'select',
                header: ({ table }) => {
                    const selectableRows = table
                        .getRowModel()
                        .rows.filter((row) => !row.original.is_system);
                    const selectedCount = selectableRows.filter((row) =>
                        row.getIsSelected(),
                    ).length;

                    return (
                        <Checkbox
                            aria-label="Select all editable roles on this page"
                            disabled={!can('roles.delete')}
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
                        disabled={
                            !can('roles.delete') || row.original.is_system
                        }
                        onCheckedChange={(checked) =>
                            row.toggleSelected(checked === true)
                        }
                    />
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: 'name',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Role" />
                ),
                cell: ({ row }) => (
                    <div className="flex items-center gap-2 font-medium">
                        {row.original.is_system ? (
                            <ShieldAlert className="size-4 text-amber-600" />
                        ) : (
                            <Shield className="size-4 text-muted-foreground" />
                        )}
                        <span>{row.original.name}</span>
                        {row.original.is_system && (
                            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300">
                                System
                            </span>
                        )}
                    </div>
                ),
            },
            {
                accessorKey: 'permissions_count',
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="Permissions"
                    />
                ),
                cell: ({ row }) => (
                    <p className="flex items-center gap-2">
                        <ShieldCheck className="size-4 text-muted-foreground" />{' '}
                        {row.original.permissions_count}
                    </p>
                ),
            },
            {
                accessorKey: 'users_count',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Users" />
                ),
                cell: ({ row }) => (
                    <p className="flex items-center gap-2">
                        <User className="size-4 text-muted-foreground" />{' '}
                        {row.original.users_count}
                    </p>
                ),
            },
            {
                accessorKey: 'created_at',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Created" />
                ),
                cell: ({ row }) => row.original.created_at.slice(0, 10),
            },
            {
                id: 'actions',
                enableHiding: false,
                cell: ({ row }) => (
                    <div className="flex items-center justify-end gap-2">
                        {row.original.is_system && (
                            <span className="text-xs text-muted-foreground">
                                Immutable
                            </span>
                        )}
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
                                <DropdownMenuItem
                                    onClick={() => setViewingRole(row.original)}
                                >
                                    <Eye />
                                    View permissions
                                </DropdownMenuItem>
                                {!row.original.is_system &&
                                    can('roles.update') && (
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setEditingRole(row.original);
                                                setFormOpen(true);
                                            }}
                                        >
                                            <PenIcon />
                                            Edit role
                                        </DropdownMenuItem>
                                    )}
                                {!row.original.is_system &&
                                    can('roles.delete') && (
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={() =>
                                                setPendingDelete({
                                                    ids: [row.original.id],
                                                    label: row.original.name,
                                                })
                                            }
                                        >
                                            <Trash2 />
                                            Delete role
                                        </DropdownMenuItem>
                                    )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ),
            },
        ],
        [can],
    );

    const sorting: SortingState = [
        {
            id: filters.sort,
            desc: filters.direction === 'desc',
        },
    ];

    const pagination: PaginationState = {
        pageIndex: (roles?.current_page ?? filters.page) - 1,
        pageSize: roles?.per_page ?? filters.per_page,
    };

    const formRoute = editingRole ? update.form(editingRole.id) : store.form();

    return (
        <div className="space-y-6">
            <Head title="Roles & Permissions" />
            <div className="flex flex-wrap items-center justify-between gap-4">
                <Heading
                    variant="small"
                    title="Roles & Permissions"
                    description="Manage roles and the permissions assigned to them."
                />
                {can('roles.create') && (
                    <Button onClick={openCreateForm}>
                        <Plus />
                        Create role
                    </Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={roles?.data ?? []}
                getRowId={(role) => String(role.id)}
                selectionResetKey={JSON.stringify(filters)}
                manualFiltering
                manualSorting
                manualPagination
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search roles..."
                sorting={sorting}
                onSortingChange={(next) => {
                    const value =
                        typeof next === 'function' ? next(sorting) : next;
                    visitRoles({
                        sort: value[0]?.id ?? 'name',
                        direction: value[0]?.desc ? 'desc' : 'asc',
                    });
                }}
                pagination={pagination}
                onPaginationChange={(next) => {
                    const value =
                        typeof next === 'function' ? next(pagination) : next;
                    visitRoles(
                        {
                            page: value.pageIndex + 1,
                            per_page: value.pageSize,
                        },
                        false,
                    );
                }}
                pageCount={roles?.last_page ?? 0}
                totalRows={roles?.total ?? 0}
                initialPageSize={roles?.per_page ?? filters.per_page}
                pageSizeOptions={[10, 20, 50, 100]}
                isLoading={isLoading || roles === undefined}
                toolbarFilters={() => (
                    <div className="flex flex-wrap gap-2">
                        <Deferred
                            data="permissions"
                            fallback={<Skeleton className="h-8 w-48" />}
                        >
                            <Select
                                items={[
                                    { value: 'all', label: 'All Roles' },
                                    { value: '0', label: 'Custom Role' },
                                    { value: '1', label: 'System Role' },
                                ]}
                                value={filters.is_system}
                                onValueChange={(value) => {
                                    if (
                                        value === 'all' ||
                                        value === '0' ||
                                        value === '1'
                                    ) {
                                        visitRoles({ is_system: value });
                                    }
                                }}
                            >
                                <SelectTrigger aria-label="Filter by role type">
                                    <SelectValue placeholder="All roles" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Roles
                                    </SelectItem>
                                    <SelectItem value="0">
                                        Custom Role
                                    </SelectItem>
                                    <SelectItem value="1">
                                        System Role
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </Deferred>

                        <Deferred
                            data="permissions"
                            fallback={<Skeleton className="h-8 w-48" />}
                        >
                            <PermissionFilter
                                permissions={permissions ?? []}
                                value={filters.permission_id}
                                onValueChange={(value) =>
                                    visitRoles({
                                        permission_id:
                                            value === 'all' ? '' : value,
                                    })
                                }
                            />
                        </Deferred>
                    </div>
                )}
                batchActions={
                    can('roles.delete')
                        ? (_table, selectedRoles) => (
                              <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={selectedRoles.some(
                                      (role) => role.is_system,
                                  )}
                                  onClick={() =>
                                      setPendingDelete({
                                          ids: selectedRoles.map(
                                              (role) => role.id,
                                          ),
                                          label: `${selectedRoles.length} selected roles`,
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
                key={editingRole?.id ?? 'new-role'}
                {...formRoute}
                options={{
                    only: ['roles', 'filters'],
                    preserveScroll: true,
                }}
                onSuccess={() => {
                    setFormOpen(false);
                    setEditingRole(null);
                }}
            >
                {({ processing, errors }) => (
                    <FormDialog
                        open={formOpen}
                        onOpenChange={setFormOpen}
                        name={editingRole ? 'Edit role' : 'Create role'}
                        width="w-full max-w-3xl"
                        height="h-[90vh] max-h-[48rem]"
                        processing={processing}
                        submitDisabled={permissions === undefined}
                    >
                        <RoleForm
                            role={editingRole}
                            permissions={permissions}
                            errors={errors}
                        />
                    </FormDialog>
                )}
            </Form>

            <Sheet
                open={viewingRole !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setViewingRole(null);
                    }
                }}
            >
                <SheetContent className="w-full sm:max-w-lg">
                    <SheetHeader className="border-b px-6 py-5">
                        <SheetTitle className="text-lg">
                            {viewingRole?.name ?? 'Role permissions'}
                        </SheetTitle>
                        <SheetDescription>
                            Review the permissions assigned to this role.
                        </SheetDescription>
                        {viewingRole && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize">
                                    {viewingRole.is_system
                                        ? 'System role'
                                        : 'Custom role'}
                                </span>
                                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                    {viewingRole.permissions_count}{' '}
                                    {viewingRole.permissions_count === 1
                                        ? 'permission'
                                        : 'permissions'}
                                </span>
                            </div>
                        )}
                    </SheetHeader>
                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 pb-6">
                        {permissions === undefined ? (
                            <div
                                className="space-y-3"
                                aria-label="Loading permissions"
                            >
                                <Skeleton className="h-28 w-full" />
                                <Skeleton className="h-28 w-full" />
                            </div>
                        ) : rolePermissionGroups?.length ? (
                            rolePermissionGroups.map(([category, items]) => (
                                <section
                                    key={category}
                                    className="rounded-xl border bg-card p-4"
                                >
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <h3 className="font-semibold capitalize">
                                            {category.replaceAll('_', ' ')}
                                        </h3>
                                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                            {items.length}
                                        </span>
                                    </div>
                                    <ul className="space-y-2">
                                        {items.map((permission) => (
                                            <li
                                                key={permission.id}
                                                className="flex items-center gap-2 text-sm text-muted-foreground"
                                            >
                                                <ShieldCheck className="size-4 shrink-0 text-primary" />
                                                <span>
                                                    {permission.name
                                                        .split('.')
                                                        .slice(1)
                                                        .join('.')}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed px-5 py-10 text-center">
                                <ShieldCheck className="mx-auto mb-3 size-8 text-muted-foreground" />
                                <h3 className="font-medium">
                                    No permissions assigned
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    This role currently has no access
                                    permissions.
                                </p>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

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
                        <AlertDialogTitle>Delete roles?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteError ??
                                `${pendingDelete?.label} will be permanently deleted. System roles cannot be deleted.`}
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
};

export default RoleIndex;

RoleIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Role & Permission', href: '/settings/roles' },
    ],
};
