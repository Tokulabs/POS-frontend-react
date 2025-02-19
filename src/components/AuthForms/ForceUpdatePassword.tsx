import { Button } from '../ui/button'
import { FC } from 'react'
import { Form, FormItem } from '../ui/form'
import UpdatePasswordContainer from './InputPassword'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

interface IAuthForm {
  onSubmit: (values: z.infer<typeof formSchema>) => void
  loading: boolean
}

export const formSchema = z
  .object({
    passwordOne: z.string().nonempty('Campo requerido'),
    passwordTwo: z.string().nonempty('Campo requerido'),
  })
  .refine((data) => data.passwordOne === data.passwordTwo, {
    message: 'Las contraseñas deben coincidir',
    path: ['passwordTwo'],
  })

export const ForceUpdatePassword: FC<IAuthForm> = ({ onSubmit, loading }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passwordOne: '',
      passwordTwo: '',
    },
  })

  const { watch } = form
  const passwordOne = watch('passwordOne')
  const passwordTwo = watch('passwordTwo')

  const isValidPassword =
    /[A-Z]/.test(passwordOne) &&
    /[a-z]/.test(passwordOne) &&
    /\d/.test(passwordOne) &&
    /\W|_/.test(passwordOne) &&
    passwordOne.length >= 8 &&
    passwordOne === passwordTwo

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <UpdatePasswordContainer />
        <FormItem className='flex justify-center mt-4'>
          <Button
            type='submit'
            className='w-[382px] bg-neutral-900 text-white border-0 rounded-md -mt-5 cursor-pointer'
            disabled={!isValidPassword}
          >
            {loading ? 'Cargando...' : 'Confirmar'}
          </Button>
        </FormItem>
      </form>
    </Form>
  )
}
