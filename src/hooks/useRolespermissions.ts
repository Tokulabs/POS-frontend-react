import { useContext, useMemo } from 'react'
import { store } from './../store/index'
import { UserRolesEnum } from '../pages/Users/types/UserTypes'

export const useRolePermissions = (allowedRoles: string[]) => {
  const { state } = useContext(store)
  const hasPermission = useMemo(
    () => allowedRoles.includes(UserRolesEnum[state.user?.role as keyof typeof UserRolesEnum]),
    [allowedRoles, state.user?.role],
  )

  return { hasPermission }
}
