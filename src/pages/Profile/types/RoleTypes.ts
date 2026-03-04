export interface IPermission {
  codename: string
  name: string
  module: string
}

export interface ICompanyRole {
  id: number
  name: string
  description: string | null
  is_owner: boolean
  permissions: IPermission[]
  user_count: number
}

/** Grouped structure returned by GET /api/user/permissions */
export type IPermissionsGrouped = Record<string, IPermission[]>

export interface ICreateRolePayload {
  name: string
  description?: string
  permissions: string[]  // array of codenames
  [key: string]: unknown  // satisfies DataPropsForm index signature for axiosRequest
}
