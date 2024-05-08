import { axiosRequest } from '../../../api/api'
import { IQueryParams, IPaginationProps, DataPropsForm } from '../../../types/GlobalTypes'
import { invoiceURL, overrideInvoiceURL } from '../../../utils/network'
import { IInvoiceProps } from '../types/InvoicesTypes'

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
  const finalURL = new URL(invoiceURL)
  const searchParams = new URLSearchParams()
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (!value) return
      searchParams.set(key, value.toString())
    })
  }
  finalURL.search = searchParams.toString()
  const response = await axiosRequest<IPaginationProps<IInvoiceProps>>({
    url: finalURL,
    hasAuth: true,
    showError: false,
  })
  if (response) {
    const data: IInvoiceProps[] = response.data.results.map((item) => ({
      ...item,
      key: item.id,
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

export const patchOverrideInvoice = async (invoiceNumber: number) => {
  return await axiosRequest({
    method: 'patch',
    url: `${overrideInvoiceURL}/${invoiceNumber}/`,
    hasAuth: true,
  })
}

export const getInvoiceByCode = async (code: number) => {
  const finalURL = new URL(invoiceURL)
  finalURL.searchParams.set('invoice_number', code.toString())
  return await axiosRequest<IInvoiceProps>({
    method: 'get',
    url: finalURL,
    hasAuth: true,
  })
}
