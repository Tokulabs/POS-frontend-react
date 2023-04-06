import { Form, Modal, Select, Button, Input } from 'antd'
import { FC, useState } from 'react'
import { DataPropsForm } from '../../../types/GlobalTypes'
import { useForm } from 'antd/es/form/Form'
import { ISelectShopPurchase } from '../types/PurchaseTypes'

const SelectShopPurchaseForm: FC<ISelectShopPurchase> = ({
  isVisible = false,
  onSuccessCallback,
  onCancelCallback,
  shops,
}) => {
  const [form] = useForm()
  const [loading] = useState(false)
  const initialValues = {
    shop_id: '',
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
