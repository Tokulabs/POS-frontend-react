import { IPaymentMethodsProps } from '../pages/Invoices/types/InvoicesTypes'

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
    | null
    | DataPropsForm[]
    | IPaymentMethodsProps[]
}

export interface IPaginationProps<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
