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
}> = ({ TotalUSDProp, totalCOPProp, paymentMethodsProp, paymentTerminalIDProp, isDollarProp }) => {
  const { totalCOP: totalCOPState, totalUSD: totalUSDState } = useCart()
  const totalCOP = totalCOPProp || totalCOPState
  const totalUSD = TotalUSDProp || totalUSDState
  const {
    totalValueReceived,
    paymentMethods,
    totalValueToPay,
    isDollar,
    totalReturnedValue,
    paymentTerminalID,
    addPaymentMethod,
    updateTotalValues,
    removePaymentMethod,
    toggleIsDollar,
    updatePaidAmount,
    updateReceivedAmount,
    updatePaymentTerminalID,
    addPaidAmountToPaymentMethod,
    removePaidAmountFromPaymentMethod,
    updateTransactionNumber,
  } = usePaymentMethodsData()

  const [selectedItems, setSelectedItems] = useState<PaymentMethodsEnum[]>([])
  const [requirePaymentTerminal, setRequirePaymentTerminal] = useState(false)

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
    if (isDollar) {
      setSelectedItems([PaymentMethodsEnum.cash])
      paymentMethods.map((item) => removePaymentMethod(item.name))
      addPaymentMethod(defaultPaymenthMethod)
    }
  }, [isDollar])

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
  }, [])

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

  return (
    <section className='w-full h-full flex flex-col gap-4 relative'>
      <section className='flex flex-col gap-4 bg-white sticky w-full'>
        <div className='flex justify-between'>
          <div className='flex justify-start gap-5 items-end'>
            <div className='flex flex-col justify-end items-center'>
              <span className='text-green-1 text-xl font-bold'>
                {isDollar
                  ? formatToUsd(totalUSD, true)
                  : formatNumberToColombianPesos(totalValueToPay, true)}
              </span>
              <span className='text-gray-2 font-semibold text-sm'>Valor a Pagar</span>
            </div>
            {!isDollar && <Divider type='vertical' className='h-full' />}
            {!isDollar && (
              <div className='flex flex-col justify-end items-center'>
                <span
                  className={`${totalCOP - totalValueToPay < 0 ? 'text-red-1' : 'text-green-1'} text-xl font-bold `}
                >
                  {formatNumberToColombianPesos(totalCOP - totalValueToPay, true)}
                </span>
                <span className='text-gray-2 font-semibold text-sm'>Diferencia</span>
              </div>
            )}
            <Divider type='vertical' className='h-full' />
            <div className='flex flex-col justify-end items-center'>
              <span
                className={`${totalValueReceived < totalCOP ? 'text-red-1' : 'text-green-1'} text-xl font-bold`}
              >
                {isDollar
                  ? formatToUsd(totalUSD, true)
                  : formatNumberToColombianPesos(totalValueReceived, true)}
              </span>
              <span className='text-gray-2 font-semibold text-sm'>Valor Total Recibido</span>
            </div>
            <Divider type='vertical' className='h-full' />
            <div className='flex flex-col justify-end items-center'>
              <span className='text-red-1 text-xl font-bold'>
                {totalReturnedValue > 0
                  ? formatNumberToColombianPesos(totalReturnedValue, true)
                  : formatNumberToColombianPesos(0, true)}
              </span>
              <span className='text-gray-2 font-semibold text-sm'>Cambio</span>
            </div>
            <Divider type='vertical' className='h-full' />
          </div>
          <div className='flex flex-col justify-end items-center'>
            <span className='text-green-1 text-xl font-bold'>
              <Switch
                value={isDollar}
                onChange={() => {
                  toggleIsDollar()
                  updatePaidAmount(PaymentMethodsEnum.cash, totalCOP)
                  updateReceivedAmount(PaymentMethodsEnum.cash, totalCOP)
                }}
              />
            </span>
            <span className='text-gray-2 font-semibold text-sm'>Pago en USD?</span>
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
            className='border-solid border bg-white border-green-1 rounded-md shadow-md p-4 flex flex-col gap-4 w-full'
          >
            <div className='flex justify-between items-center'>
              <span className='font-bold'>{item.name}</span>
              {(item.name === PaymentMethodsEnum.debitCard ||
                item.name === PaymentMethodsEnum.creditCard) && (
                <div
                  className='flex gap-1 items-center cursor-pointer text-green-1 underline'
                  onClick={() => addPaidAmountToPaymentMethod(item.name)}
                >
                  <IconPlus /> <span>Agregar nueva tarjeta</span>
                </div>
              )}
            </div>
            {item.paidAmount.map((amount, index) => (
              <section key={index} className='flex gap-4 w-full justify-between items-center'>
                <div className='flex gap-3 w-1/2 items-center'>
                  <span className='w-1/4'>Valor a pagar</span>
                  <InputNumber
                    style={{ width: '75%' }}
                    value={isDollar ? totalCOP : amount}
                    min={0}
                    onChange={(event) => updatePaidAmount(item.name, event as number, index)}
                    controls={false}
                    autoComplete='off'
                    required={true}
                    disabled={isDollar}
                  />
                </div>

                {!requireTransactionNumber(item.name) && (
                  <div className='flex gap-3 w-1/2 items-center'>
                    <span className='w-1/4'>Valor recibido</span>
                    <InputNumber
                      style={{ width: '75%' }}
                      value={isDollar ? totalCOP : item.receivedAmount}
                      min={0}
                      onChange={(event) => updateReceivedAmount(item.name, event as number)}
                      controls={false}
                      autoComplete='off'
                      required={true}
                      disabled={isDollar}
                    />
                  </div>
                )}
                {requireTransactionNumber(item.name) && (
                  <div className='flex gap-3 w-1/2 items-center'>
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
                      className='flex gap-1 items-center cursor-pointer text-green-1 underline'
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
