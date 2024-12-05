import { AxiosError } from 'axios'

export interface ICustomAxiosError extends Omit<AxiosError, 'response'> {
  response?: {
    data: {
      error?: string
      code?: string
    }
  }
}

export interface IAuthToken {
  Authorization: string
}

export interface ILoginResponseData {
  access?: string
  session?: string
}

export interface IAuthProps {
  errorCallback?: () => void
  successCallback?: () => void
}
