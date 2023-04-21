import { Form, Modal, Input, Select, Button, notification } from 'antd'
import { FC } from 'react'
import { DataPropsForm } from '../../../types/GlobalTypes'
import { useForm } from 'antd/es/form/Form'
import { IModalFormProps } from '../../../types/ModalTypes'
import { UserRolesEnum } from '../types/UserTypes'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postUsersNew } from '../helpers/services'

const AddUserForm: FC<IModalFormProps> = ({
  isVisible = false,
  onSuccessCallback,
  onCancelCallback,
}) => {
  const [form] = useForm()
  const queryClient = useQueryClient()

  const { mutate, isLoading } = useMutation({
    mutationFn: postUsersNew,
    onSuccess: () => {
      queryClient.invalidateQueries(['paginatedUsers'])
      onSuccessCallback()
      notification.success({
        message: 'Exito',
        description: 'Usuario creado!',
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
      title='Crear usuario'
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
          label='Email'
          name='email'
          rules={[{ required: true, message: 'El correo es un campo obligatorio' }]}
        >
          <Input placeholder='Email' type='email' />
        </Form.Item>
        <Form.Item
          label='Nombre'
          name='fullname'
          rules={[{ required: true, message: 'El Nombre es un campo obligatorio' }]}
        >
          <Input placeholder='Nombre de usuario' type='text' />
        </Form.Item>
        <Form.Item
          label='Rol'
          name='role'
          rules={[{ required: true, message: 'El Rol es un campo obligatorio' }]}
        >
          <Select
            placeholder='Rol de usuario'
            options={[
              { value: 'posAdmin', label: UserRolesEnum.posAdmin },
              { value: 'shopAdmin', label: UserRolesEnum.shopAdmin },
              { value: 'sales', label: UserRolesEnum.sales },
              { value: 'supportSales', label: UserRolesEnum.supportSales },
            ]}
          />
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

export default AddUserForm
