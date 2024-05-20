import { UserRolesEnum } from '../pages/Users/types/UserTypes'

export interface IUser {
  email: string
  fullname: string
  id: string
  created_at: string
  role: UserRolesEnum
  last_login: string
}
