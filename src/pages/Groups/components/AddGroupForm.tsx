import { Form, Modal, Input, Select, Button } from 'antd'
import { FC } from 'react'
import { DataPropsForm } from '@/types/GlobalTypes'
import { useForm } from 'antd/es/form/Form'
import { useGroups } from '@/hooks/useGroups'
import { IAddGroups, IGroupsProps } from '../types/GroupTypes'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postGroupsNew, putGroupsNew } from '../helpers/services'
import { toast } from 'sonner'

const AddGroupForm: FC<IAddGroups> = ({
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

  const { groupsData: allGroupsData } = useGroups('allGroups', {
    active: 'True',
  })

  const successRegistry = (description: string) => {
    queryClient.invalidateQueries({ queryKey: ['paginatedGroups'] })
    onSuccessCallback()
    toast.success(description)
    form.resetFields()
  }

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: postGroupsNew,
    onSuccess: () => {
      successRegistry('Categoria creada!')
    },
  })

  const { mutate: mutateEdit, isPending: isLoadingEdit } = useMutation({
    mutationFn: putGroupsNew,
    onSuccess: () => {
      successRegistry('Categoria actualizada!')
    },
  })

  const onSubmit = async (values: DataPropsForm) => {
    if (isLoading || isLoadingEdit) return
    isEdit ? mutateEdit({ values, id: initialData.id }) : mutate(values, {})
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
            listHeight={200}
            showSearch
            optionFilterProp='children'
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            filterSort={(optionA, optionB) =>
              (optionA?.label ?? '')
                .toLowerCase()
                .localeCompare((optionB?.label ?? '').toLowerCase())
            }
            options={allGroupsData?.results
              .filter((e: IGroupsProps) => (isEdit ? e.name !== initialData.name : e))
              .map((item: IGroupsProps) => ({
                value: item.id,
                label: item.name,
              }))}
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
