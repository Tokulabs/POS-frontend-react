import { useQuery } from '@tanstack/react-query'
import { IQueryParams } from '../types/GlobalTypes'
import { getGroupsNew } from '../pages/Groups/helpers/services'

export const useGroups = (queryKey: string, queryParamas?: IQueryParams) => {
  const { isLoading, data: groupsData } = useQuery(
    [queryKey, queryParamas],
    async () => getGroupsNew(queryParamas ?? {}),
    {
      refetchOnWindowFocus: false,
    },
  )
  return {
    isLoading,
    groupsData,
  }
}
