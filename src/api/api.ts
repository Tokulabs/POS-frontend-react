import { notification } from 'antd'
import axios, { AxiosResponse } from 'axios'
import { IAuthToken, ICustomAxiosError } from '../types/AuthTypes'
import { DataPropsForm } from '../types/GlobalTypes'
import { tokenName } from '../utils/constants'

interface IAxiosRequestProps {
  method?: 'get' | 'post' | 'patch' | 'delete'
  url: string | URL
  payload?: DataPropsForm | FormData
  hasAuth?: boolean
  showError?: boolean
  errorObject?: {
    message: string
    description?: string
  }
}

export const getAuthToken = (): IAuthToken | null => {
  const accessToken = localStorage.getItem(tokenName)
  if (!accessToken) return null

  return { Authorization: `Bearer ${accessToken}` }
}

export const axiosRequest = async <T>({
  method = 'get',
  url,
  payload,
  hasAuth = false,
  errorObject,
  showError = true,
}: IAxiosRequestProps): Promise<AxiosResponse<T> | null> => {
  const headers = hasAuth ? getAuthToken() : {}
  const urlStr = url instanceof URL ? url.toString() : url
  try {
    const response: AxiosResponse<T> = await axios({
      method,
      url: urlStr,
      data: payload,
      headers: { ...headers },
    })
    if (response) return response
  } catch (e: unknown) {
    if (!showError) return null
    const err = e as ICustomAxiosError
    const errorObjectDescription = errorObject?.description
    notification.error({
      message: errorObject ? errorObject.message : 'Error',
      description: errorObjectDescription ? errorObjectDescription : err.response?.data.error,
    })
    throw Error(err.response?.data.error)
  }
  return null
}
