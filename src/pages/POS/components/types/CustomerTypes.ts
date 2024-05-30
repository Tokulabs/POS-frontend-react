export interface ICustomerProps {
  id?: number
  document_id: string
  document_type: string
  name: string
  phone: string | null
  email: string
  address: string | null
}
