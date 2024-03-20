import { useQuery } from '@tanstack/react-query'
import { IQueryParams } from '../types/GlobalTypes'
import { getProviders } from './../pages/Providers/helpers/services'

export const useProviders = (queryKey: string, queryParamas?: IQueryParams) => {
  const { isLoading, data: providersData } = useQuery(
    [queryKey, queryParamas],
    async () => getProviders(queryParamas ?? {}),
    {
      refetchOnWindowFocus: false,
    },
  )
  return {
    isLoading,
    providersData,
  }
}
