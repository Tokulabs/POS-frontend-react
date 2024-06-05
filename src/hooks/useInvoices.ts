import { QueryKey, useQuery } from '@tanstack/react-query'
import { IQueryParams } from '../types/GlobalTypes'
import { getInvoiceByCode, getInvoicesNew } from '../pages/Invoices/helpers/services'

export const useInvoices = (queryKey: string, queryParamas?: IQueryParams) => {
  const queryKeyToSend: QueryKey = [queryKey, queryParamas]
  const { isPending: isLoading, data: invoicesData } = useQuery({
    queryKey: queryKeyToSend,
    queryFn: async () => getInvoicesNew(queryParamas || {}),
    refetchOnWindowFocus: false,
  })
  return {
    isLoading,
    invoicesData,
  }
}

export const useGetinvoiceByCode = (queryKey: string, invoiceId: string) => {
  const queryKeyToSend: QueryKey = [queryKey, invoiceId]
  const { isPending, data: invoicesByCodeData } = useQuery({
    queryKey: queryKeyToSend,
    queryFn: async () => getInvoiceByCode(invoiceId),
    refetchOnWindowFocus: false,
    gcTime: 0,
  })
  return {
    isPending,
    invoicesByCodeData,
  }
}
