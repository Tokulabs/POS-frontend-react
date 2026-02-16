export type DocumentType = 'CC' | 'CE' | 'NIT' | 'TI' | 'PA' | 'DIE'

export interface ICustomerProps {
  id?: number
  document_id: string
  document_type: DocumentType
  name: string
  phone: string | null
  email: string
  address: string | null
  city: City
  is_natural_person?: boolean
  city_id?: number
}

export interface City {
  id: number
  name: string
  dian_code: string
}
