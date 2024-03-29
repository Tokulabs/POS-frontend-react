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
}

export interface ITableRowProps {
  product: IPosData
}
