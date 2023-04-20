import { useQuery } from '@tanstack/react-query'
import { IQueryParams } from '../types/GlobalTypes'
import { getUsersNew } from '../pages/Users/helpers/services'

export const useUsers = (queryKey: string, queryParamas?: IQueryParams) => {
  const { isLoading, data: usersData } = useQuery(
    [queryKey, queryParamas],
    async () => getUsersNew(queryParamas ?? {}),
    {
      refetchOnWindowFocus: false,
    },
  )
  return {
    isLoading,
    usersData,
  }
}
