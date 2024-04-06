import { create } from 'zustand'

interface ICustomerDataStore {
  customer: {
    id: string
    name: string
    email: string
    phone: string
    address: string
  }
  updateCustomerData: (data: ICustomerDataStore['customer']) => void
  clearCustomerData: () => void
}

export const useCustomerData = create<ICustomerDataStore>((set) => ({
  customer: {
    id: '',
    name: '',
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
        id: '',
        name: '',
        email: '',
        phone: '',
        address: '',
      },
    })
  },
}))
