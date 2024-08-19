import { useContext, useMemo } from 'react'
import { store } from '@/store/index'
import { UserRolesEnum } from '@/pages/Users/types/UserTypes'

interface IUseRolePermissions {
  allowedRoles?: string[]
  notAllowedRoles?: string[]
}

export const useRolePermissions = ({ allowedRoles, notAllowedRoles }: IUseRolePermissions) => {
  const { state } = useContext(store)
  const userRole = UserRolesEnum[state.user?.role as keyof typeof UserRolesEnum]

  const hasPermission = useMemo(() => {
    if (allowedRoles && allowedRoles.length > 0) {
      return allowedRoles.includes(userRole)
    }
    if (notAllowedRoles && notAllowedRoles.length > 0) {
      return !notAllowedRoles.includes(userRole)
    }
    return true
  }, [allowedRoles, notAllowedRoles, userRole])

  return { hasPermission }
}
