import { axiosRequest } from '../../../api/api'
import { IQueryParams, IPaginationProps, DataPropsForm } from '../../../types/GlobalTypes'
import { providersURL } from '../../../utils/network'
import { IProvider } from '../types/ProviderTypes'

export const getProviders = async (queryParams: IQueryParams) => {
  try {
    const finalURL = new URL(providersURL)
    const searchParams = new URLSearchParams()
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (!value) return
        searchParams.set(key, value.toString())
      })
    }
    finalURL.search = searchParams.toString()
    const response = await axiosRequest<IPaginationProps<IProvider>>({
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
      url: providersURL,
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
      url: `${providersURL}/${data.id}/`,
      hasAuth: true,
      payload: data.values,
    })
  } catch (e: unknown) {
    throw new Error(e as string)
  }
}

export const toggleActiveProvider = async (id: number) => {
  return await axiosRequest<IProvider>({
    method: 'post',
    url: `${providersURL}/${id}/toggle-active/`,
    hasAuth: true,
  })
}
