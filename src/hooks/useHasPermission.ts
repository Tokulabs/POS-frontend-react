import { useContext, useMemo } from 'react'
import { store } from '@/store/index'

/**
 * Check if the current user has a specific permission codename.
 *
 * Usage:
 *   const canEdit = useHasPermission('can_edit_inventory')
 *   const canVoid = useHasPermission('can_void_invoice')
 *
 * Returns `true` if:
 *  - The user's company_role.permissions includes the codename, OR
 *  - The user has no company_role (null) → returns false
 */
export const useHasPermission = (codename: string): boolean => {
  const { state } = useContext(store)
  const permissions = state.user?.company_role?.permissions

  return useMemo(() => {
    if (!permissions) return false
    return permissions.some((p) => p.codename === codename)
  }, [permissions, codename])
}

/**
 * Check multiple permissions at once.
 * Returns true if the user has ANY of the given permissions.
 */
export const useHasAnyPermission = (codenames: string[]): boolean => {
  const { state } = useContext(store)
  const permissions = state.user?.company_role?.permissions

  return useMemo(() => {
    if (!permissions) return false
    return codenames.some((code) => permissions.some((p) => p.codename === code))
  }, [permissions, codenames])
}
