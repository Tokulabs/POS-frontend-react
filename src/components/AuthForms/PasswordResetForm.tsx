import { FC } from 'react'
import UpdatePasswordContainer from './InputPassword'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { Button } from '../ui/button'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '../ui/form'
import { cn } from '@/lib/utils'

interface IAuthForm {
  onSubmit: (values: z.infer<typeof formSchema>) => void
  loading: boolean
}

export const formSchema = z
  .object({
    verificationCode: z
      .string({
        required_error: 'El código de verificación es obligatorio',
        invalid_type_error: 'El código de verificación debe ser un número',
      })
      .regex(/^\d{6}$/, 'El código de verificación debe contener exactamente 6 números'),
    passwordOne: z.string().nonempty('Campo requerido'),
    passwordTwo: z.string().nonempty('Campo requerido'),
  })
  .refine((data) => data.passwordOne === data.passwordTwo, {
    message: 'Las contraseñas deben coincidir',
    path: ['passwordTwo'],
  })

export const PasswordResetForm: FC<IAuthForm> = ({ onSubmit, loading }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      verificationCode: '',
      passwordOne: '',
      passwordTwo: '',
    },
  })

  const { watch } = form
  const passwordOne = watch('passwordOne')
  const passwordTwo = watch('passwordTwo')
  const verificationCode = watch('verificationCode')

  const isValidPassword =
    /[A-Z]/.test(passwordOne) &&
    /[a-z]/.test(passwordOne) &&
    /\d/.test(passwordOne) &&
    /\W|_/.test(passwordOne) &&
    passwordOne.length >= 8 &&
    passwordOne === passwordTwo

  const isValidForm = isValidPassword && verificationCode.length === 6

  return (
    <section className='flex flex-col items-center w-full max-w-sm max-h-screen mx-auto overflow-hidden'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
          <FormField
            control={form.control}
            name='verificationCode'
            render={({ field }) => (
              <FormItem className='w-full justify-items-center'>
                <h5 className='-mb-1 text-sm font-semibold'>Código de verificación</h5>
                <FormControl>
                  <div className='flex justify-center w-full px-8'>
                    <InputOTP
                      maxLength={6}
                      pattern={REGEXP_ONLY_DIGITS}
                      containerClassName='border-[0.5px] border-gray-100 w-full active:border-primary-foreground focus-visible:outline-none focus-visible:ring-0'
                      {...field}
                    >
                      <InputOTPGroup className='flex justify-between w-full'>
                        {new Array(6).fill(null).map((_, index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className={cn(
                              'border-solid border-[0.5px] w-full h-[40px] border-gray-300 shadow-none border-l-primary-foreground focus-visible:outline-none focus-visible:ring-0',
                              index === 5 && 'border-r-primary-foreground',
                            )}
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </FormControl>
                <FormDescription className='block w-full text-center text-md'>
                  <h5 className='mb-0 -mt-1 text-sm font-normal'>
                    Por favor ingresa el código que enviamos a tu correo
                  </h5>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <UpdatePasswordContainer />
          <FormItem className='flex justify-center w-full mt-4'>
            <Button
              type='submit'
              className='w-full -mt-5 text-white border-0 rounded-md cursor-pointer bg-neutral-900'
              disabled={!isValidForm || loading}
            >
              {loading ? 'Cargando...' : 'Confirmar'}
            </Button>
          </FormItem>
        </form>
      </Form>
    </section>
  )
}
