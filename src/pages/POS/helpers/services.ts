import { axiosRequest } from '../../../api/api'
import { IQueryParams, IPaginationProps } from '../../../types/GlobalTypes'
import { customerURL } from '../../../utils/network'
import { ICustomerProps } from '../components/types/CustomerTypes'

export const getCustomers = async (queryParams: IQueryParams) => {
  try {
    const finalURL = new URL(customerURL)
    const searchParams = new URLSearchParams()
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
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

// export const postInventoriesNew = async (values: DataPropsForm) => {
//   try {
//     await axiosRequest({
//       method: 'post',
//       url: inventoryURL,
//       hasAuth: true,
//       payload: values,
//     })
//   } catch (e: unknown) {
//     throw new Error(e as string)
//   }
// }

// export const putInventoriesEdit = async (data: { values: DataPropsForm; id: number }) => {
//   try {
//     await axiosRequest({
//       method: 'put',
//       url: `${inventoryURL}/${data.id}/`,
//       hasAuth: true,
//       payload: data.values,
//     })
//   } catch (e: unknown) {
//     throw new Error(e as string)
//   }
// }

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
