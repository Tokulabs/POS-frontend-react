import { create } from 'zustand'

interface ICustomerDataStore {
  openModalAddCustomer: boolean
  isEditUser: boolean
  customer: {
    id: number | null
    idNumber: string
    documentType: string
    name: string
    email: string
    phone: string | null
    address: string | null
    city: string | null
  }
  updateCustomerData: (data: ICustomerDataStore['customer']) => void
  clearCustomerData: () => void
  toggleModalAddCustomer: (value: boolean, isEdit: boolean) => void
}

export const useCustomerData = create<ICustomerDataStore>((set) => ({
  openModalAddCustomer: false,
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
  clearCustomerData: () => {
    set({
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
  toggleModalAddCustomer: (value, isEdit) => {
    set({
      openModalAddCustomer: value,
      isEditUser: isEdit,
    })
  },
}))
