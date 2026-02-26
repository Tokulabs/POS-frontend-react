export interface IMovementCart {
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

export type stateType = 'pending' | 'approved' | 'rejected' | 'overrided' | 'failed' | 'completed'

export const movementStates: Record<stateType, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  overrided: 'Anulado',
  failed: 'Fallido',
  completed: 'Completado',
}

export const storageTypes = {
  warehouse: 'Bodega',
  store: 'Tienda',
}

export type MovementEventType = 'shipment' | 'purchase' | 'return'

export interface IPurchase {
  id: number
  provider: Provider
  inventory_movement_items: InventoryMovementItem[]
  event_type: MovementEventType
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
  key?: number
  provider_name?: string
  total: number
  state: string
  created_at: string
  destination: string
  origin: string
  state_reviewed_at: string
  delivery_notes: string
}

export interface ICreateMovement {
  inventory_movement_items: IMovementCart[]
  event_type: string
  event_date: string
  origin: string | null
  destination: string
  provider_id?: number
}
