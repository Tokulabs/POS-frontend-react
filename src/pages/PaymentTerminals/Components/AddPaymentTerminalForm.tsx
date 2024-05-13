import { Modal, Input, Switch, Button, Form } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { FC } from 'react'
import { DataPropsForm } from '../../../types/GlobalTypes'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postPaymentTerminals, putPaymentTerminals } from '../helpers/services'
import { IAddPaymentTerminals } from '../types/PaymentTerminalTypes'
import { toast } from 'sonner'

const AddPaymentTerminalForm: FC<IAddPaymentTerminals> = ({
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
    queryClient.invalidateQueries({ queryKey: ['paginatedPaymentTerminals'] })
    onSuccessCallback()
    toast.success(description)
    form.resetFields()
  }

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: postPaymentTerminals,
    onSuccess: () => {
      successRegistry('Datafono creado!')
    },
  })

  const { mutate: mutateEdit, isPending: isLoadingEdit } = useMutation({
    mutationFn: putPaymentTerminals,
    onSuccess: () => {
      successRegistry('Datafono actualizado!')
    },
  })

  const onSubmit = async (values: DataPropsForm) => {
    if (isLoading || isLoadingEdit) return
    isEdit ? mutateEdit({ values, id: initialData.id }) : mutate(values, {})
  }

  return (
    <Modal
      title='Crear usuario'
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
          label='Número único'
          name='account_code'
          rules={[{ required: true, message: 'El número único es un campo obligatorio' }]}
        >
          <Input placeholder='Número único' type='account_code' />
        </Form.Item>
        <Form.Item
          label='Nombre'
          name='name'
          rules={[{ required: true, message: 'El Nombre es un campo obligatorio' }]}
        >
          <Input placeholder='Nombre del datafono' type='text' />
        </Form.Item>
        <Form.Item
          label='Datafono inalmabrico?'
          style={{ margin: 0, marginBottom: 16 }}
          name='is_wireless'
          valuePropName='checked'
          required
        >
          <Switch checked={false} />
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

export default AddPaymentTerminalForm
