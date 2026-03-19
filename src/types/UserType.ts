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

export interface IQuotaUsageItem {
  used: number
  max: number
  is_unlimited: boolean
  resets_at: string | null
}

export interface ICurrentPlan {
  slug: string
  name: string
  product: string
  period_start: string | null
  period_end: string | null
  billing_period: 'monthly' | 'yearly' | 'lifetime'
  status: 'active' | 'trial' | 'past_due' | 'cancelled'
  days_until_expiry: number | null  // null = lifetime (never expires)
}

export interface IUser {
  email: string
  fullname: string
  id: string
  created_at: string
  last_login: string
  is_verified: boolean
  document_id: string
  document_type: string
  photo: string
  company: ICompany
  company_role: IUserCompanyRole | null
  // Subscription data from MeView
  active_products?: string[]
  feature_flags?: Record<string, boolean>
  quotas?: Record<string, number>
  quota_usage?: Record<string, IQuotaUsageItem>
  current_plan?: ICurrentPlan
}
