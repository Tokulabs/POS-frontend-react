import { Form, Modal, Input, Button, notification } from 'antd'
import { FC, useState } from 'react'
import { DataPropsForm } from '../../../types/AuthTypes'
import { shopURL } from '../../../utils/network'
import { useForm } from 'antd/es/form/Form'
import { axiosRequest } from '../../../api/api'
import { IModalFormProps } from '../../../types/ModalTypes'

const AddShopsForm: FC<IModalFormProps> = ({
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
        url: shopURL,
        hasAuth: true,
        payload: values,
      })
      if (response) {
        onSuccessCallback()
        notification.success({
          message: 'Exito',
          description: 'Tienda creada!',
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
          label='Nueva de la tienda'
          name='name'
          rules={[{ required: true, message: 'El nombre de la tienda es requerido' }]}
        >
          <Input placeholder='Nombre de la nueva tienda' type='name' />
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

export default AddShopsForm
