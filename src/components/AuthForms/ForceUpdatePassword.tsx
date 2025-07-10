import { Button } from '../ui/button'
import { FC, useState } from 'react'
import { Form, FormItem } from '../ui/form'
import UpdatePasswordContainer from './InputPassword'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export const formSchema = z
  .object({
    passwordOne: z.string().nonempty('Campo requerido'),
    passwordTwo: z.string().nonempty('Campo requerido'),
  })
  .refine((data) => data.passwordOne === data.passwordTwo, {
    message: 'Las contraseñas deben coincidir',
    path: ['passwordTwo'],
  })

interface IAuthForm {
  onSubmit: (values: z.infer<typeof formSchema>) => void
  loading: boolean
}

export const ForceUpdatePassword: FC<IAuthForm> = ({ onSubmit, loading }) => {
  const [isPasswordValid, setIsPasswordValid] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passwordOne: '',
      passwordTwo: '',
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col items-center justify-center w-full gap-4'
      >
        <UpdatePasswordContainer onValidationChange={setIsPasswordValid} />
        <FormItem className='flex justify-center w-full mt-4'>
          <Button
            type='submit'
            className='w-full text-white border-0 rounded-md cursor-pointer bg-neutral-900'
            disabled={!isPasswordValid || loading}
          >
            {loading ? 'Cargando...' : 'Confirmar'}
          </Button>
        </FormItem>
      </form>
    </Form>
  )
}
