import { IModalFormProps } from '../../../types/ModalTypes'

export interface IUserProps {
  created_at: string
  email: string
  fullname: string
  is_active: boolean
  last_login: string
  document_type: string
  document_id: string
  role: string
  id: number
  key?: number
}

export interface IAddUser extends IModalFormProps {
  initialData: IUserProps
}

export enum UserDocumentTypeEnum {
  CC = 'Cédula de Ciudadanía',
  CE = 'Cédula de Extranjería',
  NIT = 'NIT',
  TI = 'Tarjeta de Identidad',
  PA = 'Pasaporte',
  DIE = 'Documento de Identificación Extranjero',
}

export enum UserRolesEnum {
  admin = 'Super Admin',
  posAdmin = 'Administrador POS',
  shopAdmin = 'Administrador Tienda',
  sales = 'Vendedor Fijo',
  supportSales = 'Vendedor Apoyo',
}
