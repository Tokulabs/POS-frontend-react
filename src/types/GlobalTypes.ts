import { IDianResolutionProps } from '../pages/Dian/types/DianResolutionTypes'
import { IPaymentMethodsProps } from '../pages/Invoices/types/InvoicesTypes'
import { IPurchaseProps, ICustomerDataProps } from '../pages/Purchase/types/PurchaseTypes'

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
    | IPaymentMethodsProps[]
    | null
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
  customerData: ICustomerDataProps
  paymentMethods: IPaymentMethodsProps[]
  saleName: string
  dianInformation: IDianResolutionProps
}
