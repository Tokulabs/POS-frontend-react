import { axiosRequest } from '../../../api/api'
import { IQueryParams, IPaginationProps, DataPropsForm } from '../../../types/GlobalTypes'
import { invoiceURL, overrideInvoiceURL } from '../../../utils/network'
import { IPurchaseProps } from '../../Purchase/types/PurchaseTypes'
import { IInvoiceProps, IItemInvoice } from '../types/InvoicesTypes'

export const getInvoicesNew = async (queryParams: IQueryParams) => {
  try {
    const finalURL = new URL(invoiceURL)
    const searchParams = new URLSearchParams()
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
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
      const data = response.data.results.map((item) => ({
        ...item,
        key: item.id,
        invoice_items: item.invoice_items.map((itemInvoice: IItemInvoice): IPurchaseProps => {
          const dataFormated: IPurchaseProps = {
            code: itemInvoice.item_code,
            id: itemInvoice.id,
            selling_price: itemInvoice.item.selling_price,
            qty: itemInvoice.quantity,
            item: itemInvoice.item_name,
            total: itemInvoice.original_amount,
            usd_price: itemInvoice.item.usd_price,
            totalUSD: itemInvoice.original_usd_amount,
          }
          return dataFormated
        }),
      }))
      return { ...response.data, result: data }
    }
  } catch (e) {
    throw new Error(e as string)
  }
}

export const postInvoicesNew = async (values: DataPropsForm) => {
  try {
    await axiosRequest({
      method: 'post',
      url: invoiceURL,
      hasAuth: true,
      payload: values,
    })
  } catch (e) {
    throw new Error(e as string)
  }
}

export const patchOverrideInvoice = async (invoiceNumber: number) => {
  return await axiosRequest({
    method: 'patch',
    url: `${overrideInvoiceURL}/${invoiceNumber}/`,
    hasAuth: true,
  })
}
