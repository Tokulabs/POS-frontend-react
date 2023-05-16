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
  created_at: string
  remaining_in_shops: number
  remaining_in_storage: number
  buying_price: number
  selling_price: number
  usd_price: number
  photo: string
  sum_of_item?: number
}

export enum ModalStateEnum {
  addItem,
  addItemsCSV,
  off,
}

export interface IAddInventoryFormProps extends IModalFormProps {
  groups: IGroupsProps[]
}
