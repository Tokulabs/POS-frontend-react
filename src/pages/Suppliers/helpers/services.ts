import { axiosRequest } from '@/api/api'
import { IQueryParams, IPaginationProps, DataPropsForm } from '@/types/GlobalTypes'
import { suppliersURL } from '@/utils/network'
import { ISupplier } from '../types/SupplierTypes'

export const getSuppliers = async (queryParams: IQueryParams) => {
  try {
    const finalURL = new URL(suppliersURL)
    const searchParams = new URLSearchParams()
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (!value) return
        searchParams.set(key, value.toString())
      })
    }
    finalURL.search = searchParams.toString()
    const response = await axiosRequest<IPaginationProps<ISupplier>>({
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

export const postSuppliers = async (values: DataPropsForm) => {
  try {
    await axiosRequest({
      method: 'post',
      url: suppliersURL,
      hasAuth: true,
      payload: values,
    })
  } catch (e) {
    throw new Error(e as string)
  }
}

export const putSuppliers = async (data: { values: DataPropsForm; id: number }) => {
  try {
    await axiosRequest({
      method: 'put',
      url: `${suppliersURL}/${data.id}/`,
      hasAuth: true,
      payload: data.values,
    })
  } catch (e: unknown) {
    throw new Error(e as string)
  }
}

export const toggleActiveSupplier = async (id: number) => {
  return await axiosRequest<ISupplier>({
    method: 'post',
    url: `${suppliersURL}/${id}/toggle-active/`,
    hasAuth: true,
  })
}
