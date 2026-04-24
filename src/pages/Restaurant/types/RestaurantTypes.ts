export interface IMenuProductDetail {
  id: number
  name: string
  code: string
  photo: string | null
  selling_price: number
}

export interface IUnitOfMeasure {
  id: number
  name: string
  symbol: string
  unit_type: 'weight' | 'volume' | 'count'
  company: number | null
  is_global: boolean
}

export interface IIngredient {
  id: number
  name: string
  unit: number
  unit_detail: IUnitOfMeasure
  stock_quantity: string
  min_stock: string
  cost_per_unit: string
  supplier: { id: number; name: string } | null
  active: boolean
  created_at: string
}

export type IngredientMovementType = 'purchase' | 'adjustment' | 'waste' | 'consumption'

export interface IIngredientMovement {
  id: number
  movement_type: IngredientMovementType
  quantity: string
  cost_per_unit: string | null
  supplier: number | null
  supplier_name: string | null
  notes: string
  created_by_name: string | null
  created_at: string
}

export type MenuCategory = 'starter' | 'main' | 'dessert' | 'drink' | 'side' | 'combo'

export const MENU_CATEGORY_LABELS: Record<MenuCategory, string> = {
  starter: 'Entrada',
  main: 'Plato principal',
  dessert: 'Postre',
  drink: 'Bebida',
  side: 'Acompañamiento',
  combo: 'Combo',
}

export interface IRecipeIngredient {
  id: number
  ingredient: number
  ingredient_detail: IIngredient
  quantity: string
  unit: number
  unit_detail: IUnitOfMeasure
}

export interface IRecipe {
  id: number
  notes: string
  recipe_ingredients: IRecipeIngredient[]
}

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning' | 'disabled'

export const TABLE_STATUS_LABELS: Record<TableStatus, string> = {
  available: 'Disponible',
  occupied: 'Ocupada',
  reserved: 'Reservada',
  cleaning: 'En limpieza',
  disabled: 'Deshabilitada',
}

export interface IRestaurantArea {
  id: number
  name: string
  active: boolean
}

export interface IRestaurantTable {
  id: number
  number: string
  area: number | null
  area_detail: IRestaurantArea | null
  capacity: number
  status: TableStatus
  active: boolean
  active_order_id: number | null
  pos_x: number | null
  pos_y: number | null
}

export type OrderStatus = 'draft' | 'open' | 'in_preparation' | 'ready' | 'billed' | 'cancelled'
export type OrderItemStatus = 'pending' | 'preparing' | 'served' | 'cancelled'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Borrador',
  open: 'Abierta',
  in_preparation: 'En preparación',
  ready: 'Lista',
  billed: 'Facturada',
  cancelled: 'Cancelada',
}

export const ORDER_ITEM_STATUS_LABELS: Record<OrderItemStatus, string> = {
  pending: 'Pendiente',
  preparing: 'Preparando',
  served: 'Servido',
  cancelled: 'Cancelado',
}

export interface IComboItem {
  id: number
  product_id: number
  product_name: string
  quantity: number
}

export interface IComboOption {
  id: number
  product_id: number
  product_name: string
  product_price: number
  extra_price: number
  position: number
}

export interface IComboOptionGroup {
  id: number
  name: string
  is_required: boolean
  options: IComboOption[]
}

export interface IRestaurantOrderItem {
  id: number
  item: number
  item_name: string
  quantity: number
  unit_price: number
  notes: string
  status: OrderItemStatus
  is_combo_header: boolean
  parent_item: number | null
  combo_children: IRestaurantOrderItem[]
  created_at: string | null
}

export interface IRestaurantOrder {
  id: number
  order_number: string
  table: number | null
  table_number: string | null
  status: OrderStatus
  notes: string
  order_items: IRestaurantOrderItem[]
  confirmed_at: string | null
  created_at: string
  updated_at: string
}

export interface IRestaurantProductDetail {
  id: number
  product: number
  product_detail: IMenuProductDetail
  menu_category: MenuCategory
  prep_time_minutes: number
  is_available: boolean
  skip_stock_check: boolean
  prep_notes: string
  recipe: IRecipe | null
  combo_items: IComboItem[]
  option_groups: IComboOptionGroup[]
  created_at: string
}
