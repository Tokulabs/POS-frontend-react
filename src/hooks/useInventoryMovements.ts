import { QueryKey, useQuery } from '@tanstack/react-query'
import { IQueryParams } from '@/types/GlobalTypes'
import { getinventoryMovements } from '@/pages/Purchase/helpers/services'

export const useinventoryMovements = (queryKey: string, queryParamas?: IQueryParams) => {
  const queryKeyToSend: QueryKey = [queryKey, queryParamas]
  const { isLoading, data: inventoryMovementsData } = useQuery({
    queryKey: queryKeyToSend,
    queryFn: async () => getinventoryMovements(queryParamas ?? {}),
    refetchOnWindowFocus: false,
  })
  return {
    isLoading,
    inventoryMovementsData,
  }
}
