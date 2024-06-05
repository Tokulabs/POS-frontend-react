import { Button, Modal, Spin } from 'antd'
import { FC, useCallback, useMemo } from 'react'
import { AddPaymentMethods } from '../../POS/components/AddPaymentMethods'
import { useGetinvoiceByCode } from '../../../hooks/useInvoices'
import { buildPrintDataFromInvoiceProps, calcTotalPrices } from '../../../utils/helpers'
import { IInvoiceProps } from '../types/InvoicesTypes'
import { useCart } from '../../../store/useCartStoreZustand'
import { usePaymentMethodsData } from '../../../store/usePaymentMethodsZustand'
import {
  IPaymentMethod,
  IPaymentMethodToSend,
  PaymentMethodsEnum,
} from '../../POS/components/types/PaymentMethodsTypes'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updatePaymentMethods } from '../helpers/services'
import { toast } from 'sonner'

const reversePaymentMethods = (payment_methods: IPaymentMethodToSend[]): IPaymentMethod[] => {
  const groupedPayments: { [key: string]: IPaymentMethod } = {}

  payment_methods.forEach((item) => {
    const name = item.name || ''

    if (!groupedPayments[name]) {
      groupedPayments[name] = {
        name: PaymentMethodsEnum[name as keyof typeof PaymentMethodsEnum],
        paidAmount: [],
        transactionNumber: [],
        backAmount: item.back_amount || 0,
        receivedAmount: 0,
        totalPaidAmount: 0,
      }
    }

    groupedPayments[name].paidAmount.push(item.paid_amount || 0)
    groupedPayments[name].transactionNumber.push(item.transaction_code || '')
    groupedPayments[name].totalPaidAmount += item.paid_amount || 0
    groupedPayments[name].receivedAmount += item.received_amount || 0
  })

  return Object.values(groupedPayments)
}

const ChangePaymentMethodsInvoice: FC<{
  isVisible: boolean
  invoiceId: number
  onSuccessCallback: () => void
  onCancelCallback: () => void
}> = ({ isVisible = false, invoiceId, onSuccessCallback, onCancelCallback }) => {
  const { clearCart } = useCart()
  const { clearPaymentMethods, paymentMethods, paymentTerminalID, isDollar, totalValueToPay } =
    usePaymentMethodsData()
  const { isPending, invoicesByCodeData } = useGetinvoiceByCode('invoiceByCode', String(invoiceId))
  const queryClient = useQueryClient()

  const NewArrayPaymenths = invoicesByCodeData
    ? reversePaymentMethods(invoicesByCodeData.payment_methods)
    : []

  const getKeyFromValue = (value: string): string | undefined => {
    return Object.keys(PaymentMethodsEnum).find(
      (key) => PaymentMethodsEnum[key as keyof typeof PaymentMethodsEnum] === value,
    )
  }

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: updatePaymentMethods,
    onSuccess: () => {
      toast.success('Métodos de pago actualizado correctamente')
      queryClient.invalidateQueries({ queryKey: ['paginatedInvoices'] })
      clearPaymentMethods()
      clearCart()
      onSuccessCallback()
    },
  })

  const onSubmit = () => {
    const payment_methods: IPaymentMethodToSend[] = []
    paymentMethods.forEach((item) => {
      item.paidAmount.map((paidAmount, index) => {
        if (paidAmount > 0) {
          payment_methods.push({
            name: getKeyFromValue(item.name) || null,
            paid_amount: paidAmount,
            transaction_code: item.transactionNumber[index] || null,
            back_amount: item.backAmount || 0,
            received_amount:
              item.name === PaymentMethodsEnum.cash ? item.receivedAmount : paidAmount,
          })
        }
      })
    })
    mutate({
      invoiceID: String(invoicesByCodeData?.id),
      values: {
        payment_methods,
        payment_terminal_id: paymentTerminalID,
        is_dollar: isDollar,
      },
    })
  }

  const requirePaymentTerminal = useMemo(() => {
    return (
      paymentMethods.some(
        (item) =>
          item.name === PaymentMethodsEnum.debitCard || item.name === PaymentMethodsEnum.creditCard,
      ) && !paymentTerminalID
    )
  }, [paymentMethods, paymentTerminalID])

  const isDisabledUpdateButton = useCallback(() => {
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

    return (
      !paymentMethods.length ||
      totalValueToPay !== totalCOP ||
      requirePaymentTerminal ||
      missingTransactionNumber.includes(false) ||
      (cashPayment && cashPayment.receivedAmount < cashPayment.paidAmount[0])
    )
  }, [paymentMethods, requirePaymentTerminal])

  if (isPending || !invoicesByCodeData) {
    return null
  }

  const dataFormated = buildPrintDataFromInvoiceProps(invoicesByCodeData as IInvoiceProps)
  const { totalCOP, totalUSD } = calcTotalPrices(dataFormated ? dataFormated.dataItems : [])
  const paymentTerminalIDNew = invoicesByCodeData.payment_terminal?.id || undefined
  const isDollarNew = invoicesByCodeData.is_dollar

  return (
    <Modal
      title={`Factura ${invoicesByCodeData.invoice_number}`}
      open={isVisible}
      onOk={onSuccessCallback}
      onCancel={() => {
        clearCart()
        clearPaymentMethods()
        onCancelCallback()
      }}
      footer={false}
      maskClosable={false}
      width={'55rem'}
    >
      <section className='flex flex-col gap-4'>
        {isPending && <Spin size='large' />}
        <AddPaymentMethods
          TotalUSDProp={totalUSD}
          totalCOPProp={totalCOP}
          paymentMethodsProp={NewArrayPaymenths}
          paymentTerminalIDProp={paymentTerminalIDNew}
          isDollarProp={isDollarNew}
        />
        <Button
          type='primary'
          onClick={onSubmit}
          loading={isLoading}
          disabled={isDisabledUpdateButton()}
        >
          Guardar
        </Button>
      </section>
    </Modal>
  )
}

export { ChangePaymentMethodsInvoice }
