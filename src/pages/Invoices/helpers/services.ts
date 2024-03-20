import { axiosRequest } from '../../../api/api'
import { IQueryParams, IPaginationProps, DataPropsForm } from '../../../types/GlobalTypes'
import { invoiceURL, overrideInvoiceURL } from '../../../utils/network'
import { IInvoiceProps } from '../types/InvoicesTypes'

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
      const dataFormatted: IInvoiceProps[] = response.data.results.map((item: any) => ({
        ...item,
        key: item.id,
        created_by_name: item.created_by.fullname,
        shop_name: item.shop.name,
        sale_name: item.sale_by ? item.sale_by.fullname : 'SIGNOS',
        customer_id: item.customer_id,
        customer_name: item.customer_name,
        customer_email: item.customer_email,
        customer_phone: item.customer_phone,
        invoice_items: item.invoice_items.map((itemInvoice: any) => ({
          code: itemInvoice.item_code,
          id: itemInvoice.id,
          selling_price: itemInvoice.item.selling_price,
          qty: itemInvoice.quantity,
          item: itemInvoice.item_name,
          total: itemInvoice.amount,
        })),
        invoice_number: item.invoice_number,
        payment_methods: item.payment_methods,
        is_dollar: item.is_dollar,
        is_override: item.is_override,
        dian_document_number: item.dian_document_number,
      }))
      return { ...response.data, results: dataFormatted }
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
