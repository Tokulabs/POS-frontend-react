export interface IPurchaseCart {
  inventory_id: number
  quantity: number
  state: string
}

export interface IPurchaseSimple {
  id: number
  provider: string
  total: number
  state: string
  created_at: string
  event_date: string
  destination: string
}
