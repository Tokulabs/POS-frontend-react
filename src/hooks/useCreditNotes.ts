import { QueryKey, useQuery } from '@tanstack/react-query'
import { IQueryParams } from '@/types/GlobalTypes'
import { getCreditNoteById, getCreditNotes } from '@/pages/CreditNotes/helpers/services'

export const useCreditNotes = (queryKey: string, queryParams?: IQueryParams) => {
  const queryKeyToSend: QueryKey = [queryKey, queryParams]
  const { isPending: isLoading, data: creditNotesData } = useQuery({
    queryKey: queryKeyToSend,
    queryFn: async () => getCreditNotes(queryParams || {}),
    refetchOnWindowFocus: false,
  })
  return {
    isLoading,
    creditNotesData,
  }
}

export const useCreditNoteById = (queryKey: string, id: number | string | undefined) => {
  const queryKeyToSend: QueryKey = [queryKey, id]
  const { isPending, data: creditNoteData } = useQuery({
    queryKey: queryKeyToSend,
    queryFn: async () => (id ? getCreditNoteById(id) : undefined),
    enabled: !!id,
    refetchOnWindowFocus: false,
    gcTime: 0,
  })
  return {
    isPending,
    creditNoteData,
  }
}
