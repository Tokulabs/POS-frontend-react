import { QueryKey, useQuery } from '@tanstack/react-query'
import { IQueryParams } from '@/types/GlobalTypes'
import { getCities } from '@/pages/POS/helpers/services'

export const useCities = (queryKey: string, queryParamas?: IQueryParams) => {
  const queryKeyToSend: QueryKey = [queryKey, queryParamas]
  const { isLoading, data: citiesData } = useQuery({
    queryKey: queryKeyToSend,
    queryFn: async () => getCities(queryParamas ?? {}),
    refetchOnWindowFocus: false,
  })
  return {
    isLoading,
    citiesData,
  }
}
