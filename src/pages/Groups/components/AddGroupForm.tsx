import { Form, Modal, Input, Select, Button, notification } from 'antd'
import { FC, useState } from 'react'
import { DataPropsForm } from '../../../types/GlobalTypes'
import { groupURL } from '../../../utils/network'
import { useForm } from 'antd/es/form/Form'
import { axiosRequest } from '../../../api/api'
import { IAddGroupFormProps } from '../types/GroupTypes'

const AddGroupForm: FC<IAddGroupFormProps> = ({
  isVisible = false,
  onSuccessCallback,
  onCancelCallback,
  groups,
}) => {
  const [form] = useForm()
  const [loading, setLoading] = useState(false)
  const initialValues = {
    name: '',
  }

  const onSubmit = async (values: DataPropsForm) => {
    try {
      console.log(values)
      setLoading(true)
      const response = await axiosRequest({
        method: 'post',
        url: groupURL,
        hasAuth: true,
        payload: values,
      })
      if (response) {
        onSuccessCallback()
        notification.success({
          message: 'Exito',
          description: 'Categoria creada!',
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
      title='Crear Categoria'
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
          label='Nueva categoria'
          name='name'
          rules={[{ required: true, message: 'El Nombre es un campo obligatorio' }]}
        >
          <Input placeholder='Nombre de la categoria' type='text' />
        </Form.Item>
        <Form.Item label='Categoria Padre' name='belongs_to_id'>
          <Select
            placeholder='Selecciona una categoria'
            options={[
              ...groups.map((item) => ({
                value: item.id,
                label: item.name,
              })),
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

export default AddGroupForm
