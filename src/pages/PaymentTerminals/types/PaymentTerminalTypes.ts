import { IModalFormProps } from '../../../types/ModalTypes'

export interface IPaymentTerminal {
  id: number
  active: boolean
  name: string
  account_code: string
  is_wireless: boolean
  action?: React.ReactElement
  key?: number
}

export interface IAddPaymentTerminals extends IModalFormProps {
  initialData: IPaymentTerminal
}
