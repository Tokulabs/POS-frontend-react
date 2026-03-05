import { useQuery } from '@tanstack/react-query'
import { getCompanyRoles, getPermissionsGrouped } from '@/pages/Profile/helpers/rolesServices'

export const useCompanyRoles = () => {
  const { isPending, data: companyRoles, refetch } = useQuery({
    queryKey: ['companyRoles'],
    queryFn: getCompanyRoles,
    refetchOnWindowFocus: false,
  })
  return { isPending, companyRoles: companyRoles ?? [], refetch }
}

export const usePermissionsGrouped = () => {
  const { isPending, data: permissionsGrouped } = useQuery({
    queryKey: ['permissionsGrouped'],
    queryFn: getPermissionsGrouped,
    refetchOnWindowFocus: false,
    staleTime: Infinity, // permissions catalog never changes at runtime
  })
  return { isPending, permissionsGrouped: permissionsGrouped ?? {} }
}
