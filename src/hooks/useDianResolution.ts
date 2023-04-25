import { useQuery } from '@tanstack/react-query'
import { IQueryParams } from '../types/GlobalTypes'
import { getDianResolutions } from '../pages/Dian/helpers/services'

export const useDianResolutions = (queryKey: string, queryParamas?: IQueryParams) => {
  const { isLoading, data: dianResolutionData } = useQuery(
    [queryKey, queryParamas],
    async () => getDianResolutions(queryParamas ?? {}),
    {
      refetchOnWindowFocus: false,
    },
  )
  return {
    isLoading,
    dianResolutionData,
  }
}
