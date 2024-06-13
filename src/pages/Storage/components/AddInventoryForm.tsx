import { Form, Modal, Input, Select, Button, Spin } from 'antd'
import { FC, useState } from 'react'
import { DataPropsForm } from '../../../types/GlobalTypes'
import { useForm } from 'antd/es/form/Form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  awsPostImagetoS3,
  postInventoriesNew,
  putInventoriesEdit,
} from '../../Inventories/helpers/services'
import { IAddInventoryFormProps, ImageUploadAWSProps } from '../../Inventories/types/InventoryTypes'
import { toast } from 'sonner'
import { ImageUpload } from '../../../components/ImageUpload/ImageUpload'

const AddInventoryForm: FC<IAddInventoryFormProps> = ({
  isVisible = false,
  onSuccessCallback,
  onCancelCallback,
  groups,
  initialData,
  providers,
}) => {
  const initialValues = {
    ...initialData,
    group_id: initialData.group?.id ?? '',
    provider_id: initialData.provider?.id ?? '',
    cost_center: initialData.cost_center ?? '',
  }

  const [form] = useForm()
  const [formDataImage, setFormDataImage] = useState<FormData>(new FormData())
  const [awsData, setAwsData] = useState<ImageUploadAWSProps | null>(null)
  const [imageURL, setImageURL] = useState(initialData.photo)

  const isEdit = !!initialData.id

  const queryClient = useQueryClient()

  const successRegistry = (description: string) => {
    queryClient.invalidateQueries({ queryKey: ['paginatedInventories'] })
    onSuccessCallback()
    toast.success(description)
    form.resetFields()
  }

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: postInventoriesNew,
    onSuccess: () => {
      successRegistry('Producto creado!')
    },
  })

  const { mutate: mutateEdit, isPending: isLoadingEdit } = useMutation({
    mutationFn: putInventoriesEdit,
    onSuccess: () => {
      successRegistry('Producto actualizado!')
    },
  })

  const { mutateAsync: mutateUploadImagetoS3, isPending: isLoadingImageToS3 } = useMutation({
    mutationFn: awsPostImagetoS3,
    onSuccess: () => {
      toast.success('Imagen subida con éxito')
    },
  })

  const handleImageChange = async (awsData: ImageUploadAWSProps | null, formData: FormData) => {
    setImageURL(awsData?.final_url ?? '')
    setAwsData(awsData)
    setFormDataImage(formData)
  }

  const onSubmit = async (values: DataPropsForm) => {
    if (awsData) {
      const { AWSAccessKeyId, key, policy, signature } = awsData.endpoint_data.fields
      const sentFormData = new FormData()
      sentFormData.append('Content-Type', awsData.endpoint_data.fields['Content-Type'])
      sentFormData.append('key', key)
      sentFormData.append('AWSAccessKeyId', AWSAccessKeyId)
      sentFormData.append('policy', policy)
      sentFormData.append('signature', signature)
      sentFormData.append('file', formDataImage.get('file') as Blob)

      await mutateUploadImagetoS3({
        formData: sentFormData,
        url: awsData.endpoint_data.url,
      })
      if (awsData.final_url && !isLoadingImageToS3) {
        values = { ...values, photo: awsData.final_url }
      }
    }
    if (awsData === null && !imageURL) {
      values = { ...values, photo: '' }
    } else {
      values = { ...values, photo: imageURL }
    }
    if ((isLoading || isLoadingEdit) && isLoadingImageToS3) return
    isEdit ? mutateEdit({ values, id: initialData.id }) : mutate(values, {})
  }

  return (
    <Modal
      title='Nuevos items'
      open={isVisible}
      onOk={() => onSuccessCallback}
      onCancel={() => {
        onCancelCallback()
        form.resetFields()
        setAwsData(null)
        setFormDataImage(new FormData())
      }}
      footer={false}
      maskClosable={false}
    >
      <Form layout='vertical' onFinish={onSubmit} form={form} initialValues={initialValues}>
        {isLoadingImageToS3 ? (
          <div className='flex justify-center'>
            <Spin size='large' />
          </div>
        ) : (
          <>
            <Form.Item name=''>
              <ImageUpload onImageChange={handleImageChange} imageURL={imageURL} />
            </Form.Item>
            <div className='flex w-full gap-2'>
              <Form.Item
                style={{ width: '100%' }}
                label='Código'
                name='code'
                rules={[{ required: true, message: 'El Código es un campo obligatorio' }]}
              >
                <Input placeholder='Código del producto' type='text' />
              </Form.Item>
              <Form.Item
                style={{ width: '100%' }}
                label='Nombre Producto'
                name='name'
                rules={[{ required: true, message: 'El Nombre es un campo obligatorio' }]}
              >
                <Input placeholder='Nombre del producto' type='text' />
              </Form.Item>
            </div>
            <div className='flex gap-2 w-full'>
              <Form.Item
                style={{ width: '100%' }}
                label='Cantidad En bodéga'
                name='total_in_storage'
                rules={[{ required: true, message: 'La cantidad es un campo obligatorio' }]}
              >
                <Input placeholder='Cantidad' type='number' min={0} />
              </Form.Item>
              <Form.Item
                style={{ width: '100%' }}
                label='Cantidad En Tiendas'
                name='total_in_shops'
                rules={[{ required: true, message: 'La cantidad es un campo obligatorio' }]}
              >
                <Input placeholder='Cantidad' type='number' min={0} />
              </Form.Item>
            </div>
            <div className='flex gap-2 w-full'>
              <Form.Item
                style={{ width: '100%' }}
                label='Precio de compra (COP)'
                name='buying_price'
                rules={[{ required: true, message: 'El precio de compra es un campo obligatorio' }]}
              >
                <Input placeholder='Precio USD' type='number' min={1} />
              </Form.Item>
              <Form.Item
                style={{ width: '100%' }}
                label='Precio de venta (COP)'
                name='selling_price'
                rules={[{ required: true, message: 'El precio unitario es un campo obligatorio' }]}
              >
                <Input placeholder='Precio COP' type='number' min={1} />
              </Form.Item>
            </div>
            <div className='flex gap-2 w-full'>
              <Form.Item
                style={{ width: '100%' }}
                label='Precio (USD)'
                name='usd_price'
                rules={[{ required: true, message: 'El precio en USD es un campo obligatorio' }]}
              >
                <Input placeholder='Precio USD' type='number' min={1} />
              </Form.Item>
              <Form.Item
                style={{ width: '100%' }}
                label='Categoria'
                name='group_id'
                rules={[{ required: true, message: 'La categoria es requerida' }]}
              >
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
                  options={[
                    {
                      value: '',
                      label: 'Selecciona una categoria',
                    },
                    ...groups.map((item) => ({
                      value: item.id,
                      label: item.name,
                    })),
                  ]}
                />
              </Form.Item>
            </div>
            <div className='flex gap-2 w-full'>
              <Form.Item
                style={{ width: '100%' }}
                label='Proveedor'
                name='provider_id'
                rules={[{ required: true, message: 'El proveedor es requerido' }]}
              >
                <Select
                  placeholder='Selecciona un proveedor'
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
                  options={[
                    {
                      value: '',
                      label: 'Selecciona un proveedor',
                    },
                    ...providers.map((item) => ({
                      value: item.id,
                      label: item.legal_name,
                    })),
                  ]}
                />
              </Form.Item>
              <Form.Item
                style={{ width: '100%' }}
                label='Cento de Costos'
                name='cost_center'
                rules={[{ required: true, message: 'El centro de costos es requerido' }]}
              >
                <Select
                  placeholder='Selecciona un Centro de Costos'
                  listHeight={200}
                  options={[
                    {
                      value: '',
                      label: 'Selecciona un centro de costos',
                    },
                    {
                      value: 'Guasá',
                      label: 'Guasá',
                    },
                    {
                      value: 'CHOCOLATE',
                      label: 'CHOCOLATE',
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
          </>
        )}
      </Form>
    </Modal>
  )
}

export default AddInventoryForm
