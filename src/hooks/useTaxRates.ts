import { useQuery } from '@tanstack/react-query'
import { axiosRequest } from '@/api/api'
import { taxRatesURL } from '@/utils/network'
import { ITaxRate } from '@/pages/Inventories/types/InventoryTypes'

const getTaxRates = async (): Promise<ITaxRate[]> => {
  const response = await axiosRequest<ITaxRate[]>({
    url: taxRatesURL,
    hasAuth: true,
  })
  return response?.data ?? []
}

export const useTaxRates = () => {
  const { isLoading, data: taxRates } = useQuery({
    queryKey: ['tax-rates'],
    queryFn: getTaxRates,
    staleTime: Infinity, // Tax rates are global presets — rarely change
    refetchOnWindowFocus: false,
  })
  return { isLoading, taxRates: taxRates ?? [] }
}
