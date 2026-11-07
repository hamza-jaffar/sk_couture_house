import { usePage } from '@inertiajs/react';
import { useCallback, useMemo } from 'react';

export type Can = (permission: string) => boolean;

export function useCan(): Can {
    const {
        auth: { permissions },
    } = usePage().props;
    const grantedPermissions = useMemo(
        () => new Set(permissions),
        [permissions],
    );

    return useCallback(
        (permission: string) => grantedPermissions.has(permission),
        [grantedPermissions],
    );
}
