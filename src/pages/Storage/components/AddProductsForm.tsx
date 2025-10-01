import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { FC, useContext, useEffect, useState } from 'react'
import { IInventoryProps } from '@/pages/Inventories/types/InventoryTypes'
import { useAwsS3Upload } from '@/hooks/useAwsS3Upload'
import { store } from '@/store'
import { toast } from 'sonner'
import FileUploadPreview from '@/components/FileUploadPreview/FileUploadPreviewS3'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { DialogContainer } from '@/components/DialogContainer/DialogContainer'
import { OptionSelect, SearchInputSelect } from '@/components/FormComponents/SearchInputSelect'
import { IGroupsProps } from '@/pages/Groups/types/GroupTypes'
import { IProvider } from '@/pages/Providers/types/ProviderTypes'
import { Button } from '@/components/ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { postInventoriesNew, putInventoriesEdit } from '@/pages/Inventories/helpers/services'

interface AddProductsFormProps {
  triggerComponent?: React.ReactNode
  initialData: IInventoryProps
  groups: IGroupsProps[]
  providers: IProvider[]
}

const addProductsFormSchema = z.object({
  code: z.string().min(1, 'Campo requerido').max(10, 'Máximo 10 caracteres'),
  name: z.string().nonempty('Campo requerido').trim(),
  total_in_shops: z.coerce.number().gt(0, 'No puede ser negativo'),
  total_in_storage: z.coerce.number().gt(0, 'No puede ser negativo'),
  buying_price: z.coerce.number().gt(0, 'No puede ser negativo'),
  selling_price: z.coerce.number().gt(0, 'No puede ser negativo'),
  usd_price: z.coerce.number().gt(0, 'No puede ser negativo'),
  group_id: z.coerce.number().gt(0, 'Campo requerido'),
  provider_id: z.coerce.number().gt(0, 'Campo requerido'),
  cost_center: z.string().nonempty('Campo requerido'),
  photo: z.preprocess((val) => {
    if (val instanceof FileList) return undefined
    if (val === null) return ''
    return val
  }, z.string().optional()),
})

export type AddProductsFormValues = z.infer<typeof addProductsFormSchema>

