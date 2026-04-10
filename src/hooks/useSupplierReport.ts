import { useQuery } from '@tanstack/react-query'
import { getSupplierReport, getSupplierMonthlyTrend } from '@/pages/Suppliers/helpers/reportServices'

export const useSupplierReport = (
  startDate?: string,
  endDate?: string,
  sortBy?: string,
  sortDir?: 'asc' | 'desc',
) => {
  const { isLoading, data: supplierReportData } = useQuery({
    queryKey: ['supplierReport', startDate, endDate, sortBy, sortDir],
    queryFn: () => getSupplierReport({ startDate, endDate, sortBy, sortDir }),
    refetchOnWindowFocus: false,
  })
  return { isLoading, supplierReportData }
}

export const useSupplierMonthlyTrend = (supplierId: number | null) => {
  const { isLoading, data: trendData } = useQuery({
    queryKey: ['supplierMonthlyTrend', supplierId],
    queryFn: () => getSupplierMonthlyTrend(supplierId!),
    enabled: !!supplierId,
    refetchOnWindowFocus: false,
  })
  return { isLoading, trendData }
}
