import { IModalFormProps } from '../../../types/ModalTypes'
import { IGroupsProps } from '../../Groups/types/GroupTypes'

export interface IInventoryProps {
  id: number
  code: string
  name: string
  created_by: {
    email: string
  }
  group: {
    name: string
    id: number
    belongs_to: {
      name: string
    }
  } | null
  provider: {
    name: string
    legal_name: string
    id: number
  } | null
  created_at: string
  total_in_shops: number
  total_in_storage: number
  buying_price: number
  selling_price: number
  usd_price: number
  photo: string
  sum_of_item?: number
}

export interface IAddInventoryFormProps extends IModalFormProps {
  initialData: IInventoryProps
  groups: IGroupsProps[]
}
