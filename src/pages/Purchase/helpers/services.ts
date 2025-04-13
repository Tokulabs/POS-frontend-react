import { axiosRequest } from '@/api/api'
import { IQueryParams, IPaginationProps, DataPropsForm } from '@/types/GlobalTypes'
import { inventoryMovementsSimpleURL, inventoryMovementsURL } from '@/utils/network'
import { IPurchase, IPurchaseSimple } from '../types/PurchaseTypes'

export const getinventoryMovements = async (queryParams: IQueryParams) => {
  try {
    const finalURL = new URL(inventoryMovementsSimpleURL)
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

export const getMovementById = async (id: string): Promise<IPurchase> => {
  const finalURL = new URL(inventoryMovementsURL)
  finalURL.searchParams.set('id', id)
  const response = await axiosRequest<IPaginationProps<IPurchase>>({
    url: `${finalURL}`,
    hasAuth: true,
    showError: true,
  })
  return response?.data.results[0] ?? ({} as IPurchase)
}

export const getNextPurchaseNumber = async () => {
  return await axiosRequest<{ next_id: string }>({
    url: `${inventoryMovementsURL}/next_id/`,
    hasAuth: true,
  })
}

export const postPurchaseNew = async (values: DataPropsForm) => {
  return await axiosRequest<{
    message: string
    data: IPurchaseSimple
  }>({
    method: 'post',
    url: inventoryMovementsURL,
    hasAuth: true,
    payload: values,
    showError: true,
  })
}
