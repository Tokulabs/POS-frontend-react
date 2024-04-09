import { Form, Modal, Input, Button } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { FC } from 'react'
import { useCustomerData } from '../../../store/useCustomerStoreZustand'
import { DataPropsForm } from '../../../types/GlobalTypes'

export const AddCustomerModal: FC = () => {
  const [form] = useForm()

  const { customer, openModalAddCustomer, toggleModalAddCustomer, updateCustomerData } =
    useCustomerData()

  const onSubmit = (values: DataPropsForm) => {
    const customerToSend = values as typeof customer
    updateCustomerData(customerToSend)
    toggleModalAddCustomer(false)
  }

  return (
    <Modal
      title='Nuevo Cliente'
      open={openModalAddCustomer}
      onOk={() => toggleModalAddCustomer(false)}
      onCancel={() => {
        toggleModalAddCustomer(false)
        form.resetFields()
      }}
      footer={false}
      maskClosable={false}
      destroyOnClose={true}
    >
      <Form layout='vertical' onFinish={onSubmit} form={form} initialValues={customer}>
        <Form.Item
          style={{ width: '100%' }}
          label='Nombre Cliente'
          name='name'
          rules={[{ required: true, message: 'El Nombre es un campo obligatorio' }]}
        >
          <Input placeholder='Nombre del cliente' type='text' autoComplete='off' />
        </Form.Item>
        <Form.Item
          style={{ width: '100%' }}
          label='Documento de identidad'
          name='idNumber'
          rules={[{ required: true, message: 'El documento es un campo obligatorio' }]}
        >
          <Input placeholder='Documento de indentidad' type='text' autoComplete='off' />
        </Form.Item>
        <Form.Item
          style={{ width: '100%' }}
          label='Correo electrónico'
          name='email'
          rules={[{ required: true, message: 'El correo electrónico es obligatorio' }]}
        >
          <Input placeholder='Correo Electornico' type='email' autoComplete='off' />
        </Form.Item>
        <Form.Item
          style={{ width: '100%' }}
          label='Número de teléfono'
          name='phone'
          rules={[{ required: true, message: 'Número de teléfono es obligatorio' }]}
        >
          <Input placeholder='Número de telefono' type='number' min={1} autoComplete='off' />
        </Form.Item>
        <Form.Item
          style={{ width: '100%' }}
          label='Dirección/Ciudad'
          name='address'
          rules={[{ required: true, message: 'La dirección es obligatoria' }]}
        >
          <Input placeholder='Dirección/Ciudad' type='text' autoComplete='off' />
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
