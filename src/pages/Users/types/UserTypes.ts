import { IModalFormProps } from '@/types/ModalTypes'

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
  company_role?: { id: number; name: string; is_owner: boolean } | null
  company_role_id?: number | null
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
