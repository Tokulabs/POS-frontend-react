import { QueryKey, useQuery } from '@tanstack/react-query'
import { IQueryParams } from '@/types/GlobalTypes'
import { getGroupsNew } from '@/pages/Groups/helpers/services'

export const useGroups = (queryKey: string, queryParamas?: IQueryParams) => {
  const queryKeyToSend: QueryKey = [queryKey, queryParamas]
  const { isLoading, data: groupsData } = useQuery({
    queryKey: queryKeyToSend,
    queryFn: async () => getGroupsNew(queryParamas ?? {}),
    refetchOnWindowFocus: false,
  })
  return {
    isLoading,
    groupsData,
  }
}
