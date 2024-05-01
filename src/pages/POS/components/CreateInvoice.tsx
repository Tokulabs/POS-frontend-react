import { useMutation } from '@tanstack/react-query'
import { useEffect } from 'react'
import { postInvoicesNew } from '../../Invoices/helpers/services'
import { DataPropsForm } from '../../../types/GlobalTypes'
import { useCart } from '../../../store/useCartStoreZustand'
import { useCustomerData } from '../../../store/useCustomerStoreZustand'
import { usePaymentMethodsData } from '../../../store/usePaymentMethodsZustand'
import { IPaymentMethodToSend, PaymentMethodsEnum } from './types/PaymentMethodsTypes'
import { usePOSStep } from '../../../store/usePOSSteps'
import { Spin } from 'antd'
import { IconCheck, IconPrinter, IconScriptPlus, IconX } from '@tabler/icons-react'
import { useKeyPress } from '../../../hooks/useKeyPress'

export const CreateInvoice = () => {
  const { cartItems, saleById, clearCart } = useCart()
  const { customer, clearCustomerData } = useCustomerData()
  const { paymentTerminaID, paymentMethods, clearPaymentMethods } = usePaymentMethodsData()
  const { currentStep, updateCurrentStep } = usePOSStep()

  useKeyPress('F2', () => {
    newPurchase()
  })

  const getKeyFromValue = (value: string): string | undefined => {
    return Object.keys(PaymentMethodsEnum).find(
      (key) => PaymentMethodsEnum[key as keyof typeof PaymentMethodsEnum] === value,
    )
  }

  const invoice_item_data = cartItems.map((cartItem) => ({
    item_id: cartItem.id,
    quantity: cartItem.quantity,
    discount: cartItem.discount,
    amount: cartItem.total,
    usd_amount: cartItem.usd_total,
    is_gift: cartItem.is_gift,
  }))

  const payment_methods: IPaymentMethodToSend[] = []
  paymentMethods.forEach((item) => {
    item.paidAmount.map((paidAmount, index) => {
      if (paidAmount > 0) {
        payment_methods.push({
          name: getKeyFromValue(item.name) || null,
          paid_amount: paidAmount,
          transaction_code: item.transactionNumber[index] || null,
          back_amount: item.backAmount || 0,
          received_amount: paidAmount,
        })
      }
    })
  })

  const customer_id = customer.id

  const payment_terminal_id = paymentTerminaID || null

  const sale_by_id = saleById || null

  const {
    mutate: mutateInvoice,
    isPending,
    isError,
  } = useMutation({
    mutationFn: postInvoicesNew,
  })

  const invoiceData: DataPropsForm = {
    invoice_item_data,
    customer_id,
    payment_terminal_id,
    sale_by_id,
    payment_methods,
  }

  useEffect(() => {
    if (currentStep === 2) mutateInvoice(invoiceData)
  }, [currentStep])

  const newPurchase = () => {
    clearCart()
    clearCustomerData()
    clearPaymentMethods()
    updateCurrentStep(0)
  }

  return (
    <section className='flex justify-center items-center w-full h-full'>
      {isPending && <Spin size='large' />}
      {isError && (
        <section>
          <div className='w-24 h-24 rounded bg-red-1'>
            <IconX size={24} />
          </div>
        </section>
      )}
      {!isPending && !isError && (
        <section className='flex justify-center items-center flex-col gap-8'>
          <div className='w-44 h-44 rounded-full bg-green-1 flex justify-center items-center'>
            <IconCheck size={120} color='white' />
          </div>
          <span className='text-4xl text-green-1 font-bold'>Factura creada correctamente!</span>
          <div className='flex gap-4'>
            <div className='flex flex-col justify-center items-center p-6 bg-green-1 rounded-md border-solid text-white border-white hover:bg-white hover:border-green-1 hover:text-green-1 hover:cursor-pointer'>
              <IconPrinter size={36} />
              <span className='text-lg'>Impimir [F1]</span>
            </div>
            <div
              className='flex flex-col justify-center items-center p-6 bg-green-1 rounded-md border-solid text-white border-white hover:bg-white hover:border-green-1 hover:text-green-1 hover:cursor-pointer'
              onClick={newPurchase}
            >
              <IconScriptPlus size={36} /> <span className='text-lg'>Nueva venta [F2]</span>
            </div>
          </div>
        </section>
      )}
    </section>
  )
}
