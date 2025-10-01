import { FC, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import UpdatePasswordContainer from '@/components/AuthForms/InputPassword'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { updatePasswordURL } from '@/utils/network'
import { axiosRequest } from '@/api/api'
import { toast } from 'sonner'

export const formSchema = z
  .object({
    passwordOne: z.string().nonempty('Campo requerido'),
    passwordTwo: z.string().nonempty('Campo requerido'),
    oldPassword: z.string().nonempty('Campo requerido'),
  })
  .refine((data) => data.passwordOne === data.passwordTwo, {
    message: 'Las contraseñas deben coincidir',
    path: ['passwordTwo'],
  })

export const UpdatePasswordSettings: FC = () => {
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passwordOne: '',
      passwordTwo: '',
      oldPassword: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { passwordOne, oldPassword } = values
    try {
      setLoading(true)
      const response = await axiosRequest<{ message: string }>({
        method: 'post',
        url: updatePasswordURL,
        hasAuth: true,
        payload: {
          new_password: passwordOne,
          old_password: oldPassword,
        },
      })
      if (response?.status === 200) {
        toast.error(response.data.message)
        form.reset()
      }
    } catch (e) {
      console.log(e)
      toast.error('Error al actualizar la contraseña. Por favor, inténtelo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex w-full h-full overflow-y-auto'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col items-center justify-center w-full gap-4 px-5 xs:px-10 sm:px-20 lg:px-40 xl:px-60'
        >
          <FormField
            control={form.control}
            name='oldPassword'
            render={({ field }) => (
              <FormItem className='w-full mt-5'>
                <Label htmlFor='oldPassword' className='text-sm font-semibold'>
                  Contraseña Actual
                </Label>
                <FormControl>
                  <Input
                    id='oldPassword'
                    type='password'
                    {...field}
                    className='focus-visible:outline-none focus-visible:ring-0 border-solid border-neutral-300 w-full h-[35px] px-3'
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
              disabled={!isPasswordValid || !form.watch('oldPassword') || loading}
            >
              {loading ? 'Cargando...' : 'Confirmar'}
            </Button>
          </FormItem>
        </form>
      </Form>
    </div>
  )
}
