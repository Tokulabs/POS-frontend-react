import { axiosRequest } from '@/api/api'
import { IQueryParams, IPaginationProps, DataPropsForm } from '@/types/GlobalTypes'
import { inventoryMovementsURL } from '@/utils/network'
import { IPurchaseSimple } from '../types/PurchaseTypes'

export const getinventoryMovements = async (queryParams: IQueryParams) => {
  try {
    const finalURL = new URL(inventoryMovementsURL)
    const searchParams = new URLSearchParams()
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (!value) return
        searchParams.set(key, value.toString())
      })
    }
    finalURL.search = searchParams.toString()
    const response = await axiosRequest<IPaginationProps<IPurchaseSimple>>({
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
    throw new Error(e as string)
  }
}

export const postProviders = async (values: DataPropsForm) => {
  try {
    await axiosRequest({
      method: 'post',
      url: inventoryMovementsURL,
      hasAuth: true,
      payload: values,
    })
  } catch (e) {
    throw new Error(e as string)
  }
}

export const putProviders = async (data: { values: DataPropsForm; id: number }) => {
  try {
    await axiosRequest({
      method: 'put',
      url: `${inventoryMovementsURL}/${data.id}/`,
      hasAuth: true,
      payload: data.values,
    })
  } catch (e: unknown) {
    throw new Error(e as string)
  }
}

export const toggleActiveProvider = async (id: number) => {
  return await axiosRequest<IPurchaseSimple>({
    method: 'post',
    url: `${inventoryMovementsURL}/${id}/toggle-active/`,
    hasAuth: true,
  })
}
