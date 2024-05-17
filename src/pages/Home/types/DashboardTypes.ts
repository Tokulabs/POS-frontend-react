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
  title: string
  value: number
  icon: ForwardRefExoticComponent<Omit<IconProps, 'ref'> & RefAttributes<Icon>>
  color?: string
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
