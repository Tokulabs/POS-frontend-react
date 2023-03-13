import { Form, Modal, Input, Select, Button, notification } from 'antd'
import { FC, useState } from 'react'
import { DataPropsForm } from '../../../types/GlobalTypes'
import { createUserURL } from './../../../utils/network'
import { useForm } from 'antd/es/form/Form'
import { axiosRequest } from '../../../api/api'
import { IModalFormProps } from '../../../types/ModalTypes'

const AddUserForm: FC<IModalFormProps> = ({
  isVisible = false,
  onSuccessCallback,
  onCancelCallback,
}) => {
  const [form] = useForm()
  const [loading, setLoading] = useState(false)

  const onSubmit = async (values: DataPropsForm) => {
    try {
      setLoading(true)
      const response = await axiosRequest({
        method: 'post',
        url: createUserURL,
        hasAuth: true,
        payload: values,
      })
      if (response) {
        onSuccessCallback()
        notification.success({
          message: 'Exito',
          description: 'Usuario creado!',
        })
        form.resetFields()
      }
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }
  return (
    <Modal
      title='Crear usuario'
      open={isVisible}
      onOk={onSuccessCallback}
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
              { value: 'admin', label: 'Administrador' },
              { value: 'creator', label: 'Creador' },
              { value: 'sale', label: 'Ventas' },
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

export default AddUserForm
