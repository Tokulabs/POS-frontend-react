import { Form, Modal, Input, Button } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { IAddCustomerModal } from './types/AddCustomerModal'
import { FC } from 'react'
import { useCustomerData } from '../../../store/useCustomerStoreZustand'
import { DataPropsForm } from '../../../types/GlobalTypes'

export const AddCustomerModal: FC<IAddCustomerModal> = ({
  isVisible = false,
  onCancelCallback,
  onSuccessCallback,
}) => {
  const [form] = useForm()

  const { customer } = useCustomerData()

  const onSubmit = (values: DataPropsForm) => {
    console.log(values)
  }

  return (
    <Modal
      title='Nuevo Cliente'
      open={isVisible}
      onOk={() => onSuccessCallback}
      onCancel={() => {
        onCancelCallback
        form.resetFields()
      }}
      footer={false}
      maskClosable={false}
    >
      <Form layout='vertical' onFinish={onSubmit} form={form} initialValues={customer}>
        <Form.Item
          style={{ width: '100%' }}
          label='Nombre Cliente'
          name='name'
          rules={[{ required: true, message: 'El Nombre es un campo obligatorio' }]}
        >
          <Input placeholder='Nombre del cliente' type='text' />
        </Form.Item>
        <Form.Item
          style={{ width: '100%' }}
          label='Documento de identidad'
          name='id'
          rules={[{ required: true, message: 'El documento es un campo obligatorio' }]}
        >
          <Input placeholder='Documento de indentidad' type='text' />
        </Form.Item>
        <Form.Item
          style={{ width: '100%' }}
          label='Correo electrónico'
          name='email'
          rules={[{ required: true, message: 'El correo electrónico es obligatorio' }]}
        >
          <Input placeholder='Correo Electornico' type='email' min={1} />
        </Form.Item>
        <Form.Item
          style={{ width: '100%' }}
          label='Número de teléfono'
          name='phone'
          rules={[{ required: true, message: 'Número de teléfono es obligatorio' }]}
        >
          <Input placeholder='Número de telefono' type='number' min={1} />
        </Form.Item>
        <Form.Item
          style={{ width: '100%' }}
          label='Dirección/Ciudad'
          name='address'
          rules={[{ required: true, message: 'La dirección es obligatoria' }]}
        >
          <Input placeholder='Dirección/Ciudad' type='text' min={1} />
        </Form.Item>
        <Form.Item>
          <Button htmlType='submit' type='primary' block loading={false}>
            Agregar
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
