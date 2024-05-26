import { Form, Modal, Input, Select, Button } from 'antd'
import { ChangeEvent, FC, useRef, useState } from 'react'
import { DataPropsForm } from '../../../types/GlobalTypes'
import { useForm } from 'antd/es/form/Form'
import { IconPhoto, IconPlus } from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  postImageToCloudinary,
  postInventoriesNew,
  putInventoriesEdit,
} from '../../Inventories/helpers/services'
import { IAddInventoryFormProps } from '../../Inventories/types/InventoryTypes'
import { toast } from 'sonner'

const AddInventoryForm: FC<IAddInventoryFormProps> = ({
  isVisible = false,
  onSuccessCallback,
  onCancelCallback,
  groups,
  initialData,
  providers,
}) => {
  const [form] = useForm()
  const [imageUrl, setImageurl] = useState<string | null>(initialData.photo ?? '')
  const [isLoadingImage, setLoadingImage] = useState(false)
  const fileSelect = useRef<HTMLInputElement>(null)

  const initialValues = {
    ...initialData,
    group_id: initialData.group?.id ?? '',
    provider_id: initialData.provider?.id ?? '',
    cost_center: initialData.cost_center ?? '',
  }

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

  const onSubmit = async (values: DataPropsForm) => {
    if (imageUrl) {
      values = { ...values, photo: imageUrl }
    }
    if (isLoading || isLoadingEdit) return
    isEdit ? mutateEdit({ values, id: initialData.id }) : mutate(values, {})
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
      </Form>
    </Modal>
  )
}

export default AddInventoryForm
