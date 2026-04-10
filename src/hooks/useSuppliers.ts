import { QueryKey, useQuery } from '@tanstack/react-query'
import { IQueryParams } from '@/types/GlobalTypes'
import { getSuppliers } from '@/pages/Suppliers/helpers/services'

export const useSuppliers = (queryKey: string, queryParamas?: IQueryParams) => {
  const queryKeyToSend: QueryKey = [queryKey, queryParamas]
  const { isLoading, data: suppliersData } = useQuery({
    queryKey: queryKeyToSend,
    queryFn: async () => getSuppliers(queryParamas ?? {}),
    refetchOnWindowFocus: false,
  })
  return {
    isLoading,
    suppliersData,
  }
}

/** @deprecated Use useSuppliers instead */
export const useProviders = (queryKey: string, queryParamas?: IQueryParams) => {
  const { isLoading, suppliersData } = useSuppliers(queryKey, queryParamas)
  return {
    isLoading,
    providersData: suppliersData,
    suppliersData,
  }
}
