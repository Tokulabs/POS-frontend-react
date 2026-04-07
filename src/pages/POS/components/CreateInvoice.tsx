import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { postInvoicesNew } from '@/pages/Invoices/helpers/services'
import { DataPropsForm } from '@/types/GlobalTypes'
import { useCart } from '@/store/useCartStoreZustand'
import { useCustomerData } from '@/store/useCustomerStoreZustand'
import { usePaymentMethodsData } from '@/store/usePaymentMethodsZustand'
import { IPaymentMethodToSend, PaymentMethodsEnum } from './types/PaymentMethodsTypes'
import { usePOSStep } from '@/store/usePOSSteps'
import { Spin } from 'antd'
import { IconCheck, IconPrinter, IconScriptPlus, IconX } from '@tabler/icons-react'
import { useKeyPress } from '@/hooks/useKeyPress'
import PrintOut from '@/components/Print/PrintInvoice'
import { toast } from 'sonner'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { axiosRequest } from '@/api/api'
import { restaurantOrdersURL } from '@/utils/network'

export const CreateInvoice = () => {
  const [printId, setPrintId] = useState('')
  const [printIdSaved, setPrintIdSaved] = useState('')
  const { cartItems, saleById, clearCart } = useCart()
  const { customer, clearCustomerData } = useCustomerData()
  const { paymentTerminalID, paymentMethods, clearPaymentMethods, isDollar, isElectronicInvoice, tipAmount } =
    usePaymentMethodsData()
  const { currentStep, updateCurrentStep } = usePOSStep()
  const location = useLocation()
  const restaurantOrderId = (location.state as any)?.restaurantOrderId as number | undefined

  useKeyPress('F2', () => {
    newPurchase()
  })

  useKeyPress('F1', () => {
    handlePrint()
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
    skip_stock_check: cartItem.skip_stock_check ?? false,
  }))

  const payment_methods: IPaymentMethodToSend[] = []
  paymentMethods.forEach((item) => {
    item.paidAmount.map((paidAmount, index) => {
      if (paidAmount >= 0) {
        payment_methods.push({
          name: getKeyFromValue(item.name) || null,
          paid_amount: paidAmount,
          transaction_code: item.transactionNumber[index] || null,
          back_amount: item.backAmount || 0,
          received_amount: item.name === PaymentMethodsEnum.cash ? item.receivedAmount : paidAmount,
        })
      }
    })
  })

  const customer_id = customer.id
  const payment_terminal_id = paymentTerminalID || null
  const sale_by_id = saleById || null

  const { mutate: completeBilling } = useMutation({
    mutationFn: ({ orderId, invoiceNumber }: { orderId: number; invoiceNumber: string }) =>
      axiosRequest({
        url: `${restaurantOrdersURL}${orderId}/complete-billing/`,
        method: 'post',
        hasAuth: true,
        payload: { invoice_number: invoiceNumber },
      }),
  })

  const {
    mutate: mutateInvoice,
    isPending,
    isError,
  } = useMutation({
    mutationFn: postInvoicesNew,
    onSuccess: (response) => {
      const printId = response?.data.data.invoice_number
      setPrintId(String(printId))
      setPrintIdSaved(String(printId))
      toast.success('Factura creada correctamente!')
      if (restaurantOrderId) {
        completeBilling({ orderId: restaurantOrderId, invoiceNumber: String(printId) })
      }
    },
  })

  const invoiceData: DataPropsForm = {
    invoice_item_data,
    customer_id,
    payment_terminal_id,
    sale_by_id,
    payment_methods,
    is_dollar: isDollar,
    send_electronic_invoice: isElectronicInvoice,
    tip: tipAmount,
  }

  useEffect(() => {
    if (currentStep === 2) mutateInvoice(invoiceData)
  }, [currentStep])

  // Safety timeout: clear print portal if onAfterPrint never fires (e.g., dialog cancelled)
  useEffect(() => {
    if (!printId) return
    const timeout = setTimeout(() => setPrintId(''), 30_000)
    return () => clearTimeout(timeout)
  }, [printId])

  const newPurchase = () => {
    clearCart()
    clearCustomerData()
    clearPaymentMethods()
    updateCurrentStep(0)
    setPrintId('')
    setPrintIdSaved('')
  }

  const handlePrint = () => {
    setPrintId(printIdSaved)
  }

  return (
    <section className='relative flex items-center justify-center w-full h-full'>
      {isPending && <Spin size='large' />}
      {isError && (
        <section className='flex flex-col items-center justify-center gap-8'>
          <div className='flex items-center justify-center rounded-full w-44 h-44 bg-red-1'>
            <IconX size={120} color='white' />
          </div>
          <span className='text-2xl text-red-1'>
            Ha ocurrido un Error al crear la venta!{' '}
            <span className='font-bold'>intentelo nuevamente</span>
          </span>
          <div
            className='flex flex-col items-center justify-center p-6 text-white border-white border-solid rounded-md bg-red-1 hover:bg-card hover:border-red-1 hover:text-red-1 hover:cursor-pointer'
            onClick={newPurchase}
          >
            <IconScriptPlus size={36} /> <span className='text-lg'>Nueva venta [F2]</span>
          </div>
        </section>
      )}
      {!isPending && !isError && (
        <section className='flex flex-col items-center justify-center gap-8'>
          <div className='flex items-center justify-center rounded-full w-44 h-44 bg-green-1'>
            <IconCheck size={120} color='white' />
          </div>
          <span className='text-4xl font-bold text-green-1'>Factura creada correctamente!</span>
          <div className='flex gap-4'>
            <div
              className='flex flex-col items-center justify-center p-6 text-white border-white border-solid rounded-md bg-green-1 hover:bg-card hover:border-green-1 hover:text-green-1 hover:cursor-pointer'
              onClick={handlePrint}
            >
              <IconPrinter size={36} />
              <span className='text-lg'>Impimir [F1]</span>
            </div>
            <div
              className='flex flex-col items-center justify-center p-6 text-white border-white border-solid rounded-md bg-green-1 hover:bg-card hover:border-green-1 hover:text-green-1 hover:cursor-pointer'
              onClick={newPurchase}
            >
              <IconScriptPlus size={36} /> <span className='text-lg'>Nueva venta [F2]</span>
            </div>
          </div>
        </section>
      )}
      {printId &&
        createPortal(
          <div
            className='fixed w-0 h-0 overflow-hidden opacity-0 pointer-events-none'
            aria-hidden='true'
          >
            <PrintOut id={printId} onAfterPrint={() => setPrintId('')} />
          </div>,
          document.body,
        )}
    </section>
  )
}
