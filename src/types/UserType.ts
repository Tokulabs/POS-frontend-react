import { ICompany } from '@/pages/Profile/types/CompanyTypes'

export interface IUser {
  email: string
  fullname: string
  id: string
  created_at: string
  role: string
  last_login: string
  is_verified: boolean
  document_id: string
  document_type: string
  photo: string
  company: ICompany
}
