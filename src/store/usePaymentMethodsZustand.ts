import { create } from 'zustand'
import { IPaymentMethod } from '../pages/POS/components/types/PaymentMethodsTypes'
import { PaymentMethodsEnum } from '../pages/Purchase/types/PurchaseTypes'

interface IPaymentMethodStore {
  paymentMethods: IPaymentMethod[]
  totalValueToPay: number
  totalValueReceived: number
  totalReturnedValue: number
  isDollar: boolean
  addPaymentMethod: (data: IPaymentMethod) => void
  removePaymentMethod: (name: string) => void
  clearPaymentMethods: () => void
  updateTotalValues: () => void
  toggleIsDollar: () => void
  updateValueOfPaymentMethod: (name: PaymentMethodsEnum, field: string, value: number) => void
}

export const usePaymentMethodsData = create<IPaymentMethodStore>((set, get) => ({
  paymentMethods: [],
  totalValueToPay: 0,
  totalValueReceived: 0,
  totalReturnedValue: 0,
  isDollar: false,
  addPaymentMethod: (data) => {
    const { paymentMethods, updateTotalValues } = get()
    const paymentMethodExist = paymentMethods.find((item) => item.name === data.name)
    if (paymentMethodExist) return
    const newPaymentMethods = [...paymentMethods, data]
    set({
      paymentMethods: newPaymentMethods,
    })
    updateTotalValues()
  },
  removePaymentMethod: (name) => {
    const { paymentMethods, updateTotalValues } = get()
    const paymentMethodExist = paymentMethods.find((item) => item.name === name)
    if (!paymentMethodExist) return
    const newPaymentMethods = paymentMethods.filter((item) => item.name !== name)
    set({
      paymentMethods: newPaymentMethods,
    })
    updateTotalValues()
  },
  clearPaymentMethods: () => {
    const { updateTotalValues } = get()
    set({
      paymentMethods: [],
    })
    updateTotalValues()
  },
  updateTotalValues: () => {
    const { paymentMethods } = get()
    let totalValueToPay = 0
    let totalValueReceived = 0
    let totalReturnedValue = 0

    for (const item of paymentMethods) {
      totalValueToPay += item.paidAmount
      totalValueReceived += item.receivedAmount
      totalReturnedValue += item.backAmount
    }
    set({
      totalValueToPay,
      totalValueReceived,
      totalReturnedValue,
    })
  },
  toggleIsDollar: () => {
    set((state) => ({
      isDollar: !state.isDollar,
    }))
  },
  updateValueOfPaymentMethod: (name: PaymentMethodsEnum, field: string, value: number) => {
    const { paymentMethods, updateTotalValues } = get()
    if (name === PaymentMethodsEnum.cash) {
      const paymentMethodExist = paymentMethods.find((item) => item.name === name)
      if (!paymentMethodExist) return
      const newPaymentMethods = paymentMethods.map((item) => {
        if (item.name === name) {
          return {
            ...item,
            [field]: value,
          }
        }
        return item
      })
      const newPaymentMethodsWithChange = newPaymentMethods.map((item) => {
        if (item.name === name) {
          return {
            ...item,
            backAmount: item.receivedAmount - item.paidAmount,
          }
        }
        return item
      })
      set({
        paymentMethods: newPaymentMethodsWithChange,
      })
      updateTotalValues()
    } else {
      if (field === 'paidAmount') {
        const paymentMethodExist = paymentMethods.find((item) => item.name === name)
        if (!paymentMethodExist) return
        const newPaymentMethods = paymentMethods.map((item) => {
          if (item.name === name) {
            return {
              ...item,
              receivedAmount: value,
              paidAmount: value,
            }
          }
          return item
        })
        set({
          paymentMethods: newPaymentMethods,
        })
        updateTotalValues()
      }
    }
  },
}))
