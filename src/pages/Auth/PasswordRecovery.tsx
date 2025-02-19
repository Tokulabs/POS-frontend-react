import { FC, useState } from 'react'
import { IAuthProps } from '@/types/AuthTypes'
import { passwordRecoveryURL } from '@/utils/network'
import { createSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { axiosRequest } from '@/api/api'
import { DataPropsForm } from '@/types/GlobalTypes'
import { toast } from 'sonner'
import Authcomponent from '@/components/Auth/AuthComponent'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormControl } from '@/components/ui/form'

const PasswordRecovery: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const formSchema = z.object({
    email: z.string().nonempty('Campo requerido'),
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

  const onSubmit = async (values: DataPropsForm) => {
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
      <div className='w-[50%] flex flex-col items-center justify-center p-6'>
        <div className='min-w-[400px] w-full'>
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                const values: DataPropsForm = Object.fromEntries(
                  formData.entries(),
                ) as DataPropsForm
                onSubmit(values)
              }}
              className='space-y-6'
            >
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
                  </FormItem>
                )}
              />

              <FormItem className='w-full'>
                <Button
                  type='submit'
                  className='w-full bg-neutral-900 text-white border-0 h-10'
                  disabled={loading}
                >
                  {loading ? 'loading' : 'Ingresar'}
                </Button>
              </FormItem>
            </form>
          </Form>
        </div>
      </div>
    </Authcomponent>
  )
}
export default PasswordRecovery
