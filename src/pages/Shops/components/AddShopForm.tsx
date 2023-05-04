import { Form, Modal, Input, Button, notification } from 'antd'
import { FC } from 'react'
import { DataPropsForm } from '../../../types/GlobalTypes'
import { useForm } from 'antd/es/form/Form'
import { IModalFormProps } from '../../../types/ModalTypes'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { postShopsNew } from '../helpers/services'

const AddShopsForm: FC<IModalFormProps> = ({
  isVisible = false,
  onSuccessCallback,
  onCancelCallback,
}) => {
  const [form] = useForm()
  const queryClient = useQueryClient()

  const { mutate, isLoading } = useMutation({
    mutationFn: postShopsNew,
    onSuccess: () => {
      queryClient.invalidateQueries(['paginatedShops'])
      onSuccessCallback()
      notification.success({
        message: 'Exito',
        description: 'Tienda creada!',
      })
      form.resetFields()
    },
  })

  const onSubmit = async (values: DataPropsForm) => {
    if (isLoading) return
    mutate(values)
  }

  return (
    <Modal
      title='Crear punto de venta'
      open={isVisible}
      onOk={() => onSuccessCallback}
      onCancel={() => {
        onCancelCallback()
        form.resetFields()
      }}
      footer={false}
    >
      <Form layout='vertical' onFinish={onSubmit} form={form}>
        <Form.Item
          label='Nombre del punto de venta'
          name='name'
          rules={[{ required: true, message: 'El nombre es requerido' }]}
        >
          <Input placeholder='Punto sur' type='name' />
        </Form.Item>
        <Form.Item>
          <Button htmlType='submit' type='primary' block loading={isLoading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export { AddShopsForm }
