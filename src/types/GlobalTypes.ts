import { Moment } from 'moment'
import { IDianResolutionProps } from '../pages/Dian/types/DianResolutionTypes'
import {
  PaymentMethodsEnum,
  IPaymentMethod,
  IPaymentMethodToSend,
} from '../pages/POS/components/types/PaymentMethodsTypes'
export interface IPurchaseProps {
  code: string
  id: number
  item: string
  qty: number
  price?: number
  total: number
  action?: React.ReactElement
  key?: number
  selling_price?: number
  usd_price?: number
  totalUSD?: number
}

export interface IPurchaseAddRemoveProps {
  [key: number]: number
}

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
  data: IPurchaseProps[]
  date?: string
  customerData: { customerName: string; customerId: string }
  paymentMethods: IPaymentMethod[]
  saleName: string
  dianResolution: IDianResolutionProps
  invoiceNumber: number
  isOverride: boolean
}
