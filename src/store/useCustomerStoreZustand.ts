import { create } from 'zustand'

interface ICustomerDataStore {
  isEditUser: boolean
  customer: {
    id: number | null
    idNumber: string
    documentType: string
    name: string
    email: string
    phone: string | null
    address: string | null
    city: string
  }
  updateCustomerData: (data: ICustomerDataStore['customer']) => void
  setIsEditUser: (value: boolean) => void
  clearCustomerData: () => void
}

export const useCustomerData = create<ICustomerDataStore>((set) => ({
  isEditUser: false,
  customer: {
    id: null,
    idNumber: '',
    documentType: '',
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
  },
  updateCustomerData: (data) => {
    set({
      customer: data,
    })
  },
  setIsEditUser: (value) => {
    set({ isEditUser: value })
  },
  clearCustomerData: () => {
    set({
      isEditUser: false,
      customer: {
        id: null,
        idNumber: '',
        documentType: '',
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
      },
    })
  },
}))
