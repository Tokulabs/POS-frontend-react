import { FC, useMemo } from 'react'
// Third party
import { Form, Modal, Input, Button, notification } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useMutation } from '@tanstack/react-query'
// Store
import { useCustomerData } from '../../../store/useCustomerStoreZustand'
// Types
import { DataPropsForm } from '../../../types/GlobalTypes'
// Helpers
import { postCustomers, putCustomersEdit } from '../helpers/services'

export const AddCustomerModal: FC = () => {
  const [form] = useForm()

  const { customer, openModalAddCustomer, toggleModalAddCustomer, updateCustomerData, isEditUser } =
    useCustomerData()

  const intialValues = useMemo(() => {
    return { ...customer }
  }, [customer.id])

  const { mutate } = useMutation({
    mutationFn: putCustomersEdit,
    onSuccess: (data) => {
      if (!data) return
      updateCustomerData({
        ...data,
        id: data?.id as number,
        idNumber: data?.document_id,
      })
      notification.success({
        message: 'Exito',
        description: 'Cliente actualizado!',
      })
      form.resetFields()
    },
  })

  const { mutate: mutatePost } = useMutation({
    mutationFn: postCustomers,
    onSuccess: (data) => {
      if (!data) return
      updateCustomerData({
        ...data,
        id: data?.id as number,
        idNumber: data?.document_id,
      })
      notification.success({
        message: 'Exito',
        description: 'Cliente creado!',
      })
      form.resetFields()
    },
  })

  const onSubmit = (values: DataPropsForm) => {
    const customerToSend = values as typeof customer
    if (isEditUser) {
      mutate({
        values: { ...customerToSend, document_id: customerToSend.idNumber },
        id: customer.id as number,
      })
      toggleModalAddCustomer(false, false)
      return
    } else {
      mutatePost({
        ...customerToSend,
        document_id: customerToSend.idNumber,
      })
      toggleModalAddCustomer(false, false)
    }
  }

  return (
    <Modal
      title='Nuevo Cliente'
      open={openModalAddCustomer}
      onOk={() => toggleModalAddCustomer(false, false)}
      onCancel={() => {
        toggleModalAddCustomer(false, false)
        form.resetFields()
      }}
      footer={false}
      maskClosable={false}
      destroyOnClose={true}
    >
      <Form
        layout='vertical'
        onFinish={onSubmit}
        form={form}
        initialValues={
          !isEditUser ? { idNumber: '', name: '', email: '', phone: '', address: '' } : intialValues
        }
      >
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
