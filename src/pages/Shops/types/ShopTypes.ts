import { DataPropsForm } from '../../../types/AuthTypes'

export interface IShopProps {
  id: number
  created_at: string
  name: string
  created_by: DataPropsForm
  created_by_email?: string
}
