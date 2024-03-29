import { Form, Modal, Input, Select, Button, notification } from 'antd'
import { FC } from 'react'
import { DataPropsForm } from '../../../types/GlobalTypes'
import { useForm } from 'antd/es/form/Form'
import { useGroups } from '../../../hooks/useGroups'
import { IModalFormProps } from '../../../types/ModalTypes'
import { IGroupsProps } from '../types/GroupTypes'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postGroupsNew } from '../helpers/services'

const AddGroupForm: FC<IModalFormProps> = ({
  isVisible = false,
  onSuccessCallback,
  onCancelCallback,
}) => {
  const [form] = useForm()
  const initialValues = {
    name: '',
  }
  const { groupsData } = useGroups('allGroups', {})

  const allGroupsData = groupsData?.results ?? []

  const queryClient = useQueryClient()

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: postGroupsNew,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paginatedGroups'] })
      onSuccessCallback()
      notification.success({
        message: 'Exito',
        description: 'Grupo creado!',
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
              ...allGroupsData.map((item: IGroupsProps) => ({
                value: item.id,
                label: item.name,
              })),
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

export default AddGroupForm
