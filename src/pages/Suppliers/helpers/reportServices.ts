import { axiosRequest } from '@/api/api'
import { supplierReportURL, supplierMonthlyTrendURL } from '@/utils/network'
import { ISupplierReportRow, ISupplierMonthlyTrend } from '../types/SupplierReportTypes'

interface ISupplierReportParams {
  startDate?: string
  endDate?: string
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

export const getSupplierReport = async ({ startDate, endDate, sortBy, sortDir }: ISupplierReportParams) => {
  const payload: Record<string, string> = {}
  if (startDate && endDate) {
    payload.start_date = startDate
    payload.end_date = endDate
  }
  if (sortBy) payload.sort_by = sortBy
  if (sortDir) payload.sort_dir = sortDir

  const response = await axiosRequest<ISupplierReportRow[]>({
    method: 'post',
    url: supplierReportURL,
    hasAuth: true,
    showError: true,
    payload,
  })
  return response?.data ?? []
}

export const getSupplierMonthlyTrend = async (supplierId: number) => {
  const response = await axiosRequest<ISupplierMonthlyTrend[]>({
    method: 'post',
    url: supplierMonthlyTrendURL,
    hasAuth: true,
    showError: true,
    payload: { supplier_id: supplierId },
  })
  return response?.data ?? []
}
