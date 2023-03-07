import { AxiosError } from 'axios'

export interface DataPropsForm {
  [key: string]: string | boolean | number | DataPropsForm | null
}

export interface ICustomAxiosError extends Omit<AxiosError, 'response'> {
  response?: {
    data: {
      error: string
    }
  }
}

export interface IAuthToken {
  Authorization: string
}

export interface ILoginResponseData {
  access: string
}

export interface IAuthProps {
  errorCallback?: () => void
  successCallback?: () => void
}
