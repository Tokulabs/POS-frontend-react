import { axiosRequest } from '@/api/api'
import { IQueryParams, IPaginationProps, DataPropsForm } from '@/types/GlobalTypes'
import {
  invoiceURL,
  overrideInvoiceURL,
  invoiceMinimalURL,
  invoiceByCodeURL,
  invoiceUpdatePaymentMethodsURL,
  eInvoiceDianURL,
} from '@/utils/network'
import { IInvoiceMinimalProps, IInvoiceProps } from '../types/InvoicesTypes'

export interface IPurchaseProps {
  code: string
  id: number
  item: string
  qty: number
  price?: number
  total: number
  action?: React.ReactElement
  key?: number
  selling_price?: number
  usd_price?: number
  totalUSD?: number
}

export const getInvoicesNew = async (queryParams: IQueryParams) => {
  const finalURL = new URL(invoiceMinimalURL)
  const searchParams = new URLSearchParams()
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (!value) return
      searchParams.set(key, value.toString())
    })
  }
  finalURL.search = searchParams.toString()
  const response = await axiosRequest<IPaginationProps<IInvoiceMinimalProps>>({
    url: finalURL,
    hasAuth: true,
    showError: false,
  })
  if (response) {
    const data: IInvoiceMinimalProps[] = response.data.results.map((item) => ({
      ...item,
      key: item.invoice_number,
    }))
    return { ...response.data, results: data }
  }
}

export const postInvoicesNew = async (values: DataPropsForm) => {
  return await axiosRequest<{
    message: string
    data: IInvoiceProps
  }>({
    method: 'post',
    url: invoiceURL,
    hasAuth: true,
    payload: values,
  })
}

export const patchOverrideInvoice = async (invoiceNumber: string) => {
  return await axiosRequest({
    method: 'patch',
    url: `${overrideInvoiceURL}/${invoiceNumber}/`,
    hasAuth: true,
  })
}

export const getInvoiceByCode = async (invoiceNumber: string) => {
  const finalURL = new URL(invoiceByCodeURL)
  finalURL.searchParams.set('invoice_number', invoiceNumber)
  const results = await axiosRequest<IInvoiceProps>({
    method: 'get',
    url: finalURL,
    hasAuth: true,
  })
  return results?.data
}

export const updatePaymentMethods = async (data: { invoiceID: string; values: DataPropsForm }) => {
  const finalURL = new URL(invoiceUpdatePaymentMethodsURL)
  finalURL.searchParams.set('invoice_id', data.invoiceID)
  await axiosRequest({
    method: 'post',
    url: finalURL,
    hasAuth: true,
    payload: data.values,
  })
}

export const postSendElectronicInvoice = async (invoiceID: number) => {
  const finalURL = new URL(eInvoiceDianURL)
  return await axiosRequest<{ success: boolean }>({
    method: 'post',
    url: finalURL,
    hasAuth: true,
    payload: { invoice_id: invoiceID },
  })
}
