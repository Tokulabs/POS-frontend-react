import { useQuery } from '@tanstack/react-query'
import { IQueryParams } from '../types/GlobalTypes'
import { getInventoriesNew } from '../pages/Inventories/helpers/services'

export const useInventories = (queryKey: string, queryParamas?: IQueryParams) => {
  const { isLoading, data: inventoriesData } = useQuery(
    [queryKey, queryParamas],
    async () => getInventoriesNew(queryParamas ?? {}),
    {
      refetchOnWindowFocus: false,
    },
  )
  return {
    isLoading,
    inventoriesData,
  }
}
