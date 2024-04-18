import { create } from 'zustand'

interface ICustomerDataStore {
  openModalAddCustomer: boolean
  customer: {
    idNumber: string
    name: string
    email: string
    phone: string
    address: string
  }
  updateCustomerData: (data: ICustomerDataStore['customer']) => void
  clearCustomerData: () => void
  toggleModalAddCustomer: (value: boolean) => void
}

export const useCustomerData = create<ICustomerDataStore>((set) => ({
  openModalAddCustomer: false,
  customer: {
    idNumber: '2222222',
    name: 'Ventas Mostrador',
    email: '',
    phone: '',
    address: '',
  },
  updateCustomerData: (data) => {
    set({
      customer: data,
    })
  },
  clearCustomerData: () => {
    set({
      customer: {
        idNumber: '2222222',
        name: 'Ventas Mostrador',
        email: '',
        phone: '',
        address: '',
      },
    })
  },
  toggleModalAddCustomer: (value) => {
    set({
      openModalAddCustomer: value,
    })
  },
}))
