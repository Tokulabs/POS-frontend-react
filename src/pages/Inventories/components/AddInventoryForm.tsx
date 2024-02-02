import { Form, Modal, Input, Select, Button, notification } from 'antd'
import { ChangeEvent, FC, useRef, useState } from 'react'
import { DataPropsForm } from '../../../types/GlobalTypes'
import { useForm } from 'antd/es/form/Form'
import { IconPhoto, IconPlus } from '@tabler/icons-react'
import { IAddInventoryFormProps } from '../types/InventoryTypes'
import { postImageToCloudinary, postInventoriesNew } from '../helpers/services'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const AddInventoryForm: FC<IAddInventoryFormProps> = ({
  isVisible = false,
  onSuccessCallback,
  onCancelCallback,
  groups,
}) => {
  const [form] = useForm()
  const [imageUrl, setImageurl] = useState<string | null>('')
  const [isLoadingImage, setLoadingImage] = useState(false)
  const fileSelect = useRef<HTMLInputElement>(null)

  const initialValues = {
    name: '',
    total: '',
    price: 0,
    usd_price: 0,
    group_id: '',
    code: '',
  }

  const queryClient = useQueryClient()

  const { mutate, isLoading } = useMutation({
    mutationFn: postInventoriesNew,
    onSuccess: () => {
      queryClient.invalidateQueries(['paginatedInventories'])
      onSuccessCallback()
      notification.success({
        message: 'Exito',
        description: 'Item creado!',
      })
      form.resetFields()
    },
  })

  const onSubmit = async (values: DataPropsForm) => {
    if (imageUrl) {
      values = { ...values, photo: imageUrl }
    }
    if (isLoading) return
    mutate(values)
    setImageurl(null)
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const formItem = new FormData()
      formItem.append('file', e.target.files[0])
      formItem.append('upload_preset', 'test_inventory_signos')
      formItem.append('tags', 'test_inventory_signos')

      try {
        setLoadingImage(true)
        const response = await postImageToCloudinary(formItem)
        if (response) {
          setImageurl(response.data.url)
        }
      } catch (e) {
        console.log(e)
      } finally {
        setLoadingImage(false)
      }
    }
  }

  return (
    <Modal
      title='Nuevos items'
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
        {isLoadingImage ? (
          <div className='flex w-full p-5 justify-center text-2xl font-semibold text-gray-2'>
            Cargando...
          </div>
        ) : (
          <Form.Item name=''>
            <div className='w-full flex justify-center text-white'>
              <div
                className={`w-24 h-24 rounded-full flex flex-col justify-center items-center cursor-pointer ${
                  imageUrl ? '' : 'bg-gray-1'
                }`}
                onClick={() => !isLoading && fileSelect.current?.click()}
              >
                {imageUrl ? (
                  <img
                    className='w-40 object-contain overflow-hidden hover:scale-150 transition-all transform-gpu'
                    src={imageUrl}
                  />
                ) : (
                  <div className='flex flex-col justify-center items-center'>
                    <IconPhoto />
                    <span className='flex justify-center items-center'>
                      <IconPlus size={15} />
                      Foto
                    </span>
                  </div>
                )}
              </div>
              <input
                type='file'
                style={{ display: 'none' }}
                ref={fileSelect}
                onChange={handleFileChange}
              />
            </div>
          </Form.Item>
        )}

        <Form.Item
          label='Código'
          name='code'
          rules={[{ required: true, message: 'El Código es un campo obligatorio' }]}
        >
          <Input placeholder='Código del producto' type='text' />
        </Form.Item>
        <Form.Item
          label='Nombre'
          name='name'
          rules={[{ required: true, message: 'El Nombre es un campo obligatorio' }]}
        >
          <Input placeholder='Nombre del producto' type='text' />
        </Form.Item>
        <Form.Item
          label='Cantidad Tienda'
          name='total_in_shops'
          rules={[{ required: true, message: 'La cantidad es un campo obligatorio' }]}
        >
          <Input placeholder='Cantidad Tienda' type='number' min={1} />
        </Form.Item>
        <Form.Item
          label='Cantidad Bodega'
          name='total_in_storage'
          rules={[{ required: true, message: 'La cantidad es un campo obligatorio' }]}
        >
          <Input placeholder='Cantidad Bodega' type='number' min={1} />
        </Form.Item>
        <Form.Item
          label='Precio (COP)'
          name='buying_price'
          rules={[{ required: true, message: 'El precio unitario es un campo obligatorio' }]}
        >
          <Input placeholder='Precio COP' type='number' min={1} />
        </Form.Item>
        <Form.Item
          label='Precio (USD)'
          name='usd_price'
          rules={[{ required: true, message: 'El precio en USD es un campo obligatorio' }]}
        >
          <Input placeholder='Precio USD' type='number' min={1} />
        </Form.Item>
        <Form.Item
          label='Categoria'
          name='group_id'
          rules={[{ required: true, message: 'La categoria es requerida' }]}
        >
          <Select
            placeholder='Selecciona una categoria'
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
        <Form.Item>
          <Button htmlType='submit' type='primary' block loading={isLoading}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddInventoryForm
