import React, { useContext } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { store } from '@/store'
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { OptionSelect, SearchInputSelect } from '@/components/FormComponents/SearchInputSelect'
import { Button } from '@/components/ui/button'
import { putUsers } from '@/pages/Users/helpers/services'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ActionTypes } from '@/types/StoreTypes'

const avatarOptions = [
  'https://img.freepik.com/psd-gratis/3d-ilustracion-persona-gafas-sol_23-2149436188.jpg',
  'https://img.freepik.com/psd-gratis/ilustracion-3d-persona-camiseta-mangas_23-2149436202.jpg ',
  'https://img.freepik.com/psd-gratis/ilustracion-3d-persona-pelo-punk-chaqueta_23-2149436198.jpg',
  'https://img.freepik.com/psd-gratis/3d-ilustracion-persona_23-2149436182.jpg',
  'https://img.freepik.com/psd-gratis/3d-ilustracion-persona-gafas-sol_23-2149436178.jpg',
  'https://img.freepik.com/psd-gratis/ilustracion-3d-persona-gafas-sol-cabello-verde_23-2149436201.jpg ',
]

const profileSchema = z.object({
  photo: z.string().url(),
  fullname: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Correo inválido'),
  documentType: z.string().nonempty('Tipo requerido'),
  documentId: z.string().nonempty('Documento requerido'),
})

const documentTypesOptions = [
  { label: 'Cédula de ciudadania', value: 'CC' },
  { label: 'Cédula de extranjería', value: 'CE' },
  { label: 'NIT', value: 'NIT' },
  { label: 'Tarjeta de identidad', value: 'TI' },
  { label: 'Pasaporte', value: 'PA' },
  { label: 'Documento de identificación extranjero', value: 'DIE' },
] as const

type ProfileFormValues = z.infer<typeof profileSchema>

const ProfileSettings: React.FC = () => {
  const { state, dispatch } = useContext(store)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      photo: state.user?.photo || avatarOptions[0],
      fullname: state.user?.fullname || '',
      email: state.user?.email || '',
      documentType: state.user?.document_type || '',
      documentId: state.user?.document_id || '',
    },
  })

  const selectedAvatar = form.watch('photo')

  const handleAvatarSelect = (src: string) => {
    form.setValue('photo', src)
  }

  const { mutate, isPending } = useMutation({
    mutationFn: putUsers,
    onSuccess: (item) => {
      if (item?.data) {
        dispatch({ type: ActionTypes.UPDATE_USER_INFO, payload: item?.data })
        toast.success('Información actualizada correctamente')
      }
    },
  })

  const onSubmit = (values: ProfileFormValues) => {
    if (isPending) return
    if (!state.user?.id) {
      toast.error('Usuario no encontrado')
      return
    }
    const { documentType, documentId, ...rest } = values
    const formattedValues = {
      ...rest,
      document_type: documentType,
      document_id: documentId,
      role: state.user?.role || '',
    }
    mutate({ values: formattedValues, id: state.user?.id || '' })
  }

  return (
    <div className='flex flex-col items-center w-full'>
      <div className='flex flex-col items-center pb-5'>
        <div className='relative flex items-center justify-center w-32 h-32 mb-4 overflow-hidden rounded-full shadow-md'>
          <img src={selectedAvatar} alt='Avatar Principal' className='object-cover w-full h-full' />
        </div>
        <div className='flex justify-center gap-3'>
          {avatarOptions.map((src, index) => (
            <button
              type='button'
              key={index}
              className={`relative w-14 h-14 rounded-full overflow-hidden shadow-sm border-2 transition-all duration-200 ${
                selectedAvatar === src ? 'scale-125' : 'border-transparent'
              }`}
              onClick={() => handleAvatarSelect(src)}
              tabIndex={0}
            >
              <img src={src} alt={`Avatar ${index + 1}`} className='object-cover w-full h-full' />
            </button>
          ))}
        </div>
      </div>

      <div className='w-full md:px-10 lg:px-32'>
        <Form {...form}>
          <form
            className='grid grid-cols-1 gap-6 md:grid-cols-2'
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name='fullname'
              render={({ field }) => (
                <FormItem className='flex flex-col gap-1'>
                  <Label htmlFor='fullname'>
                    Nombre completo <span className='text-red-1'>*</span>
                  </Label>
                  <FormControl>
                    <Input
                      id='fullname'
                      {...field}
                      className='border-gray-1  border-[1px] border-solid rounded-md p-3 outline-none focus-visible:ring-0'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='flex flex-col gap-1'>
                  <Label htmlFor='email'>Email</Label>
                  <FormControl>
                    <Input
                      id='email'
                      type='email'
                      {...field}
                      disabled
                      className='disabled:bg-zinc-300'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='documentType'
              render={({ field }) => (
                <SearchInputSelect<z.infer<typeof profileSchema>, 'documentType'>
                  label='Documento'
                  className='flex flex-col justify-start '
                  options={documentTypesOptions.map((item) => {
                    const option: OptionSelect = {
                      label: item.label,
                      value: item.value,
                    }
                    return option
                  })}
                  field={field}
                />
              )}
            />

            <FormField
              control={form.control}
              name='documentId'
              render={({ field }) => (
                <FormItem className='flex flex-col gap-1'>
                  <Label htmlFor='documentId'>
                    Documento de identidad <span className='text-red-1'>*</span>
                  </Label>
                  <FormControl>
                    <Input
                      id='documentId'
                      placeholder='Número de documento'
                      {...field}
                      className='border-gray-1  border-[1px] border-solid rounded-md p-3 outline-none focus-visible:ring-0'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='col-span-2'>
              <Button
                type='submit'
                className='p-3 text-sm text-white bg-black rounded-lg w-fit'
                disabled={isPending}
              >
                Actualizar Información
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default ProfileSettings
