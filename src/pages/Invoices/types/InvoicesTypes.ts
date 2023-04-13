import { IPurchaseProps, PaymentMethodsEnum } from '../../Purchase/types/PurchaseTypes'

export interface IPaymentMethodsProps {
  name: keyof typeof PaymentMethodsEnum
  amount: number
  transaction_code: string | null
}

export interface IInvoiceProps {
  id: number
  created_at: string
  created_by_email: string
  invoices_items: IPurchaseProps[]
  shop_name: string
  customer_id: string
  customer_name: string
  payment_methods: IPaymentMethodsProps[]
  key?: number
}
