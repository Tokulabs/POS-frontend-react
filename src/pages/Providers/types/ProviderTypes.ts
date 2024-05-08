import { IModalFormProps } from '../../../types/ModalTypes'

export interface IProvider {
  id: number
  name: string
  legal_name: string
  nit: string
  phone: string
  email: string
  bank_account: string
  account_type: string
  active: boolean
  action?: React.ReactElement
}

export interface IAddProvider extends IModalFormProps {
  initialData: IProvider
}
