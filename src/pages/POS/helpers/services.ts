import { axiosRequest } from '@/api/api'
import { IQueryParams, IPaginationProps, DataPropsForm } from '@/types/GlobalTypes'
import { citiesURL, customerURL } from '@/utils/network'
import { City, ICustomerProps } from '../components/types/CustomerTypes'

export const getCustomers = async (queryParams: IQueryParams) => {
  try {
    const finalURL = new URL(customerURL)
    const searchParams = new URLSearchParams()
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (!value) return
        searchParams.set(key, value.toString())
      })
    }
    finalURL.search = searchParams.toString()
    const response = await axiosRequest<IPaginationProps<ICustomerProps>>({
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
  } catch (e: unknown) {
    throw new Error(e as string)
  }
}

// export const getInventoryByCode = async (code: string) => {
//   try {
//     const response = await axiosRequest<IInventoryProps>({
//       url: `${inventoryURL}/${code}/`,
//       hasAuth: true,
//     })
//     return response?.data
//   } catch (e: unknown) {
//     throw new Error(e as string)
//   }
// }

export const postCustomers = async (values: DataPropsForm) => {
  try {
    const response = await axiosRequest<ICustomerProps>({
      method: 'post',
      url: customerURL,
      hasAuth: true,
      payload: values,
    })
    return response?.data
  } catch (e: unknown) {
    throw new Error(e as string)
  }
}

export const putCustomersEdit = async (data: { values: DataPropsForm; id: number }) => {
  try {
    const response = await axiosRequest<ICustomerProps>({
      method: 'put',
      url: `${customerURL}/${data.id}/`,
      hasAuth: true,
      payload: data.values,
    })
    return response?.data
  } catch (e: unknown) {
    throw new Error(e as string)
  }
}

export const getCities = async (queryParams: IQueryParams) => {
  try {
    const finalURL = new URL(citiesURL)
    const searchParams = new URLSearchParams()
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (!value) return
        searchParams.set(key, value.toString())
      })
    }
    finalURL.search = searchParams.toString()
    const response = await axiosRequest<IPaginationProps<City>>({
      url: finalURL,
      hasAuth: true,
      showError: false,
    })
    if (response) {
      return response.data.results
    }
  } catch (e) {
    throw new Error(e as string)
  }
}
