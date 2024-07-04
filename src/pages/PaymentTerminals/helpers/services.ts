import { axiosRequest } from '../../../api/api'
import { IQueryParams, IPaginationProps, DataPropsForm } from '../../../types/GlobalTypes'
import { paymentTerminalsURL } from '../../../utils/network'
import { IPaymentTerminal } from '../types/PaymentTerminalTypes'

export const getPaymentTerminals = async (queryParams: IQueryParams) => {
  try {
    const finalURL = new URL(paymentTerminalsURL)
    const searchParams = new URLSearchParams()
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (!value) return
        searchParams.set(key, value.toString())
      })
    }
    finalURL.search = searchParams.toString()
    const response = await axiosRequest<IPaginationProps<IPaymentTerminal>>({
      url: finalURL,
      hasAuth: true,
      showError: false,
    })
    if (response) {
      const data = response.data.results.map((item) => ({
        ...item,
        key: item.id,
      }))
      return { ...response.data, results: data }
    }
  } catch (e) {
    console.log(e)
  }
}

export const postPaymentTerminals = async (values: DataPropsForm) => {
  await axiosRequest({
    method: 'post',
    url: paymentTerminalsURL,
    hasAuth: true,
    payload: values,
  })
}

export const putPaymentTerminals = async (data: { values: DataPropsForm; id: number }) => {
  try {
    await axiosRequest({
      method: 'put',
      url: `${paymentTerminalsURL}/${data.id}/`,
      hasAuth: true,
      payload: data.values,
    })
  } catch (e: unknown) {
    throw new Error(e as string)
  }
}

export const toggleActivePaymentTemrinal = async (id: number) => {
  return await axiosRequest<IPaymentTerminal>({
    method: 'post',
    url: `${paymentTerminalsURL}/${id}/toggle-active/`,
    hasAuth: true,
  })
}
