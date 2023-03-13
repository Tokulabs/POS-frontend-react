import { Form, Modal, Select, Button } from 'antd'
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
  const [loading, setLoading] = useState(false)

  const onSubmit = async (values: DataPropsForm) => {
    form.resetFields()
    onSuccessCallback(values.shop_id as number)
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
      <Form layout='vertical' onFinish={onSubmit} form={form}>
        <Form.Item label='Tienda' name='shop_id'>
          <Select
            defaultValue=''
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
