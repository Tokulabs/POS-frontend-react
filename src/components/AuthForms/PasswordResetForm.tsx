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
    <section className='w-full max-w-sm mx-auto max-h-screen overflow-hidden flex flex-col items-center'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
          <FormField
            control={form.control}
            name='verificationCode'
            render={({ field }) => (
              <FormItem className='justify-items-center w-full'>
                <h5 className='font-semibold text-sm -mb-1'>Código de verificación</h5>
                <FormControl>
                  <div className='flex justify-center w-full px-8'>
                    <InputOTP
                      maxLength={6}
                      pattern={REGEXP_ONLY_DIGITS}
                      containerClassName='border-[0.5px] border-gray-100 w-full active:border-primary-foreground focus-visible:outline-none focus-visible:ring-0'
                      {...field}
                    >
                      <InputOTPGroup className='flex w-full justify-between'>
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
                <FormDescription className='text-center text-md w-full block'>
                  <h5 className='font-normal text-sm mb-0 -mt-1'>
                    Por favor ingresa el código que enviamos a tu correo
                  </h5>
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <UpdatePasswordContainer />
          <FormItem className='flex justify-center mt-4 w-full'>
            <Button
              type='submit'
              className='w-full bg-neutral-900 text-white border-0 rounded-md -mt-5 cursor-pointer'
              disabled={!isValidForm}
            >
              {loading ? 'Cargando...' : 'Confirmar'}
            </Button>
          </FormItem>
        </form>
      </Form>
    </section>
  )
}
