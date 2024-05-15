import { create } from 'zustand'

interface ICustomerDataStore {
  openModalAddCustomer: boolean
  isEditUser: boolean
  customer: {
    id: number | null
    idNumber: string
    name: string
    email: string
    phone: string
    address: string
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
        id: null,
        idNumber: '',
        name: '',
        email: '',
        phone: '',
        address: '',
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
