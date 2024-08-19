import { IModalFormProps } from '@/types/ModalTypes'

export interface IGroupsProps {
  id: number
  active: boolean
  name: string
  belongs_to: {
    name: string
    id: number
  } | null
  created_at: string
  total_items: number
}

export interface IAddGroups extends IModalFormProps {
  initialData: IGroupsProps
}
