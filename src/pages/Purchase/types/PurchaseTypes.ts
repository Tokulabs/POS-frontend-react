export interface IPurchaseCart {
  inventory_id: number
  quantity: number
  state: string
}

export interface Product {
  code: string
  photo: string
  name: string
}

export interface InventoryMovementItem {
  id: number
  inventory: Product
  quantity: number
  approved_quantity: number
  state: stateType
  state_reviewed_at: string
  delivery_notes: string
  updated_at: string
  created_at: string
}

export interface Provider {
  id: number
  name: string
  legal_name: string
  nit: string
  phone: string
  email: string
  bank_account: string
  account_type: string
  created_at: string
  updated_at: string
  active: boolean
}

export type stateType = 'pending' | 'approved' | 'rejected' | 'overrided'

export interface IPurchase {
  id: number
  provider: Provider
  inventory_movement_items: InventoryMovementItem[]
  event_type: string
  created_at: string
  origin: string
  destination: string
  state: stateType
  state_reviewed_at: string
  delivery_notes: string
  updated_at: string
}

export interface IPurchaseSimple {
  id: number
  provider: {
    legal_name: string
  }
  total: number
  state: string
  created_at: string
  destination: string
  state_reviewed_at: string
}

export interface ICreatePurchase {
  inventory_movement_items: IPurchaseCart[]
  event_type: string
  event_date: string
  provider_id: number
  origin: string | null
  destination: string
}
