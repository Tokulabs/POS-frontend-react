import { QueryKey, useQuery } from '@tanstack/react-query'
import { IQueryParams } from '../types/GlobalTypes'
import { getShopsNew } from '../pages/Shops/helpers/services'

export const useShops = (queryKey: string, queryParamas?: IQueryParams) => {
  const queryKeyToSend: QueryKey = [queryKey]
  const { isLoading, data: shopsData } = useQuery({
    queryKey: queryKeyToSend,
    queryFn: async () => getShopsNew(queryParamas ?? {}),
    refetchOnWindowFocus: false,
  })
  return {
    isLoading,
    shopsData,
  }
}
