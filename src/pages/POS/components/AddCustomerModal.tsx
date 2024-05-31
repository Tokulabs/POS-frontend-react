import { FC, useMemo } from 'react'
// Third party
import { Form, Modal, Input, Button, Select } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
// Store
import { useCustomerData } from '../../../store/useCustomerStoreZustand'
// Types
import { DataPropsForm } from '../../../types/GlobalTypes'
// Helpers
import { postCustomers, putCustomersEdit } from '../helpers/services'
import { UserDocumentTypeEnum } from '../../Users/types/UserTypes'

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
        documentType: data?.document_type as UserDocumentTypeEnum,
      })
      toast.success('Cliente actualizado!')
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
        documentType: data?.document_type as UserDocumentTypeEnum,
      })
      toast.success('Cliente creado!')
      form.resetFields()
    },
  })

  const onSubmit = (values: DataPropsForm) => {
    const customerToSend = values as typeof customer
    if (isEditUser) {
      mutate({
        values: {
          name: customerToSend.name,
          email: customerToSend.email,
          document_id: customerToSend.idNumber,
          document_type: customerToSend.documentType,
          phone: customerToSend.phone?.length ? customerToSend.phone : null,
          address: customerToSend.address?.length ? customerToSend.address : null,
          city: customerToSend.city?.length ? customerToSend.city : null,
        },
        id: customer.id as number,
      })
      toggleModalAddCustomer(false, false)
      return
    } else {
      mutatePost({
        name: customerToSend.name,
        email: customerToSend.email,
        document_id: customerToSend.idNumber,
        document_type: customerToSend.documentType,
        phone: customerToSend.phone?.length ? customerToSend.phone : null,
        address: customerToSend.address?.length ? customerToSend.address : null,
        city: customerToSend.city?.length ? customerToSend.city : null,
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
        <div className='w-full flex items-start gap-2'>
          <Form.Item
            style={{ width: '20%' }}
            label='Tipo'
            name='documentType'
            rules={[{ required: true, message: 'Campo obligatorio' }]}
          >
            <Select
              dropdownStyle={{ width: 'auto' }}
              placeholder='Tipo'
              optionLabelProp='value'
              options={[
                { value: 'CC', label: UserDocumentTypeEnum.CC },
                { value: 'CE', label: UserDocumentTypeEnum.CE },
                { value: 'NIT', label: UserDocumentTypeEnum.NIT },
                { value: 'TI', label: UserDocumentTypeEnum.TI },
                { value: 'PA', label: UserDocumentTypeEnum.PA },
                { value: 'DIE', label: UserDocumentTypeEnum.DIE },
              ]}
            />
          </Form.Item>
          <Form.Item
            style={{ width: '100%' }}
            label='Número de identificación'
            name='idNumber'
            rules={[{ required: true, message: 'El documento es un campo obligatorio' }]}
          >
            <Input placeholder='Número de identificación' type='text' autoComplete='off' />
          </Form.Item>
        </div>
        <Form.Item
          style={{ width: '100%' }}
          label='Correo electrónico'
          name='email'
          rules={[{ required: true, message: 'El correo electrónico es obligatorio' }]}
        >
          <Input placeholder='Correo Electornico' type='email' autoComplete='off' />
        </Form.Item>
        <Form.Item style={{ width: '100%' }} label='Número de teléfono' name='phone'>
          <Input placeholder='Número de telefono' type='number' min={1} autoComplete='off' />
        </Form.Item>
        <Form.Item style={{ width: '100%' }} label='Ciudad' name='city'>
          <Input placeholder='Ciudad' type='text' autoComplete='off' />
        </Form.Item>
        <Form.Item style={{ width: '100%' }} label='Dirección' name='address'>
          <Input placeholder='Dirección' type='text' autoComplete='off' />
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
