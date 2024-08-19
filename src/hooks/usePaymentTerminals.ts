import { QueryKey, useQuery } from '@tanstack/react-query'
import { IQueryParams } from '@/types/GlobalTypes'
import { getPaymentTerminals } from '@/pages/PaymentTerminals/helpers/services'

export const usePaymentTerminals = (queryKey: string, queryParamas?: IQueryParams) => {
  const queryKeyToSend: QueryKey = [queryKey, queryParamas]
  const { isLoading, data: paymentTerminalsData } = useQuery({
    queryKey: queryKeyToSend,
    queryFn: async () => getPaymentTerminals(queryParamas ?? {}),
    refetchOnWindowFocus: true,
  })
  return {
    isLoading,
    paymentTerminalsData,
  }
}
