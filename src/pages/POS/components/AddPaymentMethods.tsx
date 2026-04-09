import { FC, useEffect, useMemo, useState } from 'react'
// Third Party
import { Divider, Input, InputNumber, Radio, Select, Switch } from 'antd'
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
import { useFeatureFlag } from '@/hooks/useSubscription'

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
  hideTip?: boolean
}> = ({
  TotalUSDProp,
  totalCOPProp,
  paymentMethodsProp,
  paymentTerminalIDProp,
  isDollarProp,
  isElectornicInvoicedProp,
  hideTip = false,
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
      tipAmount,
      setTipAmount,
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

    const isRestaurant = useFeatureFlag('restaurant_addon')

    const [selectedItems, setSelectedItems] = useState<PaymentMethodsEnum[]>([])
    const [tipMode, setTipMode] = useState<'percentage' | 'fixed'>('percentage')
    const [tipInput, setTipInput] = useState<number>(0)

    const handleTipChange = (value: number | null, mode: 'percentage' | 'fixed' = tipMode) => {
      const v = value ?? 0
      setTipInput(v)
      const computed = mode === 'percentage' ? Math.round(totalCOP * (v / 100)) : v
      setTipAmount(computed)
    }

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

    // Derived: does any selected method require a payment terminal?
    const requirePaymentTerminal = useMemo(() => {
      return selectedItems.some(
        (item) => item === PaymentMethodsEnum.debitCard || item === PaymentMethodsEnum.creditCard,
      )
    }, [selectedItems])

    // Derived: should the electronic invoice switch be forced on?
    const disabledElectronicSwitch = useMemo(() => {
      if (paymentMethods.length === 0) return false
      return paymentMethods.some(
        (item) =>
          item.name === PaymentMethodsEnum.debitCard ||
          item.name === PaymentMethodsEnum.creditCard ||
          item.name === PaymentMethodsEnum.bankTransfer ||
          item.name === PaymentMethodsEnum.nequi,
      )
    }, [paymentMethods])

    // When electronic invoice is forced by card selection, sync the store
    useEffect(() => {
      if (disabledElectronicSwitch) {
        toggleElectronicInvoice(true)
      } else {
        toggleElectronicInvoice(false)
      }
    }, [disabledElectronicSwitch])

    // When payment terminal requirement changes, update the terminal ID
    useEffect(() => {
      if (!requirePaymentTerminal) {
        updatePaymentTerminalID(null)
      } else if (paymentMethodsProp) {
        updatePaymentTerminalID(paymentTerminalIDProp || null)
      }
    }, [requirePaymentTerminal])

    // Reset to cash-only when isDollar is toggled or totalCOP becomes 0
    useEffect(() => {
      if (isDollar || totalCOP === 0) {
        setSelectedItems([PaymentMethodsEnum.cash])
        paymentMethods.map((item) => removePaymentMethod(item.name))
        addPaymentMethod(defaultPaymenthMethod)
      }
    }, [isDollar, totalCOP])

    // Mount: initialize payment methods from props or defaults
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
      if (isElectornicInvoicedProp) toggleElectronicInvoice(true)
    }, [])

    const onSelectPaymentTerminal = (value: number) => {
      updatePaymentTerminalID(value)
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


    return (
      <section className='relative flex flex-col w-full h-full gap-4'>
        <section className='sticky flex flex-col w-full gap-4 bg-card'>
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
                    className={`${(totalCOP + tipAmount) - totalValueToPay < 0 ? 'text-red-1' : 'text-green-1'} text-xl font-bold `}
                  >
                    {formatNumberToColombianPesos((totalCOP + tipAmount) - totalValueToPay, true)}
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
                  disabled={disabledElectronicSwitch}
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

        {/* Tip section */}
        {!isDollar && isRestaurant && !hideTip && (
          <div className='flex items-center gap-3 p-3 rounded-md border border-solid border-green-1 bg-card'>
            <span className='font-semibold text-sm shrink-0'>Propina</span>
            <Radio.Group
              size='small'
              value={tipMode}
              onChange={(e) => {
                setTipMode(e.target.value)
                handleTipChange(tipInput, e.target.value)
              }}
            >
              <Radio.Button value='percentage'>%</Radio.Button>
              <Radio.Button value='fixed'>$</Radio.Button>
            </Radio.Group>
            <InputNumber
              style={{ width: 120 }}
              min={0}
              max={tipMode === 'percentage' ? 100 : undefined}
              value={tipInput}
              onChange={(v) => handleTipChange(v)}
              controls={false}
              autoComplete='off'
              addonAfter={tipMode === 'percentage' ? '%' : 'COP'}
            />
            {tipAmount > 0 && (
              <span className='text-sm text-green-1 font-semibold'>
                = {formatNumberToColombianPesos(tipAmount)}
              </span>
            )}
          </div>
        )}

        <section className='flex flex-col gap-5'>
          {paymentMethods.map((item, index) => (
            <div
              key={index}
              className='flex flex-col w-full gap-4 p-4 bg-card border border-solid rounded-md shadow-md border-green-1'
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
