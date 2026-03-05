import { Form, Modal, Input, Select, Button, Skeleton } from 'antd'
import { FC } from 'react'
import { DataPropsForm } from '@/types/GlobalTypes'
import { useForm } from 'antd/es/form/Form'
import { IAddUser, UserDocumentTypeEnum } from '../types/UserTypes'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postUsersNew, putUsers } from '../helpers/services'
import { toast } from 'sonner'
import { useCompanyRoles } from '@/hooks/useCompanyRoles'

const AddUserForm: FC<IAddUser> = ({
  isVisible = false,
  onSuccessCallback,
  onCancelCallback,
  initialData,
}) => {
  const [form] = useForm()
  const queryClient = useQueryClient()
  const { companyRoles, isPending: loadingRoles } = useCompanyRoles()

  // Filter out the Owner role — it's auto-assigned to superusers only
  const assignableRoles = (companyRoles ?? []).filter((r) => !r.is_owner)

  const initialValues = {
    ...initialData,
    company_role_id: initialData.company_role?.id ?? null,
  }

  const isEdit = !!initialData.id

  const successRegistry = (description: string) => {
    queryClient.invalidateQueries({ queryKey: ['paginatedUsers'] })
    onSuccessCallback()
    toast.success(description)
    form.resetFields()
  }

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: postUsersNew,
    onSuccess: () => {
      successRegistry('Usuario creado!')
    },
  })

  const { mutate: mutateEdit, isPending: isLoadingEdit } = useMutation({
    mutationFn: putUsers,
    onSuccess: () => {
      successRegistry('Usuario actualizado!')
    },
  })

  const onSubmit = async (values: DataPropsForm) => {
    if (isLoading || isLoadingEdit) return
    isEdit ? mutateEdit({ values, id: initialData.id }) : mutate(values, {})
  }

  return (
    <Modal
      title={isEdit ? 'Editar usuario' : 'Crear usuario'}
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
          label='Email'
          name='email'
          rules={[{ required: true, message: 'El correo es un campo obligatorio' }]}
        >
          <Input placeholder='Email' type='email' />
        </Form.Item>
        <div className='w-full flex items-start gap-2'>
          <Form.Item
            style={{ width: '20%' }}
            label='Tipo'
            name='document_type'
            rules={[{ required: true, message: 'Campo obligatorio' }]}
          >
            <Select
              dropdownStyle={{ width: 'auto' }}
              placeholder='Tipo'
              optionLabelProp='value'
              options={[
                { value: 'CC', label: UserDocumentTypeEnum.CC },
                { value: 'CE', label: UserDocumentTypeEnum.CE },
                { value: 'NIT', label: UserDocumentTypeEnum.NIT },
                { value: 'TI', label: UserDocumentTypeEnum.TI },
                { value: 'PA', label: UserDocumentTypeEnum.PA },
              ]}
            />
          </Form.Item>
          <Form.Item
            style={{ width: '80%' }}
            label='Identificación'
            name='document_id'
            rules={[{ required: true, message: 'Campo obligatorio' }]}
          >
            <Input placeholder='Documento de Identidad' type='number' />
          </Form.Item>
        </div>
        <Form.Item
          label='Nombre'
          name='fullname'
          rules={[{ required: true, message: 'El Nombre es un campo obligatorio' }]}
        >
          <Input placeholder='Nombre de usuario' type='text' />
        </Form.Item>
        <Form.Item
          label='Meta Diaria'
          name='daily_goal'
          rules={[{ required: true, message: 'La meta diaria es un campo obligatorio' }]}
        >
          <Input placeholder='Meta Diaria' type='number' />
        </Form.Item>
        <Form.Item
          label='Rol'
          name='company_role_id'
          rules={[{ required: true, message: 'El Rol es un campo obligatorio' }]}
        >
          {loadingRoles ? (
            <Skeleton.Input active block />
          ) : (
            <Select
              placeholder='Selecciona un rol'
              options={assignableRoles.map((role) => ({
                value: role.id,
                label: role.name,
              }))}
            />
          )}
        </Form.Item>
        <Form.Item>
          <Button htmlType='submit' type='primary' block loading={isLoading || isLoadingEdit}>
            {isEdit ? 'Guardar cambios' : 'Crear Usuario'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddUserForm
