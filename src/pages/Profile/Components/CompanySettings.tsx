import { FC, useContext, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { store } from '@/store'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import FileUploadPreview from '@/components/FileUploadPreview/FileUploadPreviewS3'
import { useAwsS3Upload } from '@/hooks/useAwsS3Upload'
import { toast } from 'sonner'
import { OptionSelect, SearchInputSelect } from '@/components/FormComponents/SearchInputSelect'
import { useCities } from '@/hooks/useCities'
import { useMutation } from '@tanstack/react-query'
import { putCompanyInformation } from '../helpers/services'

const companySchema = z.object({
  name: z.string().nonempty('Campo requerido'),
  short_name: z.string(),
  email: z.string().email('Correo no válido'),
  nit: z.string().nonempty('Campo requerido'),
  address: z.string().nonempty('Campo requerido'),
  city: z.number().gt(0, 'Campo requerido'),
  phone: z.string().nonempty('Campo requerido'),
  logo: z.preprocess((val) => {
    if (val instanceof FileList) return undefined
    if (val === null) return ''
    return val
  }, z.string().optional()),
})

export type CompanyFormValues = z.infer<typeof companySchema>

const Company: FC = () => {
  const { state } = useContext(store)
  const { isLoading, citiesData = [] } = useCities('citiesBySearch')
  const [pendingFileUpload, setPendingFileUpload] = useState<File | null>(null)

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: state.user?.company?.name || '',
      short_name: state.user?.company?.short_name || '',
      email: state.user?.email || '',
      nit: state.user?.company?.nit || '',
      address: state.user?.company?.address || '',
      city: state.user?.company?.city.id || Number(0),
      phone: state.user?.company?.phone || '',
      logo: state.user?.company?.logo || '',
    },
  })

  const { mutate, isPending: isLoadingCompany } = useMutation({
    mutationFn: putCompanyInformation,
    onSuccess: () => {
      toast.success('Información de empresa actualizada')
    },
  })

  const { uploadFile, isUploading, resetUpload } = useAwsS3Upload({
    onSuccess: (imageUrl) => {
      form.setValue('logo', imageUrl)
      const currentFormData = form.getValues()
      handleCompanyUpdate(currentFormData)
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

  const handleCompanyUpdate = (companyData: CompanyFormValues) => {
    mutate(companyData)
  }

  const handleFileSelect = (file: File | null) => {
    setPendingFileUpload(file)
  }

  const onSubmit = (data: CompanyFormValues) => {
    if (pendingFileUpload) {
      const key = `company_id=${state.user?.company?.id}/company_images/${Date.now()}-${pendingFileUpload.name}`
      uploadFile(pendingFileUpload, key)
    } else {
      handleCompanyUpdate(data)
    }
  }

  return (
    <div className='flex w-full h-full overflow-y-auto'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col items-center justify-center w-full gap-3 p-4 md:px-10 lg:px-32'
        >
          <FileUploadPreview
            control={form.control}
            name='logo'
            label='Logo de la Empresa'
            description='Selecciona una imagen para el logo de tu empresa.'
            initialPreview={state.user?.company?.logo || ''}
            onFileSelect={handleFileSelect}
            onError={(error) => {
              toast.error(error)
            }}
          />

          <div className='flex w-full gap-4'>
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
              disabled={isLoadingCompany || isUploading}
            />

            <FormField
              control={form.control}
              name='short_name'
              render={({ field }) => (
                <FormItem className='w-1/2'>
                  <Label htmlFor='short_name'>
                    Nombre Corto <span className='text-red-500'>*</span>
                  </Label>
                  <FormControl>
                    <Input id='short_name' placeholder='Nombre Corto' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              disabled={isLoadingCompany || isUploading}
            />
          </div>

          <div className='flex w-full gap-4'>
            <FormField
              control={form.control}
              name='nit'
              render={({ field }) => (
                <FormItem className='w-1/2'>
                  <Label htmlFor='documentId'>
                    Número de Documento <span className='text-red-500'>*</span>
                  </Label>
                  <FormControl>
                    <Input id='documentId' placeholder='Número de documento' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              disabled={isLoadingCompany || isUploading}
            />
            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem className='w-1/2'>
                  <Label htmlFor='address'>
                    Dirección<span className='text-red-500'>*</span>
                  </Label>
                  <FormControl>
                    <Input id='address' placeholder='Dirección' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              disabled={isLoadingCompany || isUploading}
            />
          </div>

          <div className='flex w-full gap-4'>
            <FormField
              control={form.control}
              name='city'
              render={({ field }) => (
                <SearchInputSelect<z.infer<typeof companySchema>, 'city'>
                  label='Ciudad'
                  className='w-1/2'
                  options={citiesData.map((item) => {
                    const option: OptionSelect = {
                      label: item.name,
                      value: item.id,
                    }
                    return option
                  })}
                  isLoading={isLoading}
                  field={field}
                />
              )}
              disabled={isLoadingCompany || isUploading}
            />
            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem className='w-1/2'>
                  <Label htmlFor='phone'>Teléfono</Label>
                  <FormControl>
                    <Input id='phone' placeholder='Teléfono' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              disabled={isLoadingCompany || isUploading}
            />
          </div>

          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem className='w-full'>
                <Label htmlFor='email'>Email</Label>
                <FormControl>
                  <Input
                    id='email'
                    type='email'
                    placeholder='Email'
                    disabled
                    className='bg-zinc-300'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            disabled={isLoadingCompany || isUploading}
          />

          <Button
            type='submit'
            disabled={isUploading || isLoadingCompany}
            className='self-start px-4 py-2 mt-4 text-sm text-white bg-black rounded-lg disabled:opacity-50'
          >
            {isUploading || isLoadingCompany ? 'Cargando...' : 'Guardar'}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default Company
