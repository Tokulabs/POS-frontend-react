export interface IPurchaseProps {
  id: number
  item: string
  qty: number
  price: number
  total: number
  action?: React.ReactElement
  key?: number
}
