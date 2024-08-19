import { create } from 'zustand'
import {
  IPaymentMethod,
  PaymentMethodsEnum,
} from '@/pages/POS/components/types/PaymentMethodsTypes'

interface IPaymentMethodStore {
  paymentMethods: IPaymentMethod[]
  totalValueToPay: number
  totalValueReceived: number
  totalReturnedValue: number
  isDollar: boolean
  paymentTerminalID: number | null
  addPaymentMethod: (data: IPaymentMethod) => void
  removePaymentMethod: (name: string) => void
  clearPaymentMethods: () => void
  updateTotalValues: () => void
  toggleIsDollar: (value?: boolean) => void
  updatePaidAmount: (name: PaymentMethodsEnum, value: number, index?: number) => void
  updateReceivedAmount: (name: PaymentMethodsEnum, value: number) => void
  updatePaymentTerminalID: (id: number | null) => void
  addPaidAmountToPaymentMethod: (name: PaymentMethodsEnum) => void
  removePaidAmountFromPaymentMethod: (name: PaymentMethodsEnum, index: number) => void
  updateTransactionNumber: (name: PaymentMethodsEnum, value: string, index?: number) => void
}

export const usePaymentMethodsData = create<IPaymentMethodStore>((set, get) => ({
  paymentMethods: [],
  totalValueToPay: 0,
  totalValueReceived: 0,
  totalReturnedValue: 0,
  isDollar: false,
  paymentTerminalID: null,
  updatePaymentTerminalID: (id) => {
    set({
      paymentTerminalID: id,
    })
  },
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
      paymentTerminalID: null,
      isDollar: false,
    })
    updateTotalValues()
  },
  updateTotalValues: () => {
    const { paymentMethods } = get()
    let totalValueToPay = 0
    let totalValueReceived = 0
    let totalReturnedValue = 0

    for (const item of paymentMethods) {
      totalValueToPay += item.totalPaidAmount ?? 0
      totalValueReceived += item.receivedAmount
      totalReturnedValue += item.backAmount
    }
    set({
      totalValueToPay,
      totalValueReceived,
      totalReturnedValue,
    })
  },
  toggleIsDollar: (value?: boolean) => {
    if (value) {
      set({
        isDollar: value,
      })
      return
    } else {
      set((state) => ({
        isDollar: !state.isDollar,
      }))
    }
  },
  updatePaidAmount: (name, value, index = 0) => {
    const { paymentMethods, updateTotalValues } = get()
    const paymentMethodExist = paymentMethods.find((item) => item.name === name)
    if (!paymentMethodExist) return
    const newPaymentMethods = paymentMethods.map((item) => {
      if (item.name === name) {
        const paidAmount = item.paidAmount
        paidAmount[index] = value
        const totalPaidAmount = paidAmount.reduce((acc, curr) => acc + curr, 0)
        return {
          ...item,
          paidAmount,
          totalPaidAmount,
          receivedAmount: name === PaymentMethodsEnum.cash ? item.receivedAmount : totalPaidAmount,
        }
      }
      return item
    })
    const newPaymentMethodsWithChange = calculateBackAmount(newPaymentMethods, name)
    set({
      paymentMethods: newPaymentMethodsWithChange,
    })
    updateTotalValues()
  },
  updateReceivedAmount: (name, value) => {
    const { paymentMethods, updateTotalValues } = get()
    const paymentMethodExist = paymentMethods.find((item) => item.name === name)
    if (!paymentMethodExist) return
    const newPaymentMethods = paymentMethods.map((item) => {
      if (item.name === name) {
        return {
          ...item,
          receivedAmount: value,
        }
      }
      return item
    })
    const newPaymentMethodsWithChange = calculateBackAmount(newPaymentMethods, name)
    set({
      paymentMethods: newPaymentMethodsWithChange,
    })
    updateTotalValues()
  },
  addPaidAmountToPaymentMethod: (name) => {
    const { paymentMethods, updateTotalValues } = get()
    const paymentMethodExist = paymentMethods.find((item) => item.name === name)
    if (!paymentMethodExist) return
    const newPaymentMethods = paymentMethods.map((item) => {
      if (item.name === name) {
        const paidAmount = item.paidAmount
        paidAmount.push(0)
        const transactionNumber = item.transactionNumber
        transactionNumber.push('')
        return {
          ...item,
          paidAmount,
          transactionNumber,
        }
      }
      return item
    })
    set({
      paymentMethods: newPaymentMethods,
    })
    updateTotalValues()
  },
  removePaidAmountFromPaymentMethod(name, index) {
    const { paymentMethods, updateTotalValues } = get()
    const paymentMethodExist = paymentMethods.find((item) => item.name === name)
    if (!paymentMethodExist) return
    const newPaymentMethods = paymentMethods.map((item) => {
      if (item.name === name) {
        const paidAmount = item.paidAmount
        const transactionNumber = item.transactionNumber
        const receivedAmount = item.receivedAmount - paidAmount[index]
        paidAmount.splice(index, 1)
        transactionNumber.splice(index, 1)
        const totalPaidAmount = paidAmount.reduce((acc, curr) => acc + curr, 0)
        return {
          ...item,
          paidAmount,
          transactionNumber,
          totalPaidAmount,
          receivedAmount,
        }
      }
      return item
    })
    set({
      paymentMethods: newPaymentMethods,
    })
    updateTotalValues()
  },
  updateTransactionNumber(name, value, index = 0) {
    const { paymentMethods } = get()
    const paymentMethodExist = paymentMethods.find((item) => item.name === name)
    if (!paymentMethodExist) return
    const newPaymentMethods = paymentMethods.map((item) => {
      if (item.name === name) {
        const transactionNumber = item.transactionNumber
        transactionNumber[index] = value
        return {
          ...item,
          transactionNumber,
        }
      }
      return item
    })
    set({
      paymentMethods: newPaymentMethods,
    })
  },
}))

const calculateBackAmount = (
  paymentMethods: IPaymentMethod[],
  name: PaymentMethodsEnum,
): IPaymentMethod[] => {
  return paymentMethods.map((item) => {
    if (item.name === name) {
      return {
        ...item,
        backAmount: item.receivedAmount - (item.totalPaidAmount ?? 0),
      }
    }
    return item
  })
}
