import { axiosRequest } from '../../../api/api'
import { IQueryParams, IPaginationProps, DataPropsForm } from '../../../types/GlobalTypes'
import { invoiceURL, overrideInvoiceURL, invoiceMinimalURL } from '../../../utils/network'
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
  return await axiosRequest<IInvoiceProps>({
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
  const finalURL = new URL(invoiceURL)
  finalURL.searchParams.set('invoice_number', invoiceNumber)
  return await axiosRequest<IPaginationProps<IInvoiceProps>>({
    method: 'get',
    url: finalURL,
    hasAuth: true,
  })
}
