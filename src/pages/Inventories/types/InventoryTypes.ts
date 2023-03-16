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
  } | null
  created_at: string
  remaining: number
  price: number
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
