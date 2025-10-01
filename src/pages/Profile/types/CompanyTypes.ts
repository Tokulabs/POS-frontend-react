export interface ICompany {
  id: number
  name: string
  nit: string
  logo: string
  phone: string
  email: string
  short_name: string
  address: string
  city: {
    id: number
    name: string
  }
}
