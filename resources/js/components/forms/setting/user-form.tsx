import InputError from '@/components/ui/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import type { User, UserRole } from '@/types';
import type { FormDataErrors } from '@inertiajs/core';
import { Combobox } from '@base-ui/react/combobox';
import { Check, ChevronDown, Search, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';

type RoleOption = {
    value: string;
    label: string;
    role?: UserRole;
};

type Props = {
    errors: FormDataErrors<{
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        role_id: number | null;
    }>;
    roles?: UserRole[];
    isAdmin: boolean;
    user?: User | null;
};

export default function UserForm({ errors, roles, isAdmin, user }: Props) {
    const [selectedRoleId, setSelectedRoleId] = useState(() =>
        String(
            user?.roles?.find((role) => isAdmin || role.name !== 'admin')?.id ??
                'none',
        ),
    );
    const availableRoles = (roles ?? []).filter(
        (role) => isAdmin || role.name !== 'admin',
    );
    const roleOptions = useMemo<RoleOption[]>(
        () => [
            { value: 'none', label: 'No role' },
            ...availableRoles.map((role) => ({
                value: String(role.id),
                label: role.name,
                role,
            })),
        ],
        [availableRoles],
    );
    const roleItems = useMemo(
        () =>
            Combobox.createItems(roleOptions, {
                getValue: (option) => option.value,
                getLabel: (option) => option.label,
            }),
        [roleOptions],
    );
    const selectedRole = roleOptions.find(
        (option) => option.value === selectedRoleId,
    );
    const roleError = errors.role_id;

    return (
        <div className="space-y-6">
            {user ? (
                <section className="space-y-3 rounded-xl border bg-muted/20 p-4">
                    <div>
                        <h3 className="text-sm font-semibold">
                            Account details
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Personal details are view-only here. This form only
                            changes the user’s roles.
                        </p>
                    </div>
                    <dl className="grid gap-3 sm:grid-cols-2">
                        <div className="min-w-0">
                            <dt className="text-xs font-medium text-muted-foreground">
                                Name
                            </dt>
                            <dd className="mt-1 truncate text-sm font-medium">
                                {user.name}
                            </dd>
                        </div>
                        <div className="min-w-0">
                            <dt className="text-xs font-medium text-muted-foreground">
                                Email
                            </dt>
                            <dd className="mt-1 truncate text-sm font-medium">
                                {user.email}
                            </dd>
                        </div>
                    </dl>
                </section>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="user-name">Full name</Label>
                        <Input
                            id="user-name"
                            name="name"
                            placeholder="For example, Alex Morgan"
                            autoComplete="name"
                            required
                            maxLength={255}
                            aria-invalid={Boolean(errors.name)}
                        />
                        {errors.name && <InputError message={errors.name} />}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="user-email">Email address</Label>
                        <Input
                            id="user-email"
                            name="email"
                            type="email"
                            placeholder="alex@example.com"
                            autoComplete="email"
                            required
                            maxLength={255}
                            aria-invalid={Boolean(errors.email)}
                        />
                        {errors.email && <InputError message={errors.email} />}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="user-password">
                            Temporary password
                        </Label>
                        <Input
                            id="user-password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            minLength={12}
                            maxLength={72}
                            aria-invalid={Boolean(errors.password)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Use at least 12 characters.
                        </p>
                        {errors.password && (
                            <InputError message={errors.password} />
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="user-password-confirmation">
                            Confirm password
                        </Label>
                        <Input
                            id="user-password-confirmation"
                            name="password_confirmation"
                            type="password"
                            autoComplete="new-password"
                            required
                            minLength={12}
                            maxLength={72}
                            aria-invalid={Boolean(errors.password_confirmation)}
                        />
                        {errors.password_confirmation && (
                            <InputError
                                message={errors.password_confirmation}
                            />
                        )}
                    </div>
                </div>
            )}

            <fieldset className="space-y-3">
                <legend className="text-sm font-semibold">
                    {user ? 'Change roles' : 'Assign roles'}
                </legend>
                <p className="text-sm text-muted-foreground">
                    {user
                        ? 'Choose one role for this user. Their personal details will remain unchanged.'
                        : 'Roles control which parts of the platform this user can access. Role assignment is optional.'}
                </p>

                {(user?.roles?.length ?? 0) > 1 && (
                    <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
                        This account has multiple existing roles. Saving this
                        form will keep only the selected role.
                    </p>
                )}

                {roles === undefined ? (
                    <div className="space-y-2" aria-label="Loading roles">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : (
                    <Combobox.Root
                        items={roleItems}
                        value={selectedRoleId}
                        onValueChange={(value) => {
                            if (value !== null) {
                                setSelectedRoleId(value);
                            }
                        }}
                    >
                        <input
                            type="hidden"
                            name="role_id"
                            value={
                                selectedRoleId === 'none' ? '' : selectedRoleId
                            }
                        />
                        <Combobox.Trigger
                            render={
                                <button
                                    type="button"
                                    aria-label="Choose a role"
                                    aria-invalid={Boolean(roleError)}
                                    className="flex h-10 w-full items-center justify-between gap-3 rounded-lg border border-input bg-background px-3 text-left text-sm transition-colors outline-none hover:bg-accent/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
                                >
                                    <span className="flex min-w-0 items-center gap-2">
                                        {selectedRole?.role?.is_system && (
                                            <ShieldCheck className="size-4 shrink-0 text-amber-600" />
                                        )}
                                        <span className="truncate">
                                            {selectedRole?.label ??
                                                'Choose a role'}
                                        </span>
                                        {selectedRole?.role?.is_system && (
                                            <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300">
                                                System
                                            </span>
                                        )}
                                    </span>
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
                                    aria-label="Select user role"
                                    className="w-(--anchor-width) min-w-64 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md"
                                >
                                    <div className="relative border-b p-2">
                                        <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                                        <Combobox.Input
                                            aria-label="Search roles"
                                            placeholder="Search roles..."
                                            className="h-9 w-full rounded-md bg-transparent py-1 pr-2 pl-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                                        />
                                    </div>
                                    <Combobox.Empty>
                                        <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                            No matching roles found.
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
                                                <span className="min-w-0 flex-1 truncate">
                                                    {option.label}
                                                </span>
                                                {option.role?.is_system && (
                                                    <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300">
                                                        System
                                                    </span>
                                                )}
                                            </Combobox.Item>
                                        )}
                                    </Combobox.List>
                                </Combobox.Popup>
                            </Combobox.Positioner>
                        </Combobox.Portal>
                    </Combobox.Root>
                )}

                {!isAdmin && roles?.some((role) => role.name === 'admin') && (
                    <p className="text-xs text-muted-foreground">
                        Only administrators can assign the administrator role.
                    </p>
                )}
                {roleError && <InputError message={roleError} />}
            </fieldset>
        </div>
    );
}
