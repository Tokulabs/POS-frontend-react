import { useEffect, useState } from 'react'
// Third Party
import { Divider, Input, InputNumber, Select, Switch } from 'antd'
import { IconPlus, IconTrash } from '@tabler/icons-react'
// Types
import { PaymentMethodsEnum } from './types/PaymentMethodsTypes'
// Store
import { usePaymentMethodsData } from '../../../store/usePaymentMethodsZustand'
import { useCart } from '../../../store/useCartStoreZustand'
// Helpers
import { formatNumberToColombianPesos, formatToUsd } from '../../../utils/helpers'
// Hooks
import { usePaymentTerminals } from '../../../hooks/usePaymentTerminals'

const OPTIONS = [
  PaymentMethodsEnum.cash,
  PaymentMethodsEnum.debitCard,
  PaymentMethodsEnum.creditCard,
  PaymentMethodsEnum.nequi,
  PaymentMethodsEnum.bankTransfer,
]

export const AddPaymentMethods = () => {
  const { totalCOP, totalUSD } = useCart()
  const {
    totalValueReceived,
    paymentMethods,
    totalValueToPay,
    isDollar,
    totalReturnedValue,
    paymentTerminaID,
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

  const [selectedItems, setSelectedItems] = useState<PaymentMethodsEnum[]>([
    PaymentMethodsEnum.cash,
  ])
  const [requirePaymentTerminal, setRequirePaymentTerminal] = useState(false)

  const filteredOptions = OPTIONS.filter((o) => {
    if (isDollar) return o === PaymentMethodsEnum.cash
    return !selectedItems.includes(o)
  })

  const { paymentTerminalsData } = usePaymentTerminals('allPaymentTerminals', {})

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
      paymentMethods.forEach((method) => {
        if (method.name !== PaymentMethodsEnum.cash) {
          removePaymentMethod(method.name)
          updatePaidAmount(PaymentMethodsEnum.cash, totalCOP)
          updateReceivedAmount(PaymentMethodsEnum.cash, totalCOP)
        }
      })
    }
  }, [isDollar])

  useEffect(() => {
    updateTotalValues()
    addPaymentMethod(defaultPaymenthMethod)
  }, [])

  useEffect(() => {
    const requirePaymentTerminal = selectedItems.some(
      (item) => item === PaymentMethodsEnum.debitCard || item === PaymentMethodsEnum.creditCard,
    )
    setRequirePaymentTerminal(requirePaymentTerminal)
    if (!requirePaymentTerminal) updatePaymentTerminalID(null)

    selectedItems.forEach((item) => {
      if (!paymentMethods.some((method) => method.name === item)) {
        addPaymentMethod({
          name: item,
          paidAmount: isDollar ? [totalCOP] : [0],
          totalPaidAmount: isDollar ? totalCOP : 0,
          backAmount: 0,
          receivedAmount: isDollar ? totalCOP : 0,
          transactionNumber: [''],
        })
      }
    })
    paymentMethods.forEach((method) => {
      if (!selectedItems.includes(method.name)) {
        removePaymentMethod(method.name)
      }
    })
  }, [selectedItems, paymentMethods])

  const onSelectPaymentTerminal = (value: number) => {
    updatePaymentTerminalID(value)
  }

  return (
    <section className='w-full h-full flex flex-col gap-4 relative'>
      <section className='flex flex-col gap-4 bg-white sticky w-full'>
        <div className='flex justify-start gap-5 items-end'>
          <span className='h-full text-green-1 text-3xl font-bold flex justify-start items-center'>
            {isDollar ? formatToUsd(totalUSD, true) : formatNumberToColombianPesos(totalCOP, true)}
          </span>
          <Divider type='vertical' className='h-full' />
          <div className='flex flex-col justify-end items-center'>
            <span className='text-green-1 text-xl font-bold'>
              {isDollar
                ? formatToUsd(totalUSD, true)
                : formatNumberToColombianPesos(totalValueToPay, true)}
            </span>
            <span className='text-gray-2 font-semibold'>Valor a Pagar</span>
          </div>
          <Divider type='vertical' className='h-full' />
          <div className='flex flex-col justify-end items-center'>
            <span
              className={`${totalValueReceived < totalCOP ? 'text-red-1' : 'text-green-1'} text-xl font-bold`}
            >
              {isDollar
                ? formatToUsd(totalUSD, true)
                : formatNumberToColombianPesos(totalValueReceived, true)}
            </span>
            <span className='text-gray-2 font-semibold'>Valor Total Recibido</span>
          </div>
          <Divider type='vertical' className='h-full' />
          <div className='flex flex-col justify-end items-center'>
            <span className='text-red-1 text-xl font-bold'>
              {totalReturnedValue > 0
                ? formatNumberToColombianPesos(totalReturnedValue, true)
                : '0'}
            </span>
            <span className='text-gray-2 font-semibold'>Cambio</span>
          </div>
          <Divider type='vertical' className='h-full' />
          <div className='flex flex-col justify-end items-center'>
            <span className='text-green-1 text-xl font-bold'>
              <Switch
                onChange={() => {
                  toggleIsDollar()
                  updatePaidAmount(PaymentMethodsEnum.cash, totalCOP)
                  updateReceivedAmount(PaymentMethodsEnum.cash, totalCOP)
                }}
              />
            </span>
            <span className='text-gray-2 font-semibold'>Pago en USD?</span>
          </div>
        </div>
        <div className='flex gap-4'>
          <Select
            mode='multiple'
            placeholder='Métodos de pago seleccionados'
            value={selectedItems}
            onChange={setSelectedItems}
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
              value={paymentTerminaID}
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
