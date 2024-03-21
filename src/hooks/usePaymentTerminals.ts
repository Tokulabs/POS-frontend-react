import { useQuery } from '@tanstack/react-query'
import { IQueryParams } from '../types/GlobalTypes'
import { getPaymentTerminals } from '../pages/PaymentTerminals/helpers/services'

export const usePaymentTerminals = (queryKey: string, queryParamas?: IQueryParams) => {
  const { isLoading, data: paymentTerminalsData } = useQuery(
    [queryKey, queryParamas],
    async () => getPaymentTerminals(queryParamas ?? {}),
    {
      refetchOnWindowFocus: false,
    },
  )
  return {
    isLoading,
    paymentTerminalsData,
  }
}
