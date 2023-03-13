import { IModalFormProps } from '../../../types/ModalTypes'
import { IShopProps } from './../../Shops/types/ShopTypes'

export interface IPurchaseProps {
  id: number
  item: string
  qty: number
  price: number
  total: number
  action?: React.ReactElement
  key?: number
}

export interface ISelectShopPurchase extends IModalFormProps {
  shops: IShopProps[]
}
