import { IModalFormProps } from '../../../types/ModalTypes'
import { IUserProps } from '../../Users/types/UserTypes'
import { IShopProps } from './../../Shops/types/ShopTypes'

export interface IPurchaseProps {
  code: string
  id: number
  item: string
  qty: number
  selling_price: number
  usd_price: number
  total: number
  totalUSD: number
  paid_by?: string
  customerName?: string
  customerId?: string
  action?: React.ReactElement
  key?: number
}

export interface ISelectShopPurchase extends IModalFormProps {
  shops: IShopProps[]
  total: number
  totalUSD: number
  salesUsers: IUserProps[]
}

export interface ICustomerDataProps {
  customerName: string
  customerId: string
  customerEmail: string | null
  customerPhone: string | null
}

export enum PaymentMethodsEnum {
  cash = 'Efectivo',
  debitCard = 'Tarjeta Débito',
  creditCard = 'Tarjeta Crédito',
  nequi = 'Nequi',
  bankTransfer = 'Transferencia Bancaria',
}

export interface IPaymentMethodsIndexProps {
  id: number
  name: string
}
