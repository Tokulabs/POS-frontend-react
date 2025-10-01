import axios, { AxiosResponse } from 'axios'
import { IAuthToken, ICustomAxiosError } from '@/types/AuthTypes'
import { DataPropsForm } from '@/types/GlobalTypes'
import { tokenName } from '@/utils/constants'
import { toast } from 'sonner'
import { isObject } from 'lodash'
import { logout } from '@/pages/Auth/helpers'

interface IAxiosRequestProps<P = DataPropsForm | FormData> {
  method?: 'get' | 'post' | 'patch' | 'delete' | 'put'
  url: string | URL
  headers?: Record<string, string>
  payload?: P
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

export const axiosRequest = async <T, P = DataPropsForm | FormData>({
  method = 'get',
  url,
  payload,
  hasAuth = false,
  errorObject,
  showError = true,
  headers,
  isFile = false,
}: IAxiosRequestProps<P>): Promise<AxiosResponse<T> | null> => {
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
    if (err.status === 403) {
      logout()
      window.location.reload()
    }
    const errorObjectDescription = errorObject?.description
    const errorMessage =
      err.response?.data?.error ??
      (err.response &&
        (isObject(err.response.data) && Object.values(err.response.data).length > 0
          ? Object.values(err.response.data)[0]
          : err.message))
    toast.error(errorObjectDescription ?? errorMessage)
    throw Error(errorObjectDescription ?? errorMessage)
  }
  return null
}
