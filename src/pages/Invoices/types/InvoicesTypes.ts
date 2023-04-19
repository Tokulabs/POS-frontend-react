import { IPurchaseProps, PaymentMethodsEnum } from '../../Purchase/types/PurchaseTypes'

export interface IPaymentMethodsProps {
  name: keyof typeof PaymentMethodsEnum
  back_amount: number
  paid_amount: number
  received_amount: number
  transaction_code: string | null
}

export interface IInvoiceProps {
  id: number
  created_at: string
  created_by_email: string
  invoice_items: IPurchaseProps[]
  shop_name: string
  sale_name: string
  customer_id: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  payment_methods: IPaymentMethodsProps[]
  is_dollar: boolean
  key?: number
}
