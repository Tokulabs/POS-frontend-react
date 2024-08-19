import { QueryKey, useQuery } from '@tanstack/react-query'
import { IQueryParams } from '@/types/GlobalTypes'
import { getInventoriesNew } from '@/pages/Inventories/helpers/services'

export const useInventories = (queryKey: string, queryParamas?: IQueryParams) => {
  const queryKeyToSend: QueryKey = [queryKey, queryParamas]
  const { isLoading, data: inventoriesData } = useQuery({
    queryKey: queryKeyToSend,
    queryFn: async () => getInventoriesNew(queryParamas || {}),
    refetchOnWindowFocus: false,
  })
  return {
    isLoading,
    inventoriesData,
  }
}