const AddProductsForm: FC<AddProductsFormProps> = ({
  initialData,
  groups,
  providers,
  triggerComponent,
}) => {
  const [pendingFileUpload, setPendingFileUpload] = useState<File | null>(null)
  const [open, setOpen] = useState(false)

  const { state } = useContext(store)

  const isEdit = !!initialData.id

  const initialValues = {
    ...initialData,
    group_id: initialData.group?.id ?? 0,
    provider_id: initialData.provider?.id ?? 0,
  }
  const form = useForm<z.infer<typeof addProductsFormSchema>>({
    resolver: zodResolver(addProductsFormSchema),
    defaultValues: {
      code: initialValues.code || '',
      name: initialValues.name || '',
      total_in_shops: initialValues.total_in_shops || 0,
      total_in_storage: initialValues.total_in_storage || 0,
      buying_price: initialValues.buying_price || 0,
      selling_price: initialValues.selling_price || 0,
      usd_price: initialValues.usd_price || 0,
      group_id: initialValues.group_id || 0,
      provider_id: initialValues.provider_id || 0,
      cost_center: initialValues.cost_center || '',
      photo: initialValues.photo || '',
    },
  })

  const queryClient = useQueryClient()

  const successRegistry = (description: string) => {
    queryClient.invalidateQueries({ queryKey: ['paginatedInventories'] })
    setOpen(false)
    toast.success(description)
    form.reset()
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

  const { uploadFile, isUploading, resetUpload } = useAwsS3Upload({
    onSuccess: (imageUrl) => {
      form.setValue('photo', imageUrl)
      const currentFormData = form.getValues()
      handleProduct(currentFormData)
      setPendingFileUpload(null)
      resetUpload()
    },
    onError: (error) => {
      console.error('Upload failed:', error)
      setPendingFileUpload(null)
    },
    showToasts: false,
  })

  useEffect(() => {
    return () => {
      resetUpload()
    }
  }, [])

  const onSubmit = (data: AddProductsFormValues) => {
    if (pendingFileUpload) {
      const key = `company_id=${state.user?.company?.id}/products/${Date.now()}-${pendingFileUpload.name}`
      uploadFile(pendingFileUpload, key)
    } else {
      handleProduct(data)
    }
  }

  const handleProduct = (productData: AddProductsFormValues) => {
    isEdit ? mutateEdit({ values: productData, id: initialData.id }) : mutate(productData)
  }

  const handleFileSelect = (file: File | null) => {
    setPendingFileUpload(file)
  }

  return (
    <DialogContainer
      open={open}
      onOpenChange={(value) => setOpen(value)}
      title='Agregar producto'
      triggerComponent={triggerComponent}
      triggerTitle='Agregar producto'
      triggerClassName='border-[1px] w-full'
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col w-full gap-2'>
          <FileUploadPreview
            control={form.control}
            name='photo'
            label='Foto del producto'
            description='Selecciona una imagen'
            initialPreview={initialValues.photo || ''}
            onFileSelect={handleFileSelect}
            onError={(error) => {
              toast.error(error)
            }}
          />
          <div className='flex w-full gap-4'>
            <FormField
              control={form.control}
              name='code'
              render={({ field }) => (
                <FormItem className='w-1/2'>
                  <Label htmlFor='code'>
                    Código <span className='text-red-500'>*</span>
                  </Label>
                  <FormControl>
                    <Input id='code' placeholder='Código' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='w-1/2'>
                  <Label htmlFor='name'>
                    Nombre<span className='text-red-500'>*</span>
                  </Label>
                  <FormControl>
                    <Input id='name' placeholder='Nombre' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='flex w-full gap-4'>
            <FormField
              control={form.control}
              name='total_in_shops'
              render={({ field }) => (
                <FormItem className='w-1/2'>
                  <Label htmlFor='total_in_shops'>
                    Total en Tiendas <span className='text-red-500'>*</span>
                  </Label>
                  <FormControl>
                    <Input
                      id='total_in_shops'
                      type='number'
                      placeholder='Total en Tiendas'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='total_in_storage'
              render={({ field }) => (
                <FormItem className='w-1/2'>
                  <Label htmlFor='total_in_storage'>
                    Total en bodega<span className='text-red-500'>*</span>
                  </Label>
                  <FormControl>
                    <Input
                      id='total_in_storage'
                      type='number'
                      placeholder='Total en bodega'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='flex w-full gap-4'>
            <FormField
              control={form.control}
              name='buying_price'
              render={({ field }) => (
                <FormItem className='w-1/2'>
                  <Label htmlFor='buying_price'>
                    Precio de Compra COP<span className='text-red-500'>*</span>
                  </Label>
                  <FormControl>
                    <Input
                      id='buying_price'
                      type='number'
                      placeholder='Precio de Compra COP'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='selling_price'
              render={({ field }) => (
                <FormItem className='w-1/2'>
                  <Label htmlFor='selling_price'>
                    Precio de Venta COP<span className='text-red-500'>*</span>
                  </Label>
                  <FormControl>
                    <Input
                      id='selling_price'
                      type='number'
                      placeholder='Precio de Venta COP'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='flex w-full gap-4'>
            <FormField
              control={form.control}
              name='usd_price'
              render={({ field }) => (
                <FormItem className='w-1/2'>
                  <Label htmlFor='usd_price'>
                    Precio en USD <span className='text-red-500'>*</span>
                  </Label>
                  <FormControl>
                    <Input id='usd_price' type='number' placeholder='Precio en USD' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='group_id'
              render={({ field }) => (
                <SearchInputSelect<z.infer<typeof addProductsFormSchema>, 'group_id'>
                  label='Categoria'
                  className='w-1/2'
                  options={groups.map((item) => {
                    const option: OptionSelect = {
                      label: item.name,
                      value: item.id,
                    }
                    return option
                  })}
                  field={field}
                />
              )}
            />
          </div>

          <div className='flex w-full gap-4'>
            <FormField
              control={form.control}
              name='provider_id'
              render={({ field }) => (
                <SearchInputSelect<z.infer<typeof addProductsFormSchema>, 'provider_id'>
                  label='Proveedor'
                  className='w-1/2'
                  options={providers.map((item) => {
                    const option: OptionSelect = {
                      label: item.name,
                      value: item.id,
                    }
                    return option
                  })}
                  field={field}
                />
              )}
            />
            <FormField
              control={form.control}
              name='cost_center'
              render={({ field }) => (
                <SearchInputSelect<z.infer<typeof addProductsFormSchema>, 'cost_center'>
                  label='Centro de Costo'
                  className='w-1/2'
                  options={[
                    {
                      value: 'Guasá',
                      label: 'Guasá',
                    },
                    {
                      value: 'CHOCOLATE',
                      label: 'CHOCOLATE',
                    },
                    {
                      value: 'REALIDAD VIRTUAL',
                      label: 'REALIDAD VIRTUAL',
                    },
                  ]}
                  field={field}
                />
              )}
            />
          </div>
          <Button
            type='submit'
            disabled={isUploading}
            className='self-start px-4 py-2 mt-4 text-sm text-white bg-black rounded-lg disabled:opacity-50'
          >
            {isUploading || isLoadingEdit || isLoading ? 'Cargando...' : 'Guardar'}
          </Button>
        </form>
      </Form>
    </DialogContainer>
  )
}

export { AddProductsForm }
