import { Form, Modal, Select, Button, Input, Switch, notification } from 'antd'
import { FC, useEffect, useState } from 'react'
import { DataPropsForm } from '../../../types/GlobalTypes'
import { useForm } from 'antd/es/form/Form'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { ISelectShopPurchase, PaymentMethodsEnum } from '../types/PurchaseTypes'
import { formatNumberToColombianPesos } from '../../../utils/helpers'
import { IPaymentMethodsProps } from '../../Invoices/types/InvoicesTypes'
import { useDianResolutions } from '../../../hooks/useDianResolution'

const SelectShopPurchaseForm: FC<ISelectShopPurchase> = ({
  isVisible = false,
  onSuccessCallback,
  onCancelCallback,
  shops,
  total,
  salesUsers,
}) => {
  const [form] = useForm()
  const [loading] = useState(false)
  const [paymentMethods] = useState([
    { value: 'cash', label: PaymentMethodsEnum.cash },
    { value: 'creditCard', label: PaymentMethodsEnum.creditCard },
    { value: 'debitCard', label: PaymentMethodsEnum.debitCard },
    { value: 'nequi', label: PaymentMethodsEnum.nequi },
    { value: 'bankTransfer', label: PaymentMethodsEnum.bankTransfer },
  ])
  const [paidAmountValues, setPaidAmountValues] = useState<number[]>([])
  const [receivedAmountValues, setReceivedAmountValues] = useState<number[]>([])
  const [backAmountValues, setBackAmountValues] = useState<number[]>([])
  const [sumTotalPaymentMethods, setSumTotalPaymentMethods] = useState(0)

  const { dianResolutionData } = useDianResolutions('allDianResolutions', {})

  const initialValues = {
    shop_id: '',
    sale_id: '',
    customer_name: '',
    customer_id: '',
    customer_email: '',
    customer_phone: '',
    payment_methods: [
      {
        name: 'cash',
        paid_amount: total,
        transaction_code: '',
        received_amount: '',
        back_amount: '',
      },
    ],
    is_dollar: false,
  }

  const onSubmit = async (values: DataPropsForm) => {
    if (total - sumTotalPaymentMethods > 0) {
      notification.error({
        message: 'Error',
        description: 'Todavia tienes un Saldo pendiente por pagar',
      })
      return
    }
    if (typeof values == null) return
    // return all values of form and add back_amount to payment_methods
    const paymentMethods: IPaymentMethodsProps[] = values.payment_methods as IPaymentMethodsProps[]
    paymentMethods.forEach((item, index) => {
      item.back_amount = backAmountValues[index] || 0
      if (!item.received_amount) item.received_amount = item.paid_amount
      if (item.name === 'cash') {
        item.transaction_code = ''
      } else {
        item.received_amount = 0
      }
    })
    values.payment_methods = paymentMethods

    onSuccessCallback(values)
    form.resetFields()
  }

  const handleAmountChange = (
    value: string,
    index: number,
    setAmountchange: (data: (prevValues: number[]) => number[]) => void,
  ) => {
    setAmountchange((prevValues: number[]) => {
      const newValues = [...prevValues]
      newValues[index] = Number(value)
      return newValues
    })
  }

  const handleDeleteAmount = (
    index: number,
    setAmountchange: (data: (prevValues: number[]) => number[]) => void,
  ) => {
    setAmountchange((prevValues: number[]) => prevValues.filter((_, i) => i !== index))
    setBackAmountValues((prevValues: number[]) => prevValues.filter((_, i) => i !== index))
  }

  useEffect(() => {
    handleAmountChange(total.toString(), 0, setPaidAmountValues)
  }, [])

  useEffect(() => {
    if (!isVisible) form.validateFields(['payment_methods'])
  }, [form.getFieldValue('payment_methods')])

  useEffect(() => {
    const suma = paidAmountValues.reduce((total, numero) => total + numero, 0)
    setSumTotalPaymentMethods(suma)
  }, [paidAmountValues])

  useEffect(() => {
    const change = receivedAmountValues.map((item, index) => item - paidAmountValues[index])
    setBackAmountValues(change)
  }, [paidAmountValues, receivedAmountValues])

  return (
    <Modal
      forceRender={true}
      width={1000}
      title={!dianResolutionData?.data?.length ? 'Crear resolución de la DIAN' : 'Crear Venta'}
      style={{ position: 'relative' }}
      open={isVisible}
      onCancel={() => {
        onCancelCallback()
        form.resetFields()
      }}
      footer={false}
      maskClosable={false}
    >
      {!dianResolutionData?.data?.length ? (
        <div>
          <h1>Debes tener una resolución de la DIAN creada para crear facturas</h1>
          <a href='/dian-resolution'>Crear resolución</a>
        </div>
      ) : (
        <div>
          <div className='absolute right-12 top-3'>
            <span className='text-base'>Factura: </span>
            <span className=' text-lg text-blue-500 font-bold'>
              GUA-{dianResolutionData?.data[0]?.current_number ?? 0}
            </span>
          </div>
          <Form layout='vertical' onFinish={onSubmit} form={form} initialValues={initialValues}>
            <div className='flex w-full gap-2'>
              <Form.Item
                style={{ width: '100%' }}
                label='Tienda'
                name='shop_id'
                rules={[{ required: true, message: 'Campo requerido' }]}
              >
                <Select
                  placeholder='Seleccionar tienda'
                  options={[
                    {
                      value: '',
                      label: 'Seleccionar tienda',
                    },
                    ...shops.map((item) => ({
                      value: item.id,
                      label: item.name,
                    })),
                  ]}
                />
              </Form.Item>
              <Form.Item label='Vendedor' name='sale_by_id' style={{ width: '100%' }}>
                <Select
                  placeholder='Seleccionar Vendedor'
                  options={[
                    {
                      value: '',
                      label: 'Seleccionar vendedor',
                    },
                    ...salesUsers.map((item) => ({
                      value: item.id,
                      label: item.fullname,
                    })),
                  ]}
                />
              </Form.Item>
            </div>
            <h3>Información del cliente</h3>
            <div className='flex gap-4 w-full'>
              <Form.Item
                style={{ width: '100%' }}
                label='Nombre'
                name='customer_name'
                rules={[{ required: total >= 200000, message: 'Campo requerido' }]}
              >
                <Input placeholder='Nombre' type='text' />
              </Form.Item>
              <Form.Item
                style={{ width: '100%' }}
                label='Número de identificación'
                name='customer_id'
                rules={[{ required: total >= 200000, message: 'Campo requerido' }]}
              >
                <Input placeholder='Identificación' type='text' />
              </Form.Item>
            </div>
            {total >= 200000 && (
              <div className='flex gap-4 w-full'>
                <Form.Item
                  style={{ width: '100%' }}
                  label='Correo electrónico'
                  name='customer_email'
                  rules={[{ required: true, message: 'Campo requerido' }]}
                >
                  <Input placeholder='Email' type='text' />
                </Form.Item>
                <Form.Item
                  style={{ width: '100%' }}
                  label='Telefono'
                  name='customer_phone'
                  rules={[{ required: true, message: 'Campo requerido' }]}
                >
                  <Input placeholder='Número de telefono' type='text' />
                </Form.Item>
              </div>
            )}
            <div className='flex gap-3 items-center'>
              <Form.Item style={{ margin: 0 }} name='is_dollar' valuePropName='checked'>
                <Switch />
              </Form.Item>
              <p className='m-0'>¿Pago en dolares (USD)?</p>
            </div>
            <nav className='flex w-full justify-between items-center mb-3'>
              <h3>Metodos de pago</h3>
              <div className='flex gap-4 items-end'>
                <p
                  className={`m-0 ${
                    total - sumTotalPaymentMethods > 0
                      ? 'text-green-700'
                      : total - sumTotalPaymentMethods < 0
                      ? 'text-red-500'
                      : ''
                  }`}
                >
                  Saldo:{' '}
                  <span className='text-xl font-bold'>
                    {formatNumberToColombianPesos(total - sumTotalPaymentMethods)}
                  </span>
                </p>
                <p className='m-0'>
                  Total a pagar:{' '}
                  <span className='text-xl font-bold'>{formatNumberToColombianPesos(total)}</span>
                </p>
              </div>
            </nav>
            <Form.List name='payment_methods'>
              {(fields, { add, remove }) => (
                <section className='flex flex-col gap-5'>
                  {fields.map((field, index) => (
                    <section key={field.key} className='flex w-full justify-center gap-3'>
                      <Form.Item
                        label='Método de pago'
                        style={{ width: '100%', margin: 0 }}
                        name={[index, 'name']}
                        rules={[{ required: true, message: 'El Método es un campo obligatorio' }]}
                      >
                        <Select
                          placeholder='Método de Pago'
                          options={paymentMethods}
                          onChange={() => form.validateFields()}
                        />
                      </Form.Item>
                      <Form.Item
                        label='Valor a pagar'
                        style={{ width: '100%', margin: 0 }}
                        name={[index, 'paid_amount']}
                        rules={[{ required: true, message: 'Cantidad requerida' }]}
                      >
                        <Input
                          placeholder='Valor a pagar'
                          type='text'
                          onChange={(e) => {
                            handleAmountChange(e.target.value, index, setPaidAmountValues)
                          }}
                        />
                      </Form.Item>
                      <Form.Item
                        shouldUpdate={(prevValues, currentValues) =>
                          prevValues.payment_methods !== currentValues.payment_methods
                        }
                        noStyle
                      >
                        {({ getFieldValue }) =>
                          getFieldValue(['payment_methods', field.name, 'name']) !== 'cash' ? (
                            <Form.Item
                              label='# Transacción'
                              style={{ width: '100%', margin: 0 }}
                              name={[index, 'transaction_code']}
                              rules={[{ required: true, message: 'Campo requerido' }]}
                            >
                              <Input
                                placeholder='Número de confirmación'
                                type='text'
                                // make disaable dynamic taking into account the payment method selected be diferente to cash and the value of the field
                                disabled={
                                  form.getFieldValue(['payment_methods', field.name, 'name']) ===
                                  'cash'
                                }
                              />
                            </Form.Item>
                          ) : null
                        }
                      </Form.Item>
                      <Form.Item
                        shouldUpdate={(prevValues, currentValues) =>
                          prevValues.payment_methods !== currentValues.payment_methods
                        }
                        noStyle
                      >
                        {({ getFieldValue }) =>
                          getFieldValue(['payment_methods', field.name, 'name']) === 'cash' ? (
                            <Form.Item
                              label='Valor recibido'
                              style={{ width: '100%', margin: 0 }}
                              name={[index, 'received_amount']}
                              rules={[{ required: true, message: 'Cantidad requerida' }]}
                            >
                              <Input
                                placeholder='Valor recibido'
                                type='number'
                                onChange={(e) =>
                                  handleAmountChange(e.target.value, index, setReceivedAmountValues)
                                }
                                disabled={
                                  form.getFieldValue(['payment_methods', field.name, 'name']) !==
                                  'cash'
                                }
                              />
                            </Form.Item>
                          ) : null
                        }
                      </Form.Item>
                      <div className='flex flex-col gap-3 mx-3'>
                        <p className='m-0'>Cambio</p>
                        <p className='m-0 text-red-500'>
                          {backAmountValues[index]
                            ? String(formatNumberToColombianPesos(backAmountValues[index]))
                            : formatNumberToColombianPesos(0)}
                        </p>
                      </div>
                      <MinusCircleOutlined
                        style={{ margin: 'auto' }}
                        onClick={() => {
                          remove(index)
                          handleDeleteAmount(index, setPaidAmountValues)
                          handleDeleteAmount(index, setReceivedAmountValues)
                        }}
                      />
                    </section>
                  ))}
                  {total - sumTotalPaymentMethods > 0 && (
                    <Form.Item>
                      <Button
                        type='dashed'
                        onClick={() => {
                          add()
                        }}
                        block
                        icon={<PlusOutlined />}
                      >
                        Agregar método de pago
                      </Button>
                    </Form.Item>
                  )}
                </section>
              )}
            </Form.List>
            <Form.Item className='mt-4'>
              <Button htmlType='submit' type='primary' block loading={loading}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}
    </Modal>
  )
}

export default SelectShopPurchaseForm
