import { DataPropsForm } from '@/types/GlobalTypes'

export interface IActivitiesProps {
  id: number
  created_at: string
  fullname: string
  email: DataPropsForm
  action: string
}
