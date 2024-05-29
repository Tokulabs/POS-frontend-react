import { Icon, IconProps } from '@tabler/icons-react'
import { ForwardRefExoticComponent, RefAttributes } from 'react'

export interface ISummaryProps {
  title: string
  value: number
  icon: ForwardRefExoticComponent<Omit<IconProps, 'ref'> & RefAttributes<Icon>>
  color?: string
}

export interface ISummaryDataProps {
  [key: string]: ISummaryProps
}

export interface ITopSellingProps {
  name: string
  photo: string
  sum_top_ten_items: number
}
export interface ISaleByShopProps {
  amount_total: number
  name: string
  color?: string
}

export interface IPurchaseSummaryProps {
  count: number
  selling_price: number
  gift_count: number
  selling_price_gifts: number
  price_dolar: number
}

export interface ISummaryByHour {
  time: number
  total_quantity: number
}

export interface ISummaryByKeyframe {
  total_amount: number
  month?: string
  week_number?: string
  day?: string
}

export interface ISalesByUser {
  sale_by__id: number
  sale_by__fullname: string
  total_invoice: number
  sale_by__daily_goal: number
}
