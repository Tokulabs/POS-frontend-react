import { axiosRequest } from '@/api/api'
import { IQueryParams, IPaginationProps, DataPropsForm } from '@/types/GlobalTypes'
import { inventoryURL, uploadImageAWSURL } from '@/utils/network'
import { IInventoryProps, ImageUploadAWSProps } from '../types/InventoryTypes'

export const getInventoriesNew = async (queryParams: IQueryParams) => {
  try {
    const finalURL = new URL(inventoryURL)
    const searchParams = new URLSearchParams()
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (!value) return
        searchParams.set(key, value.toString())
      })
    }
    finalURL.search = searchParams.toString()
    const response = await axiosRequest<IPaginationProps<IInventoryProps>>({
      url: finalURL,
      hasAuth: true,
      showError: false,
    })
    if (response) {
      const data = response.data.results.map((item) => ({
        ...item,
        key: item.id,
        groupInfo: `${item.group?.belongs_to?.name ? `${item.group?.belongs_to?.name} /` : ''} ${
          item.group?.name
        }`,
        providerInfo: item.provider?.legal_name || 'N/A',
        photoInfo: item.photo,
      }))
      return { ...response.data, results: data }
    }
  } catch (e: unknown) {
    throw new Error(e as string)
  }
}

export const getInventoryByCode = async (code: string) => {
  try {
    const response = await axiosRequest<IInventoryProps>({
      url: `${inventoryURL}/${code}/`,
      hasAuth: true,
    })
    return response?.data
  } catch (e: unknown) {
    throw new Error(e as string)
  }
}

export const postInventoriesNew = async (values: DataPropsForm) => {
  try {
    await axiosRequest({
      method: 'post',
      url: inventoryURL,
      hasAuth: true,
      payload: values,
    })
  } catch (e: unknown) {
    throw new Error(e as string)
  }
}

export const putInventoriesEdit = async (data: { values: DataPropsForm; id: number }) => {
  try {
    await axiosRequest({
      method: 'put',
      url: `${inventoryURL}/${data.id}/`,
      hasAuth: true,
      payload: data.values,
    })
  } catch (e: unknown) {
    throw new Error(e as string)
  }
}

export const toogleInventories = async (id: number) => {
  return await axiosRequest<IInventoryProps>({
    method: 'post',
    url: `${inventoryURL}/${id}/toggle-active/`,
    hasAuth: true,
  })
}

export const postUploadImageToAWS = async (formData: FormData) => {
  return await axiosRequest<ImageUploadAWSProps>({
    method: 'post',
    url: uploadImageAWSURL,
    hasAuth: true,
    showError: true,
    payload: formData,
  })
}

export const awsPostImagetoS3 = async (data: { url: string; formData: FormData }) => {
  const { url, formData } = data
  await axiosRequest({
    method: 'post',
    url,
    payload: formData,
    showError: true,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
