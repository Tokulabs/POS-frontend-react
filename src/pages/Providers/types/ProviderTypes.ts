import { IModalFormProps } from '../../../types/ModalTypes'

export interface IProvider {
  id: number
  name: string
  legal_name: string
  nit: string
  action?: React.ReactElement
}

export interface IAddProvider extends IModalFormProps {
  initialData: IProvider
}
