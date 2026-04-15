import React, { useContext, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { store } from '@/store'
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { putUsers } from '@/pages/Users/helpers/services'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ActionTypes } from '@/types/StoreTypes'
import UpdatePasswordContainer from '@/components/AuthForms/InputPassword'
import { axiosRequest } from '@/api/api'
import { updatePasswordURL } from '@/utils/network'

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
})

const passwordSchema = z
  .object({
    passwordOne: z.string().nonempty('Campo requerido'),
    passwordTwo: z.string().nonempty('Campo requerido'),
    oldPassword: z.string().nonempty('Campo requerido'),
  })
  .refine((data) => data.passwordOne === data.passwordTwo, {
    message: 'Las contraseñas deben coincidir',
    path: ['passwordTwo'],
  })

type ProfileFormValues = z.infer<typeof profileSchema>

const SettingsProfile: React.FC = () => {
  const { state, dispatch } = useContext(store)
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      photo: state.user?.photo || avatarOptions[0],
      fullname: state.user?.fullname || '',
    },
  })

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { passwordOne: '', passwordTwo: '', oldPassword: '' },
  })

  const selectedAvatar = profileForm.watch('photo')

  const { mutate, isPending } = useMutation({
    mutationFn: putUsers,
    onSuccess: (item) => {
      if (item?.data) {
        dispatch({ type: ActionTypes.UPDATE_USER_INFO, payload: { ...state.user, ...item.data } })
        toast.success('Información actualizada correctamente')
      }
    },
  })

  const onProfileSubmit = (values: ProfileFormValues) => {
    if (!state.user?.id) {
      toast.error('Usuario no encontrado')
      return
    }
    mutate({ values, id: state.user.id })
  }

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    const { passwordOne, oldPassword } = values
    try {
      setPasswordLoading(true)
      const response = await axiosRequest<{ message: string }>({
        method: 'post',
        url: updatePasswordURL,
        hasAuth: true,
        payload: { new_password: passwordOne, old_password: oldPassword },
        returnErrorResponse: true,
      })
      if (response?.status === 200) {
        toast.success(response.data.message)
        passwordForm.reset()
      } else if (response?.status === 401) {
        toast.error('La contraseña actual es incorrecta')
      }
    } catch {
      toast.error('Error al actualizar la contraseña. Por favor, inténtelo de nuevo.')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className='flex w-full h-full overflow-y-auto'>
      <div className='flex flex-col w-full gap-8 p-4 md:px-10 lg:px-32'>

        {/* Profile section */}
        <Form {...profileForm}>
          <form
            className='flex flex-col items-center w-full gap-3'
            onSubmit={profileForm.handleSubmit(onProfileSubmit)}
          >
            <div className='flex flex-col items-center w-full gap-3'>
              <img
                src={selectedAvatar}
                alt='Avatar Principal'
                className='object-cover w-32 h-32 rounded-full shadow-md'
              />
              <div className='flex justify-center gap-3'>
                {avatarOptions.map((src, index) => (
                  <img
                    key={index}
                    onClick={() => profileForm.setValue('photo', src)}
                    src={src}
                    alt={`Avatar ${index + 1}`}
                    className={`relative w-14 h-14 rounded-full overflow-hidden shadow-xs border-2 transition-all duration-200 cursor-pointer ${
                      selectedAvatar === src ? 'scale-125' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className='flex w-full flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground'>
              <span className='font-medium text-foreground'>{state.user?.email}</span>
              {state.user?.document_id && (
                <>
                  <span className='text-muted-foreground/40'>·</span>
                  <span>
                    {state.user.document_type}{' '}
                    <span className='font-medium text-foreground'>{state.user.document_id}</span>
                  </span>
                </>
              )}
            </div>

            <FormField
              control={profileForm.control}
              name='fullname'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <Label htmlFor='fullname'>
                    Nombre completo <span className='text-red-500'>*</span>
                  </Label>
                  <FormControl>
                    <Input
                      id='fullname'
                      {...field}
                      className='border-gray-1 border border-solid rounded-md p-3 outline-hidden focus-visible:ring-0'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type='submit'
              className='self-start px-4 py-2 mt-2 text-sm text-white bg-black rounded-lg'
              disabled={isPending}
            >
              {isPending ? 'Actualizando...' : 'Guardar'}
            </Button>
          </form>
        </Form>

        <div className='flex items-center gap-3 text-muted-foreground'>
          <div className='flex-1 h-px bg-border' />
          <span className='text-xs'>Cambiar contraseña</span>
          <div className='flex-1 h-px bg-border' />
        </div>

        {/* Password section */}
        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className='flex flex-col items-center w-full gap-4'
          >
            <FormField
              control={passwordForm.control}
              name='oldPassword'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <Label htmlFor='oldPassword' className='text-sm font-semibold'>
                    Contraseña Actual
                  </Label>
                  <FormControl>
                    <Input
                      id='oldPassword'
                      type='password'
                      {...field}
                      className='focus-visible:outline-hidden focus-visible:ring-0 border-solid border-neutral-300 w-full h-[35px] px-3'
                      placeholder='Ingrese su contraseña actual'
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <UpdatePasswordContainer onValidationChange={setIsPasswordValid} />
            <FormItem className='flex justify-center w-full'>
              <Button
                type='submit'
                className='w-full text-white border-0 rounded-md cursor-pointer w-bg-neutral-900'
                disabled={!isPasswordValid || !passwordForm.watch('oldPassword') || passwordLoading}
              >
                {passwordLoading ? 'Cargando...' : 'Confirmar'}
              </Button>
            </FormItem>
          </form>
        </Form>

      </div>
    </div>
  )
}

export { SettingsProfile }
