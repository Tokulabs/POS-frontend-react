import { PaymentMethodsEnum } from '../../Purchase/types/PurchaseTypes'

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
  created_by: {
    email: string
    fullname: string
  }
  invoice_items: IItemInvoice[]
  sale_name: string
  customer_id: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  payment_methods: IPaymentMethodsProps[]
  is_dollar: boolean
  invoice_number: number
  dian_document_number: string
  is_override: boolean
  key?: number
}

export interface IItemInvoice {
  id: number
  amount: number
  discount: number
  item: {
    selling_price: number
    usd_price: number
  }
  item_code: string
  item_name: string
  original_amount: number
  original_usd_amount: number
  quantity: number
  usd_amount: number
}
