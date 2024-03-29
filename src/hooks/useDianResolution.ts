import { QueryKey, useQuery } from '@tanstack/react-query'
import { IQueryParams } from '../types/GlobalTypes'
import { getDianResolutions } from '../pages/Dian/helpers/services'

export const useDianResolutions = (queryKey: string, queryParamas?: IQueryParams) => {
  const queryKeyToSend: QueryKey = [queryKey]
  const { isLoading, data: dianResolutionData } = useQuery({
    queryKey: queryKeyToSend,
    queryFn: async () => await getDianResolutions(queryParamas ?? {}),
    refetchOnWindowFocus: false,
  })
  return {
    isLoading,
    dianResolutionData,
  }
}
