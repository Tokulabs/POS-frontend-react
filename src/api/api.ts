import { notification } from 'antd'
import axios, { AxiosResponse } from 'axios'
import { DataPropsForm, IAuthToken, ICustomAxiosError } from '../types/AuthTypes'
import { tokenName } from '../utils/constants'

interface IAxiosRequestProps {
  method?: 'get' | 'post' | 'patch' | 'delete'
  url: string
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

  try {
    const response: AxiosResponse<T> = await axios({
      method,
      url,
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
    console.log(err.response?.data.error)
  }
  return null
}
