export interface IUser {
  email: string
  fullname: string
  id: string
  created_at: string
  role: string
  last_login: string
  company: {
    name: string
    nit: string
  }
}
