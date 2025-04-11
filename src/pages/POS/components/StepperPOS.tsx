import { FC, useCallback, useMemo } from 'react'
// Components
import { AddItemsToPurchase } from './AddItemsToPurchase'
import { AddPaymentMethods } from './AddPaymentMethods'
import { CreateInvoice } from './CreateInvoice'
// Third Party
import { Button, Divider, Steps } from 'antd'
// Store
import { useCart } from '@/store/useCartStoreZustand'
import { usePaymentMethodsData } from '@/store/usePaymentMethodsZustand'
import { usePOSStep } from '@/store/usePOSSteps'
import { useCustomerData } from '@/store/useCustomerStoreZustand'
// Types
import { PaymentMethodsEnum } from './types/PaymentMethodsTypes'

const steps = [
  {
    title: 'Agregar Productos',
    content: <AddItemsToPurchase />,
  },
  {
    title: 'Métodos de Pago',
    content: <AddPaymentMethods />,
  },
  {
    title: 'Confirmar Venta',
    content: <CreateInvoice />,
  },
]

export const POSStepper: FC = () => {
  const { cartItems, totalCOP } = useCart()
  const { paymentMethods, totalValueToPay, clearPaymentMethods, paymentTerminalID } =
    usePaymentMethodsData()
  const { currentStep, updateCurrentStep } = usePOSStep()
  const { customer } = useCustomerData()

  const next = () => {
    updateCurrentStep(currentStep + 1)
  }

  const prev = () => {
    updateCurrentStep(currentStep - 1)
    clearPaymentMethods()
  }

  const items = steps.map((item) => ({ key: item.title, title: item.title }))

  const requirePaymentTerminal = useMemo(() => {
    return (
      paymentMethods.some(
        (item) =>
          item.name === PaymentMethodsEnum.debitCard || item.name === PaymentMethodsEnum.creditCard,
      ) && !paymentTerminalID
    )
  }, [paymentMethods, paymentTerminalID])

  const isDisabled = useCallback(() => {
    if (currentStep === 0) {
      return !cartItems.length
    }
    if (currentStep === 1) {
      const missingTransactionNumber = paymentMethods.map((item) => {
        if (item.name !== PaymentMethodsEnum.cash) {
          if (item.transactionNumber && item.transactionNumber.length > 0) {
            if (item.transactionNumber.some((num) => !num)) {
              return false
            } else {
              return true
            }
          } else {
            return false
          }
        }
        return null
      })

      const cashPayment = paymentMethods.find((item) => item.name === PaymentMethodsEnum.cash)

      const existCustomer = Boolean(customer.idNumber && customer.name)

      return (
        !paymentMethods.length ||
        totalValueToPay !== totalCOP ||
        requirePaymentTerminal ||
        missingTransactionNumber.includes(false) ||
        !existCustomer ||
        (cashPayment && cashPayment.receivedAmount < cashPayment.paidAmount[0])
      )
    }
    return false
  }, [
    paymentMethods,
    currentStep,
    cartItems,
    totalCOP,
    totalValueToPay,
    requirePaymentTerminal,
    customer,
  ])

  return (
    <section className='h-full flex flex-col justify-between gap-3'>
      <header>
        <div className='flex flex-col'>
          <Steps current={currentStep} items={items} />
          <Divider />
        </div>
        <div className='w-full flex flex-col gap-4'>
          <div className='flex justify-between items-end'>
            <h1 className='text-2xl font-semibold text-green-1 m-0'>Crear Venta</h1>
          </div>
        </div>
      </header>
      <Divider className='w-full' style={{ margin: '0.5rem' }} />
      <section
        className={`h-full ${currentStep === 0 ? 'overflow-hidden ' : 'overflow-hidden overflow-y-auto scrollbar-hide'}`}
      >
        {steps[currentStep].content}
      </section>
      <footer className='flex justify-end'>
        {currentStep === 0 && (
          <Button type='primary' onClick={() => next()} disabled={isDisabled()}>
            Siguiente
          </Button>
        )}
        {currentStep === 1 && (
          <Button type='primary' onClick={() => next()} disabled={isDisabled()}>
            Pagar
          </Button>
        )}
        {currentStep > 0 && currentStep !== 2 && (
          <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
            Volver
          </Button>
        )}
      </footer>
    </section>
  )
}
