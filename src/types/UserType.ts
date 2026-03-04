import { ICompany } from '@/pages/Profile/types/CompanyTypes'

export interface IUserPermission {
  codename: string
  name: string
  module: string
}

export interface IUserCompanyRole {
  id: number
  name: string
  is_owner: boolean
  permissions: IUserPermission[]
}

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
  company_role: IUserCompanyRole | null
}
