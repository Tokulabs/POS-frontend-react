import { Divider, Input, InputNumber, Select, Switch } from 'antd'
import { useEffect, useState } from 'react'
import { PaymentMethodsEnum } from './types/PaymentMethodsTypes'
import { usePaymentMethodsData } from '../../../store/usePaymentMethodsZustand'
import { useCart } from '../../../store/useCartStoreZustand'
import { formatNumberToColombianPesos } from '../../../utils/helpers'

const OPTIONS = [
  PaymentMethodsEnum.cash,
  PaymentMethodsEnum.debitCard,
  PaymentMethodsEnum.creditCard,
  PaymentMethodsEnum.nequi,
  PaymentMethodsEnum.bankTransfer,
]

export const AddPaymentMethods = () => {
  const { totalCOP } = useCart()
  const {
    addPaymentMethod,
    totalValueReceived,
    updateTotalValues,
    paymentMethods,
    totalValueToPay,
    removePaymentMethod,
    toggleIsDollar,
    isDollar,
    totalReturnedValue,
    updateValueOfPaymentMethod,
  } = usePaymentMethodsData()

  const [selectedItems, setSelectedItems] = useState<PaymentMethodsEnum[]>([
    PaymentMethodsEnum.cash,
  ])
  const filteredOptions = OPTIONS.filter((o) => {
    if (isDollar) return o === PaymentMethodsEnum.cash
    return !selectedItems.includes(o)
  })

  const defaultPaymenthMethod = {
    name: PaymentMethodsEnum.cash,
    paidAmount: totalCOP,
    backAmount: 0,
    receivedAmount: totalCOP,
    transactionNumber: '',
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
          updateValueOfPaymentMethod(PaymentMethodsEnum.cash, 'paidAmount', totalCOP)
          updateValueOfPaymentMethod(PaymentMethodsEnum.cash, 'receivedAmount', totalCOP)
        }
      })
    }
  }, [isDollar])

  useEffect(() => {
    updateTotalValues()
    addPaymentMethod(defaultPaymenthMethod)
  }, [])

  useEffect(() => {
    selectedItems.forEach((item) => {
      if (!paymentMethods.some((method) => method.name === item)) {
        addPaymentMethod({
          name: item,
          paidAmount: item === PaymentMethodsEnum.cash ? totalCOP : 0,
          backAmount: 0,
          receivedAmount: item === PaymentMethodsEnum.cash ? totalCOP : 0,
          transactionNumber: '',
        })
      }
    })
    paymentMethods.forEach((method) => {
      if (!selectedItems.includes(method.name)) {
        removePaymentMethod(method.name)
      }
    })
  }, [selectedItems, paymentMethods])

  return (
    <section className='w-full h-full flex flex-col gap-4 relative'>
      <section className='flex flex-col gap-4 bg-white sticky w-full'>
        <div className='flex justify-start gap-5 items-end'>
          <span className='h-full text-green-1 text-3xl font-bold flex justify-start items-center'>
            {formatNumberToColombianPesos(totalCOP)}
          </span>
          <Divider type='vertical' className='h-full' />
          <div className='flex flex-col justify-end items-center'>
            <span className='text-green-1 text-xl font-bold'>
              {formatNumberToColombianPesos(totalValueToPay)}
            </span>
            <span className='text-gray-2 font-semibold'>Valor a Pagar</span>
          </div>
          <Divider type='vertical' className='h-full' />
          <div className='flex flex-col justify-end items-center'>
            <span
              className={`${totalValueReceived < totalCOP ? 'text-red-1' : 'text-green-1'} text-xl font-bold`}
            >
              {formatNumberToColombianPesos(totalValueReceived)}
            </span>
            <span className='text-gray-2 font-semibold'>Valor Total Recibido</span>
          </div>
          <Divider type='vertical' className='h-full' />
          <div className='flex flex-col justify-end items-center'>
            <span className='text-red-1 text-xl font-bold'>
              {totalReturnedValue > 0 ? formatNumberToColombianPesos(totalReturnedValue) : '0'}
            </span>
            <span className='text-gray-2 font-semibold'>Cambio</span>
          </div>
          <Divider type='vertical' className='h-full' />
          <div className='flex flex-col justify-end items-center'>
            <span className='text-green-1 text-xl font-bold'>
              <Switch onChange={toggleIsDollar} />
            </span>
            <span className='text-gray-2 font-semibold'>Pago en dolares?</span>
          </div>
        </div>
        <Select
          mode='multiple'
          placeholder='Métodos de pago seleccionados'
          value={selectedItems}
          onChange={setSelectedItems}
          style={{ width: '100%' }}
          options={filteredOptions.map((item) => ({
            value: item,
            label: item,
          }))}
        />
      </section>
      <section className='flex flex-col gap-5'>
        {paymentMethods.map((item, index) => (
          <div
            key={index}
            className='border-solid border bg-white border-green-1 rounded-md shadow-md p-4 flex flex-col gap-4 w-full'
          >
            <span className='font-bold'>{item.name}</span>
            <section className='flex gap-4 w-full justify-between items-center'>
              <div className='flex gap-3 w-1/2 items-center'>
                <span className='w-1/4'>Valor a pagar</span>
                <InputNumber
                  style={{ width: '75%' }}
                  value={isDollar ? totalCOP : item.paidAmount}
                  min={0}
                  onChange={(event) =>
                    updateValueOfPaymentMethod(item.name, 'paidAmount', event as number)
                  }
                  controls={false}
                  autoComplete='off'
                  required
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
                    onChange={(event) =>
                      updateValueOfPaymentMethod(item.name, 'receivedAmount', event as number)
                    }
                    controls={false}
                    autoComplete='off'
                    required
                    disabled={isDollar}
                  />
                </div>
              )}
              {requireTransactionNumber(item.name) && (
                <div className='flex gap-3 w-1/2 items-center'>
                  <span className='w-1/4'>Número de transacción</span>
                  <Input
                    style={{ width: '75%' }}
                    defaultValue={item.transactionNumber}
                    onChange={(event) => console.log(event)}
                    autoComplete='off'
                    type='text'
                  />
                </div>
              )}
            </section>
          </div>
        ))}
      </section>
    </section>
  )
}
