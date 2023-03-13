import { DataPropsForm } from '../../../types/GlobalTypes'

export interface IShopProps {
  id: number
  created_at: string
  name: string
  created_by: DataPropsForm
  created_by_email?: string
}
