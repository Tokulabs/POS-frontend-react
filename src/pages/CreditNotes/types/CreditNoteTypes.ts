import { ICustomerProps } from '@/pages/POS/components/types/CustomerTypes'

export const CREDIT_NOTE_REASON_CODES = {
  CANCELLATION: 2,
  LINE_DISCOUNT: 4,
} as const

export type CreditNoteReasonCode =
  (typeof CREDIT_NOTE_REASON_CODES)[keyof typeof CREDIT_NOTE_REASON_CODES]

export const CREDIT_NOTE_REASON_LABELS: Record<number, string> = {
  2: 'Anulación de factura',
  4: 'Descuento por línea',
}

export interface ICreditNoteItemProps {
  id?: number
  item_id?: number | string
  item?: {
    id: number
    name: string
    code: string
    selling_price: number
    usd_price: number
  }
  item_name?: string
  item_code?: string
  quantity: number
  amount?: number | null
  usd_amount?: number | null
  discount?: number
  original_amount?: number | null
  original_usd_amount?: number | null
  is_gift?: boolean
}

export interface ICreditNoteProps {
  id: number
  created_at: string
  prefix: string
  number: string
  description?: string | null
  invoice?: {
    id: number
    invoice_number: number | string
    e_invoice_number?: string | null
    cufe?: string | null
    created_at: string
    is_electronic_invoiced: boolean
    customer?: ICustomerProps
    dian_resolution?: { prefix?: string | null } | null
  }
  customer?: ICustomerProps
  credit_note_items: ICreditNoteItemProps[]
  sent_to_dian: boolean
  discrepancy_code: number
  cude?: string | null
  created_by?: { fullname?: string; email?: string }
}

export interface ICreditNoteMinimalProps {
  id: number
  prefix: string
  number: string
  sent_to_dian: boolean
  cude?: string | null
  created_at: string
  invoice?: {
    id: number
    invoice_number: number | string
  }
  description?: string | null
  discrepancy_code: number
  total?: number
  key?: number
}
