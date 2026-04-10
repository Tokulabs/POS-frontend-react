export interface ISupplierReportRow {
  supplier_id: number
  supplier_name: string
  nit: string | null
  phone: string | null
  email: string | null
  total_orders: number
  approved_orders: number
  pending_orders: number
  rejected_orders: number
  total_units: number
  total_amount: number
  last_purchase: string
}

export interface ISupplierMonthlyTrend {
  month: string
  total_amount: number
  total_units: number
  total_orders: number
}
