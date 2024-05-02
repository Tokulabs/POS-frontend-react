import { QueryKey, useQuery } from '@tanstack/react-query'
import { IQueryParams } from '../types/GlobalTypes'
import { getUsersNew } from '../pages/Users/helpers/services'

export const useUsers = (queryKey: string, queryParamas?: IQueryParams) => {
  const queryKeyToSend: QueryKey = [queryKey]
  const { isLoading, data: usersData } = useQuery({
    queryKey: queryKeyToSend,
    queryFn: async () => getUsersNew(queryParamas ?? {}),
    refetchOnWindowFocus: false,
  })
  return {
    isLoading,
    usersData,
  }
}
