import { FC, useEffect, useState } from 'react'
// Third Party
import { Divider, Input, InputNumber, Select, Switch } from 'antd'
import { IconPlus, IconTrash } from '@tabler/icons-react'
// Types
import { IPaymentMethod, PaymentMethodsEnum } from './types/PaymentMethodsTypes'
// Store
import { usePaymentMethodsData } from '@/store/usePaymentMethodsZustand'
import { useCart } from '@/store/useCartStoreZustand'
// Helpers
import { formatNumberToColombianPesos, formatToUsd } from '@/utils/helpers'
// Hooks
import { usePaymentTerminals } from '@/hooks/usePaymentTerminals'

const OPTIONS = [
  PaymentMethodsEnum.cash,
  PaymentMethodsEnum.debitCard,
  PaymentMethodsEnum.creditCard,
  PaymentMethodsEnum.nequi,
  PaymentMethodsEnum.bankTransfer,
]

export const AddPaymentMethods: FC<{
  totalCOPProp?: number
  TotalUSDProp?: number
  paymentMethodsProp?: IPaymentMethod[]
  paymentTerminalIDProp?: number | null
  isDollarProp?: boolean
  isElectornicInvoicedProp?: boolean
}> = ({
  TotalUSDProp,
  totalCOPProp,
  paymentMethodsProp,
  paymentTerminalIDProp,
  isDollarProp,
  isElectornicInvoicedProp,
}) => {
  const { totalCOP: totalCOPState, totalUSD: totalUSDState } = useCart()
  const totalCOP = totalCOPProp || totalCOPState
  const totalUSD = TotalUSDProp || totalUSDState
  const {
    totalValueReceived,
    paymentMethods,
    totalValueToPay,
    isDollar,
    isElectronicInvoice,
    totalReturnedValue,
    paymentTerminalID,
    addPaymentMethod,
    updateTotalValues,
    removePaymentMethod,
    toggleIsDollar,
    toggleElectronicInvoice,
    updatePaidAmount,
    updateReceivedAmount,
    updatePaymentTerminalID,
    addPaidAmountToPaymentMethod,
    removePaidAmountFromPaymentMethod,
    updateTransactionNumber,
  } = usePaymentMethodsData()

  const [selectedItems, setSelectedItems] = useState<PaymentMethodsEnum[]>([])
  const [requirePaymentTerminal, setRequirePaymentTerminal] = useState(false)
  const [disbaledElectronicSwitch, setDisbaledElectronicSwitch] = useState(false)
  const [sendElectronicInvoice, setSendElectronicInvoice] = useState(false)

  const filteredOptions = OPTIONS.filter((o) => {
    if (isDollar) return o === PaymentMethodsEnum.cash
    return !selectedItems.includes(o)
  })

  const { paymentTerminalsData } = usePaymentTerminals('allPaymentTerminals', { active: 'True' })

  const defaultPaymenthMethod = {
    name: PaymentMethodsEnum.cash,
    paidAmount: [totalCOP],
    totalPaidAmount: totalCOP,
    backAmount: 0,
    receivedAmount: totalCOP,
    transactionNumber: [''],
  }

  const requireTransactionNumber = (name: PaymentMethodsEnum) =>
    name === PaymentMethodsEnum.creditCard ||
    name === PaymentMethodsEnum.bankTransfer ||
    name === PaymentMethodsEnum.debitCard ||
    name === PaymentMethodsEnum.nequi

  useEffect(() => {
    if (isDollar || totalCOP === 0) {
      setSelectedItems([PaymentMethodsEnum.cash])
      paymentMethods.map((item) => removePaymentMethod(item.name))
      addPaymentMethod(defaultPaymenthMethod)
    }
  }, [isDollar, totalCOP])

  useEffect(() => {
    updateTotalValues()
    if (isDollarProp) toggleIsDollar(isDollarProp)

    if (paymentMethodsProp) {
      const newSelectedItems: PaymentMethodsEnum[] = []
      paymentMethodsProp.map((item) => {
        addPaymentMethod(item)
        newSelectedItems.push(item.name)
      })
      setSelectedItems(newSelectedItems)
    } else {
      addPaymentMethod(defaultPaymenthMethod)
      selectPaymentMethod([PaymentMethodsEnum.cash])
    }
    if (isElectornicInvoicedProp) setSendElectronicInvoice(isElectornicInvoicedProp)
  }, [])

  useEffect(() => {
    if (isElectornicInvoicedProp) toggleElectronicInvoice(sendElectronicInvoice)
  }, [sendElectronicInvoice])

  const checkIfRequirePaymentTerminal = (items: PaymentMethodsEnum[]) => {
    const requirePaymentTerminal = items.some(
      (item) => item === PaymentMethodsEnum.debitCard || item === PaymentMethodsEnum.creditCard,
    )
    setRequirePaymentTerminal(requirePaymentTerminal)
    if (!requirePaymentTerminal) updatePaymentTerminalID(null)
    if (requirePaymentTerminal && paymentMethodsProp)
      updatePaymentTerminalID(paymentTerminalIDProp || null)
  }

  const selectPaymentMethod = (paymentMethodsSelected: PaymentMethodsEnum[]) => {
    setSelectedItems(paymentMethodsSelected)
    paymentMethodsSelected.forEach((item) => {
      if (!paymentMethods.some((method) => method.name === item)) {
        addPaymentMethod({
          name: item,
          paidAmount: isDollar ? [totalCOP] : [0],
          totalPaidAmount: isDollar ? totalCOP : 0,
          backAmount: 0,
          receivedAmount: isDollar ? totalCOP : 0,
          transactionNumber: [],
        })
      }
    })
  }

  const deselectPaymentMethod = (name: string) => {
    setSelectedItems(selectedItems.filter((item) => item !== name))
    paymentMethods.forEach((method) => {
      if (name === method.name) {
        removePaymentMethod(method.name)
      }
    })
  }

  useEffect(() => {
    checkIfRequirePaymentTerminal(selectedItems)
  }, [selectedItems])

  const onSelectPaymentTerminal = (value: number) => {
    updatePaymentTerminalID(value)
  }

  useEffect(() => {
    if (paymentMethods.length > 0) {
      const hasCard = paymentMethods.some(
        (item) =>
          item.name === PaymentMethodsEnum.debitCard ||
          item.name === PaymentMethodsEnum.creditCard ||
          item.name === PaymentMethodsEnum.bankTransfer ||
          item.name === PaymentMethodsEnum.nequi,
      )
      if (hasCard) {
        setDisbaledElectronicSwitch(true)
        toggleElectronicInvoice(true)
      } else {
        setDisbaledElectronicSwitch(false)
        toggleElectronicInvoice(false)
      }
    }
  }, [paymentMethods])

  return (
    <section className='relative flex flex-col w-full h-full gap-4'>
      <section className='sticky flex flex-col w-full gap-4 bg-white'>
        <div className='flex justify-between'>
          <div className='flex items-end justify-start gap-5'>
            <div className='flex flex-col items-center justify-end'>
              <span className='text-xl font-bold text-green-1'>
                {isDollar
                  ? formatToUsd(totalUSD, true)
                  : formatNumberToColombianPesos(totalValueToPay, true)}
              </span>
              <span className='text-sm font-semibold text-gray-2'>Valor a Pagar</span>
            </div>
            {!isDollar && <Divider type='vertical' className='h-full' />}
            {!isDollar && (
              <div className='flex flex-col items-center justify-end'>
                <span
                  className={`${totalCOP - totalValueToPay < 0 ? 'text-red-1' : 'text-green-1'} text-xl font-bold `}
                >
                  {formatNumberToColombianPesos(totalCOP - totalValueToPay, true)}
                </span>
                <span className='text-sm font-semibold text-gray-2'>Diferencia</span>
              </div>
            )}
            <Divider type='vertical' className='h-full' />
            <div className='flex flex-col items-center justify-end'>
              <span
                className={`${totalValueReceived < totalCOP ? 'text-red-1' : 'text-green-1'} text-xl font-bold`}
              >
                {isDollar
                  ? formatToUsd(totalUSD, true)
                  : formatNumberToColombianPesos(totalValueReceived, true)}
              </span>
              <span className='text-sm font-semibold text-gray-2'>Valor Total Recibido</span>
            </div>
            <Divider type='vertical' className='h-full' />
            <div className='flex flex-col items-center justify-end'>
              <span className='text-xl font-bold text-red-1'>
                {totalReturnedValue > 0
                  ? formatNumberToColombianPesos(totalReturnedValue, true)
                  : formatNumberToColombianPesos(0, true)}
              </span>
              <span className='text-sm font-semibold text-gray-2'>Cambio</span>
            </div>
            <Divider type='vertical' className='h-full' />
          </div>
          <div className='flex flex-col items-center justify-end'>
            <span className='text-xl font-bold text-green-1'>
              <Switch
                value={isDollar}
                onChange={() => {
                  toggleIsDollar()
                  updatePaidAmount(PaymentMethodsEnum.cash, totalCOP)
                  updateReceivedAmount(PaymentMethodsEnum.cash, totalCOP)
                }}
              />
            </span>
            <span className='text-sm font-semibold text-gray-2'>Pago en USD?</span>
          </div>
          <div className='flex flex-col items-center justify-end'>
            <span className='text-xl font-bold text-green-1'>
              <Switch
                value={isElectronicInvoice}
                onChange={() => {
                  toggleElectronicInvoice()
                }}
                disabled={disbaledElectronicSwitch}
              />
            </span>
            <span className='text-sm font-semibold text-gray-2'>Factura electrónica?</span>
          </div>
        </div>
        <div className='flex gap-4'>
          <Select
            mode='multiple'
            placeholder='Métodos de pago seleccionados'
            value={selectedItems}
            onChange={selectPaymentMethod}
            onDeselect={deselectPaymentMethod}
            style={{ width: requirePaymentTerminal ? '50%' : '100%' }}
            options={filteredOptions.map((item) => ({
              value: item,
              label: item,
            }))}
          />
          {requirePaymentTerminal && paymentTerminalsData?.results && (
            <Select
              style={{ width: '50%' }}
              placeholder='Selecciona un Datafono'
              value={paymentTerminalID}
              onSelect={onSelectPaymentTerminal}
              options={[
                {
                  value: '',
                  label: 'Selecciona un Datafono',
                },
                ...paymentTerminalsData.results.map((item) => ({
                  value: item.id,
                  label: item.name,
                })),
              ]}
            />
          )}
        </div>
      </section>
      <section className='flex flex-col gap-5'>
        {paymentMethods.map((item, index) => (
          <div
            key={index}
            className='flex flex-col w-full gap-4 p-4 bg-white border border-solid rounded-md shadow-md border-green-1'
          >
            <div className='flex items-center justify-between'>
              <span className='font-bold'>{item.name}</span>
              {(item.name === PaymentMethodsEnum.debitCard ||
                item.name === PaymentMethodsEnum.creditCard) && (
                <div
                  className='flex items-center gap-1 underline cursor-pointer text-green-1'
                  onClick={() => addPaidAmountToPaymentMethod(item.name)}
                >
                  <IconPlus /> <span>Agregar nueva tarjeta</span>
                </div>
              )}
            </div>
            {item.paidAmount.map((amount, index) => (
              <section key={index} className='flex items-center justify-between w-full gap-4'>
                <div className='flex items-center w-1/2 gap-3'>
                  <span className='w-1/4'>Valor a pagar</span>
                  <InputNumber
                    style={{ width: '75%' }}
                    value={isDollar ? totalCOP : amount}
                    min={0}
                    onChange={(event) => updatePaidAmount(item.name, event as number, index)}
                    controls={false}
                    autoComplete='off'
                    required={true}
                    disabled={isDollar || totalCOP === 0}
                  />
                </div>

                {!requireTransactionNumber(item.name) && (
                  <div className='flex items-center w-1/2 gap-3'>
                    <span className='w-1/4'>Valor recibido</span>
                    <InputNumber
                      style={{ width: '75%' }}
                      value={isDollar ? totalCOP : item.receivedAmount}
                      min={0}
                      onChange={(event) => updateReceivedAmount(item.name, event as number)}
                      controls={false}
                      autoComplete='off'
                      required={true}
                      disabled={isDollar || totalCOP === 0}
                    />
                  </div>
                )}
                {requireTransactionNumber(item.name) && (
                  <div className='flex items-center w-1/2 gap-3'>
                    <span className='w-1/4'>Número de transacción</span>
                    <Input
                      style={{ width: '75%' }}
                      value={item.transactionNumber[index]}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        updateTransactionNumber(item.name, event.target.value, index)
                      }
                      autoComplete='off'
                      required={true}
                      type='text'
                    />
                  </div>
                )}
                {(item.name === PaymentMethodsEnum.debitCard ||
                  item.name === PaymentMethodsEnum.creditCard) &&
                  item.paidAmount.length > 1 && (
                    <div
                      className='flex items-center gap-1 underline cursor-pointer text-green-1'
                      onClick={() => {
                        removePaidAmountFromPaymentMethod(item.name, index)
                      }}
                    >
                      <IconTrash />
                    </div>
                  )}
              </section>
            ))}
          </div>
        ))}
      </section>
    </section>
  )
}
