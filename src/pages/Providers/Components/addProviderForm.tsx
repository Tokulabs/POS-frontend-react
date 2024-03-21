import { Modal, Input, Button, notification, Form } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { FC } from 'react'
import { DataPropsForm } from '../../../types/GlobalTypes'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postProviders, putProviders } from '../helpers/services'
import { IAddProvider } from '../types/ProviderTypes'

const AddProviderForm: FC<IAddProvider> = ({
  isVisible = false,
  onSuccessCallback,
  onCancelCallback,
  initialData,
}) => {
  const [form] = useForm()
  const queryClient = useQueryClient()

  const initialValues = {
    ...initialData,
  }

  const isEdit = !!initialData.id

  const successRegistry = (message: string, description: string) => {
    queryClient.invalidateQueries(['paginatedProviders'])
    onSuccessCallback()
    notification.success({
      message: message,
      description: description,
    })
    form.resetFields()
  }

  const { mutate, isLoading } = useMutation({
    mutationFn: postProviders,
    onSuccess: () => {
      successRegistry('Exito', 'Proveedor creado!')
    },
  })

  const { mutate: mutateEdit, isLoading: isLoadingEdit } = useMutation({
    mutationFn: putProviders,
    onSuccess: () => {
      successRegistry('Exito', 'Proveedor actualizado!')
    },
  })

  const onSubmit = async (values: DataPropsForm) => {
    if (isLoading || isLoadingEdit) return
    isEdit ? mutateEdit({ values, id: initialData.id }) : mutate(values, {})
  }

  return (
    <Modal
      title='Crear Proveedor'
      open={isVisible}
      onOk={() => onSuccessCallback}
      onCancel={() => {
        onCancelCallback()
        form.resetFields()
      }}
      footer={false}
      maskClosable={false}
    >
      <Form layout='vertical' onFinish={onSubmit} form={form} initialValues={initialValues}>
        <Form.Item
          label='Nombre'
          name='name'
          rules={[{ required: true, message: 'El Nombre es un campo obligatorio' }]}
        >
          <Input placeholder='Nombre del proveedor' type='text' />
        </Form.Item>
        <Form.Item
          label='Razon social'
          name='legal_name'
          rules={[{ required: true, message: 'La Razón es un campo obligatorio' }]}
        >
          <Input placeholder='Razón Social' type='text' />
        </Form.Item>
        <Form.Item
          label='NIT'
          name='nit'
          rules={[{ required: true, message: 'El NIT es un campo obligatorio' }]}
        >
          <Input placeholder='NIT del proveedor' type='text' />
        </Form.Item>
        <Form.Item>
          <Button
            htmlType='submit'
            type='primary'
            block
            loading={isEdit ? isLoading : isLoadingEdit}
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddProviderForm
