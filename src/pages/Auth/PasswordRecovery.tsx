import { FC, useState } from 'react'
import { IAuthProps } from '@/types/AuthTypes'
import { passwordRecoveryURL } from '@/utils/network'
import { createSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { axiosRequest } from '@/api/api'
import { toast } from 'sonner'
import Authcomponent from '@/components/Auth/AuthComponent'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'

const PasswordRecovery: FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const formSchema = z.object({
    email: z.string().email('Debe ser un correo electrónico').nonempty('Campo requerido'),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  const AuthProps: IAuthProps = {
    successCallback: () => {
      navigate('/')
    },
  }
  useAuth(AuthProps)

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const response = await axiosRequest<{ message: string }>({
        method: 'post',
        url: passwordRecoveryURL,
        payload: values,
        errorObject: {
          message: 'Error en la solicitud',
        },
      })
      if (response) {
        const { email } = values
        navigate({
          pathname: '/password-reset',
          search: createSearchParams({
            email: email as string,
          }).toString(),
        })
        toast.error(response.data.message)
      }
    } catch (e) {
      console.log(e)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Authcomponent>
      <div className='flex flex-col items-center justify-center p-6 w-full'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 w-full'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='w-full -mb-2'>
                  <Label htmlFor='email' className='mb-4 text-left block'>
                    Correo electrónico
                  </Label>
                  <FormControl>
                    <Input
                      id='email'
                      placeholder='Correo'
                      type='email'
                      {...field}
                      required
                      className='focus-visible:outline-none focus-visible:ring-0 border-solid border-neutral-300 shadow-none w-full h-10 px-4'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem className='w-full'>
              <Button
                type='submit'
                className='w-full bg-neutral-900 text-white border-0 h-10'
                disabled={loading}
              >
                {loading ? 'Cargando...' : 'Enviar Código'}
              </Button>
            </FormItem>
          </form>
        </Form>
      </div>
    </Authcomponent>
  )
}
export default PasswordRecovery
