import axios, { AxiosResponse } from 'axios'
import { IAuthToken, ICustomAxiosError } from '@/types/AuthTypes'
import { DataPropsForm } from '@/types/GlobalTypes'
import { tokenName } from '@/utils/constants'
import { toast } from 'sonner'
import { isObject } from 'lodash'
import { logout } from '@/pages/Auth/helpers'

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
  returnErrorResponse = false, // << nuevo parámetro
}: IAxiosRequestProps & { returnErrorResponse?: boolean }): Promise<AxiosResponse<T> | null> => {
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
    return response
  } catch (e: unknown) {
    const err = e as ICustomAxiosError

    if (returnErrorResponse && err.response) {
      return err.response as AxiosResponse<T>
    }

    if (!showError) return null

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
}
