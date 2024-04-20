import { create } from 'zustand'
import { getCustomers } from '../pages/POS/helpers/services'
import { AxiosError } from 'axios'

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
  fetchDefaultCustomer: () => void
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
  fetchDefaultCustomer: async () => {
    try {
      const data = await getCustomers({ keyword: '22222222' })
      const customerByDefault = data?.results.filter((item) => item.document_id === '22222222')[0]
      if (!customerByDefault) return
      set({
        customer: {
          id: customerByDefault.id as number,
          idNumber: customerByDefault.document_id,
          name: customerByDefault.name,
          email: customerByDefault.email,
          phone: customerByDefault.phone,
          address: customerByDefault.address,
        },
      })
    } catch (error) {
      const e = error as AxiosError
      console.error(e)
    }
  },
}))
