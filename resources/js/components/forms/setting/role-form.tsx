import InputError from '@/components/ui/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import type { Permission, Role } from '@/types';
import type { FormDataErrors } from '@inertiajs/core';
import { KeyRound, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';

type Props = {
    errors: FormDataErrors<{ name: string; permission_ids: number[] }>;
    permissions?: Permission[];
    role: Role | null;
};

export default function RoleForm({ errors, permissions, role }: Props) {
    const [selectedPermissionIds, setSelectedPermissionIds] = useState(
        () => new Set(role?.permission_ids ?? []),
    );
    const permissionGroups = (permissions ?? []).reduce<
        Record<string, Permission[]>
    >((groups, permission) => {
        const [group] = permission.name.split('.');
        (groups[group] ??= []).push(permission);

        return groups;
    }, {});
    const permissionError = errors.permission_ids ?? errors['permission_ids.0'];

    return (
        <div className="space-y-6">
            <div className="grid gap-2">
                <Label htmlFor="role-name">Role name</Label>
                <Input
                    id="role-name"
                    name="name"
                    defaultValue={role?.name ?? ''}
                    placeholder="For example, manager"
                    required
                    maxLength={255}
                    aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <InputError message={errors.name} />}
            </div>

            <fieldset className="space-y-4">
                <legend className="text-sm font-semibold">Permissions</legend>
                <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        Choose what this role can access and manage.
                    </p>
                    {permissions !== undefined && (
                        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                            {selectedPermissionIds.size} selected
                        </span>
                    )}
                </div>
                {permissions === undefined ? (
                    <div
                        className="grid gap-3 sm:grid-cols-2"
                        aria-label="Loading permissions"
                    >
                        {[1, 2].map((group) => (
                            <div
                                key={group}
                                className="space-y-3 rounded-xl border p-4"
                            >
                                <Skeleton className="h-5 w-28" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                    </div>
                ) : permissions.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-6 text-center">
                        <KeyRound className="mx-auto mb-2 size-5 text-muted-foreground" />
                        <p className="text-sm font-medium">
                            No permissions available
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Add permissions before assigning them to a role.
                        </p>
                    </div>
                ) : (
                    <div className="grid max-h-96 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
                        {Object.entries(permissionGroups).map(
                            ([group, groupPermissions]) => (
                                <fieldset
                                    key={group}
                                    className="min-w-0 rounded-xl border bg-card p-4"
                                >
                                    <legend className="sr-only">
                                        {group} permissions
                                    </legend>
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                {group === 'users' ? (
                                                    <Users className="size-4" />
                                                ) : (
                                                    <ShieldCheck className="size-4" />
                                                )}
                                            </span>
                                            <h3 className="truncate text-sm font-semibold capitalize">
                                                {group}
                                            </h3>
                                        </div>
                                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                            {groupPermissions.length}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {groupPermissions.map((permission) => {
                                            const [, ...actionParts] =
                                                permission.name.split('.');
                                            const action =
                                                actionParts.join('.') ||
                                                permission.name;
                                            const inputId = `permission-${permission.id}`;

                                            return (
                                                <label
                                                    key={permission.id}
                                                    htmlFor={inputId}
                                                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent bg-muted/40 px-3 py-2.5 transition-colors hover:border-border hover:bg-muted/70 has-[:checked]:border-primary/30 has-[:checked]:bg-primary/5"
                                                >
                                                    <input
                                                        id={inputId}
                                                        type="checkbox"
                                                        name="permission_ids[]"
                                                        value={permission.id}
                                                        checked={selectedPermissionIds.has(
                                                            permission.id,
                                                        )}
                                                        onChange={(event) => {
                                                            setSelectedPermissionIds(
                                                                (current) => {
                                                                    const next =
                                                                        new Set(
                                                                            current,
                                                                        );

                                                                    if (
                                                                        event
                                                                            .target
                                                                            .checked
                                                                    ) {
                                                                        next.add(
                                                                            permission.id,
                                                                        );
                                                                    } else {
                                                                        next.delete(
                                                                            permission.id,
                                                                        );
                                                                    }

                                                                    return next;
                                                                },
                                                            );
                                                        }}
                                                        className="size-4 shrink-0 rounded border-input accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                                                    />
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block text-sm font-medium capitalize">
                                                            {action.replace(
                                                                /[._]/g,
                                                                ' ',
                                                            )}
                                                        </span>
                                                        <span className="block truncate text-xs text-muted-foreground">
                                                            {permission.name}
                                                        </span>
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </fieldset>
                            ),
                        )}
                    </div>
                )}
                {permissionError && <InputError message={permissionError} />}
            </fieldset>
        </div>
    );
}
