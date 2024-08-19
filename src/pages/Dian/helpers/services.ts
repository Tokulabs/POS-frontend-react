import { axiosRequest } from '@/api/api'
import { DataPropsForm, IPaginationProps, IQueryParams } from '@/types/GlobalTypes'
import { dianResolutionURL } from '@/utils/network'
import { IDianResolutionProps } from '../types/DianResolutionTypes'

export const getDianResolutions = async (queryParams: IQueryParams) => {
  try {
    const finalURL = new URL(dianResolutionURL)
    const searchParams = new URLSearchParams()
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (!value) return
        searchParams.set(key, value.toString())
      })
    }
    finalURL.search = searchParams.toString()
    const response = await axiosRequest<IPaginationProps<IDianResolutionProps>>({
      url: finalURL,
      hasAuth: true,
      showError: false,
    })
    if (response) {
      return response.data
    }
  } catch (e) {
    console.log(e)
  }
}

export const postDianResolution = async (data: DataPropsForm) => {
  const response = await axiosRequest({
    url: dianResolutionURL,
    method: 'post',
    hasAuth: true,
    showError: true,
    payload: data,
  })
  if (response) {
    return response
  }
}

export const toggleDianResolution = async (id: number) => {
  const response = await axiosRequest({
    url: `${dianResolutionURL}/${id}/toggle-active/`,
    method: 'post',
    hasAuth: true,
    showError: true,
  })
  if (response) {
    return response
  }
}

export const putDiaResolution = async (data: { payload: DataPropsForm; id: number }) => {
  await axiosRequest({
    url: `${dianResolutionURL}/${data.id}/`,
    method: 'put',
    hasAuth: true,
    showError: true,
    payload: data.payload,
  })
}
