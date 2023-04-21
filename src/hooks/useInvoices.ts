import { useQuery } from '@tanstack/react-query'
import { IQueryParams } from '../types/GlobalTypes'
import { getInvoicesNew } from '../pages/Invoices/helpers/services'

export const useInvoices = (queryKey: string, queryParamas?: IQueryParams) => {
  const { isLoading, data: invoicesData } = useQuery(
    [queryKey, queryParamas],
    async () => getInvoicesNew(queryParamas ?? {}),
    {
      refetchOnWindowFocus: false,
    },
  )
  return {
    isLoading,
    invoicesData,
  }
}
