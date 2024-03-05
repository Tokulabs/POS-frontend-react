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
  try {
    await axiosRequest({
      method: 'post',
      url: paymentTerminalsURL,
      hasAuth: true,
      payload: values,
    })
  } catch (e) {
    console.log(e)
  }
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

export const deletePaymentTerminals = async (id: number) => {
  try {
    await axiosRequest({
      method: 'delete',
      url: `${paymentTerminalsURL}/${id}/`,
      hasAuth: true,
    })
  } catch (e: unknown) {
    throw new Error(e as string)
  }
}
