import { Modal, Input, Button, Form, Select } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { FC } from 'react'
import { DataPropsForm } from '@/types/GlobalTypes'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postProviders, putProviders } from '../helpers/services'
import { IAddProvider } from '../types/ProviderTypes'
import { toast } from 'sonner'

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

  const successRegistry = (description: string) => {
    queryClient.invalidateQueries({ queryKey: ['paginatedProviders'] })
    onSuccessCallback()
    toast.success(description)
    form.resetFields()
  }

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: postProviders,
    onSuccess: () => {
      successRegistry('Proveedor creado!')
    },
  })

  const { mutate: mutateEdit, isPending: isLoadingEdit } = useMutation({
    mutationFn: putProviders,
    onSuccess: () => {
      successRegistry('Proveedor actualizado!')
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
        <div className='w-full flex justify-between gap-4'>
          <Form.Item
            style={{ width: '100%' }}
            label='Nombre'
            name='name'
            rules={[{ required: true, message: 'Campo obligatorio' }]}
          >
            <Input placeholder='Nombre del proveedor' type='text' />
          </Form.Item>
          <Form.Item
            style={{ width: '100%' }}
            label='Razon social'
            name='legal_name'
            rules={[{ required: true, message: 'Campo obligatorio' }]}
          >
            <Input placeholder='Razón Social' type='text' />
          </Form.Item>
        </div>
        <div className='w-full flex justify-between gap-4'>
          <Form.Item
            style={{ width: '100%' }}
            label='NIT'
            name='nit'
            rules={[{ required: true, message: 'Campo obligatorio' }]}
          >
            <Input placeholder='NIT del proveedor' type='text' />
          </Form.Item>
          <Form.Item style={{ width: '100%' }} label='Teléfono' name='phone'>
            <Input placeholder='Teléfono del proveedor' type='number' />
          </Form.Item>
        </div>
        <Form.Item
          style={{ width: '100%' }}
          label='Correo electrónico'
          name='email'
          rules={[{ required: true, message: 'Campo requerido' }]}
        >
          <Input placeholder='Correo electrónico del proveedor' type='email' />
        </Form.Item>
        <div className='w-full flex justify-between gap-4'>
          <Form.Item
            style={{ width: '100%' }}
            label='Cuenta bancaria'
            name='bank_account'
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <Input placeholder='Cuenta bancaria del proveedor' type='text' />
          </Form.Item>
          <Form.Item
            style={{ width: '100%' }}
            label='Tipo de cuenta'
            name='account_type'
            rules={[{ required: true, message: 'Campo requerido' }]}
          >
            <Select
              placeholder='Selecciona Tipo de cuenta'
              options={[
                {
                  value: '',
                  label: 'Selecciona un tipo de cuenta',
                },
                {
                  value: 'Ahorros',
                  label: 'Ahorros',
                },
                {
                  value: 'Corriente',
                  label: 'Corriente',
                },
              ]}
            />
          </Form.Item>
        </div>
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
