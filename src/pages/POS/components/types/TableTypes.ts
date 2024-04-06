export type ITableTitles = {
  tableTitle: string
  tableStyles: string
}

export interface ITableHeaderProps {
  tableColumnsData: ITableTitles[]
}

export interface IPosData {
  code: string
  name: string
  selling_price: number
  usd_price: number
  discount: number
  quantity: number
  total: number
  usd_total: number
  photo: string
  total_in_shops: number
}

export interface ITableRowProps {
  product: IPosData
}
