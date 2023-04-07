import { IModalFormProps } from '../../../types/ModalTypes'
import { IShopProps } from './../../Shops/types/ShopTypes'

export interface IPurchaseProps {
  code: string
  id: number
  item: string
  qty: number
  price: number
  usd_price: number
  total: number
  customerName?: string
  customerId?: string
  action?: React.ReactElement
  key?: number
}

export interface ISelectShopPurchase extends IModalFormProps {
  shops: IShopProps[]
}

export interface ICustomerDataProps {
  customerName: string
  customerId: string
}
