import { axiosRequest } from '@/api/api'
import { IQueryParams, IPaginationProps, DataPropsForm } from '@/types/GlobalTypes'
import { customerURL } from '@/utils/network'
import { ICustomerProps } from '../components/types/CustomerTypes'

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

// export const deleteInventories = async (id: number) => {
//   try {
//     await axiosRequest({
//       method: 'delete',
//       url: `${inventoryURL}/${id}/`,
//       hasAuth: true,
//     })
//   } catch (e: unknown) {
//     throw new Error(e as string)
//   }
// }

// export const postImageToCloudinary = async (file: FormData) => {
//   try {
//     return await axiosRequest<{ url: string }>({
//       method: 'post',
//       url: cloudinaryURL,
//       payload: file,
//     })
//   } catch (e: unknown) {
//     throw new Error(e as string)
//   }
// }
