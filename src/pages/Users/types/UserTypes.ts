export interface IUserProps {
  created_at: string
  email: string
  fullname: string
  is_active: string
  last_login: string
  role: string
  id: number
  key?: number
}

export enum UserRolesEnum {
  admin = 'Super Admin',
  posAdmin = 'Administrador POS',
  shopAdmin = 'Administrador Tienda',
  sales = 'Vendedor Fijo',
  supportSales = 'Vendedor Apoyo',
}
