import { IModalFormProps } from '../../../types/ModalTypes'

export interface ISupplier {
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

export interface IAddSupplier extends IModalFormProps {
  initialData: ISupplier
}
