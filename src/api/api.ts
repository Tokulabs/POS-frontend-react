import axios, { AxiosResponse } from 'axios'
import { IAuthToken, ICustomAxiosError } from '../types/AuthTypes'
import { DataPropsForm } from '../types/GlobalTypes'
import { tokenName } from '../utils/constants'
import { toast } from 'sonner'
import { isObject } from 'lodash'

interface IAxiosRequestProps {
  method?: 'get' | 'post' | 'patch' | 'delete' | 'put'
  url: string | URL
  headers?: Record<string, string>
  payload?: DataPropsForm | FormData
  hasAuth?: boolean
  showError?: boolean
  errorObject?: {
    message: string
    description?: string
  }
  isFile?: boolean
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
  headers,
  isFile = false,
}: IAxiosRequestProps): Promise<AxiosResponse<T> | null> => {
  const headersNew = hasAuth ? { ...headers, ...getAuthToken() } : { ...headers }
  const urlStr = url instanceof URL ? url.toString() : url
  try {
    const response: AxiosResponse<T> = await axios({
      method,
      url: urlStr,
      data: payload,
      headers: { ...headersNew },
      responseType: isFile ? 'arraybuffer' : 'json',
    })
    if (response) return response
  } catch (e: unknown) {
    if (!showError) return null
    const err = e as ICustomAxiosError
    const errorObjectDescription = errorObject?.description
    toast.error(
      errorObjectDescription
        ? errorObjectDescription
        : err.response?.data.error
          ? err.response?.data.error
          : isObject(err.response?.data)
            ? Object.values(err.response?.data)[0]
            : err.message,
    )
    throw Error(err.response?.data.error)
  }
  return null
}
