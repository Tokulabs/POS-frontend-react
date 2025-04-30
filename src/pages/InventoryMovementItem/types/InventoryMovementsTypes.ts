import { MovementEventType } from '@/pages/Purchase/types/PurchaseTypes'

export interface UpdateInventoryMovements {
  state: string
  delivery_notes: string
  quantity?: number
}
export interface MovementEvent {
  origin: string
  destination: string
}

export const movementEventsDictionary: Record<
  Exclude<MovementEventType, 'purchase'>,
  MovementEvent
> = {
  shipment: {
    origin: 'warehouse',
    destination: 'store',
  },
  return: {
    origin: 'store',
    destination: 'warehouse',
  },
}
