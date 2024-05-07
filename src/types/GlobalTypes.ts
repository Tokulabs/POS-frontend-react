import { Moment } from 'moment'
import {
  PaymentMethodsEnum,
  IPaymentMethodToSend,
} from '../pages/POS/components/types/PaymentMethodsTypes'
import { ICustomerProps } from '../pages/POS/components/types/CustomerTypes'
import { IPosData } from '../pages/POS/components/types/TableTypes'
import { IDianResolutionProps } from '../pages/Dian/types/DianResolutionTypes'

export interface DataPropsForm {
  [key: string]:
    | string
    | boolean
    | number
    | DataPropsForm
    | React.ReactElement
    | DataPropsForm[]
    | PaymentMethodsEnum[]
    | null
    | Moment[]
    | IPaymentMethodToSend[]
}

export interface IQueryParams {
  [key: string]: string | number | boolean
}

export interface IPaginationProps<T> {
  count: number
  page: number
  next: string | null
  previous: string | null
  results: T[]
}
export interface IPrintData {
  created_at: string
  customerData: ICustomerProps
  dataItems: IPosData[]
  paymentMethods: IPaymentMethodToSend[]
  saleBy: {
    fullname: string
  }
  dianResolution: IDianResolutionProps
  invoiceNumber: number
  isOverride: boolean
}
