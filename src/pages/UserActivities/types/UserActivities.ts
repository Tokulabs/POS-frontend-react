import { DataPropsForm } from '../../../types/AuthTypes'

export interface IActivitiesProps {
  id: number
  created_at: string
  fullname: string
  email: DataPropsForm
  action: string
}
