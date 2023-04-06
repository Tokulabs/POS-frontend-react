import { IPurchaseProps } from '../../Purchase/types/PurchaseTypes'

export interface IInvoiceProps {
  id: number
  created_at: string
  created_by_email: string
  invoices_items: IPurchaseProps[]
  shop_name: string
  customer_id: string
  customer_name: string
  key?: number
}
