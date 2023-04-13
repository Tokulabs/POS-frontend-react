import { Form, Modal, Select, Button, Input } from 'antd'
import { FC, useState } from 'react'
import { DataPropsForm } from '../../../types/GlobalTypes'
import { useForm } from 'antd/es/form/Form'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { ISelectShopPurchase, PaymentMethodsEnum } from '../types/PurchaseTypes'

const SelectShopPurchaseForm: FC<ISelectShopPurchase> = ({
  isVisible = false,
  onSuccessCallback,
  onCancelCallback,
  shops,
  total,
}) => {
  const [form] = useForm()
  const [loading] = useState(false)
  const initialValues = {
    shop_id: '',
    customer_name: '',
    customer_id: '',
    payment_methods: [{ name: 'cash', amount: total, transaction_code: '' }],
  }

  const onSubmit = async (values: DataPropsForm) => {
    form.resetFields()
    onSuccessCallback(values)
  }
  return (
    <Modal
      title='Selecciona Tienda'
      open={isVisible}
      onCancel={() => {
        onCancelCallback()
        form.resetFields()
      }}
      footer={false}
      maskClosable={false}
    >
      <Form layout='vertical' onFinish={onSubmit} form={form} initialValues={initialValues}>
        <Form.Item
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
        <Form.Item label='Nombre del cliente' name='customer_name'>
          <Input placeholder='Nombre del cliente' type='text' />
        </Form.Item>
        <Form.Item label='Identificación del cliente' name='customer_id'>
          <Input placeholder='Identificación del cliente' type='text' />
        </Form.Item>
        <h3>Metodos de pago</h3>
        <Form.List name='payment_methods'>
          {(fields, { add, remove }) => (
            <section className='flex flex-col gap-5'>
              {fields.map(({ key, name, ...restField }) => (
                <section key={key} className='flex w-full justify-center items-center gap-3'>
                  <Form.Item
                    style={{ width: '100%', margin: 0 }}
                    {...restField}
                    name={[name, 'name']}
                    rules={[{ required: true, message: 'El Método es un campo obligatorio' }]}
                  >
                    <Select
                      placeholder='Método de Pago'
                      options={[
                        { value: 'cash', label: PaymentMethodsEnum.cash },
                        { value: 'creditCard', label: PaymentMethodsEnum.creditCard },
                        { value: 'debitCard', label: PaymentMethodsEnum.debitCard },
                        { value: 'nequi', label: PaymentMethodsEnum.nequi },
                        { value: 'bankTransfer', label: PaymentMethodsEnum.bankTransfer },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item
                    style={{ width: '100%', margin: 0 }}
                    {...restField}
                    name={[name, 'amount']}
                    rules={[{ required: true, message: 'Cantidad requerida' }]}
                  >
                    <Input placeholder='Cantidad' type='number' />
                  </Form.Item>
                  <Form.Item
                    style={{ width: '100%', margin: 0 }}
                    {...restField}
                    name={[name, 'transaction_code']}
                  >
                    <Input placeholder='Número de confirmación' type='text' />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </section>
              ))}
              <Form.Item>
                <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                  Agregar método de pago
                </Button>
              </Form.Item>
            </section>
          )}
        </Form.List>
        <Form.Item>
          <Button htmlType='submit' type='primary' block loading={loading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default SelectShopPurchaseForm
