import { FC } from 'react'
// Third Party
import { Loader2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '../ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Types
import { z } from 'zod'
import { DataPropsForm } from '@/types/GlobalTypes'
import { IAuthProps } from '@/types/AuthTypes'
import { cn } from '@/lib/utils'
// Axios
import { axiosRequest } from '@/api/api'
// Utils
import { confirmEmailCode } from '@/utils/network'
// Hooks
import { useAuth } from '@/hooks/useAuth'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../ui/button'

interface IModalDownloadReports {
  isVisible: boolean
  onSuccessCallback: () => void
  onCancelCallback: () => void
}

const formSchema = z.object({
  code: z
    .string({
      required_error: 'El código de verificación es obligatorio',
      invalid_type_error: 'El código de verificación debe ser un número',
    })
    .regex(/^\d{6}$/, 'El código de verificación debe contener exactamente 6 números'),
})

const confirmEmailVerify = async (payload: DataPropsForm) => {
  const response = await axiosRequest({
    url: confirmEmailCode,
    method: 'post',
    hasAuth: true,
    showError: true,
    payload: payload,
  })
  if (response) {
    return response
  }
}

export const ConfirmEmailVerification: FC<IModalDownloadReports> = ({
  isVisible,
  onCancelCallback,
  onSuccessCallback,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  })

  const navigate = useNavigate()
  const AuthProps: IAuthProps = {
    successCallback: () => {
      navigate('/')
    },
  }
  const { checkUser } = useAuth(AuthProps)

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: confirmEmailVerify,
    onSuccess: () => {
      onSuccessCallback()
      toast.success('Email verificado con éxito!')
      form.reset()
      checkUser()
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isLoading) return
    if (!values || values === null) return
    mutate(values)
  }

  const { watch } = form
  const code = watch('code')
  const isValidForm = code.length === 6

  return (
    <Dialog open={isVisible} onOpenChange={onCancelCallback}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verifica tu correo</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className='flex justify-center items-center gap-2'>
            <div className='flex justify-center items-center gap-2'>
              <Loader2 className='animate-spin' />
              <span>Verificando...</span>
            </div>{' '}
          </div>
        ) : (
          <section>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='w-full'>
                <FormField
                  control={form.control}
                  name='code'
                  render={({ field }) => (
                    <FormItem className='justify-items-center w-full'>
                      <h5 className='font-semibold text-sm -mt-6'>Código de verificación</h5>
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
                        <h5 className='font-normal text-sm mt-1 mb-4'>
                          Por favor ingresa el código que enviamos a tu correo
                        </h5>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <Button
                    type='submit'
                    className='w-full bg-neutral-900 text-white border-0 rounded-md -mt-5 cursor-pointer'
                    disabled={!isValidForm}
                  >
                    Confirmar
                  </Button>
                </FormItem>
              </form>
            </Form>
          </section>
        )}
      </DialogContent>
    </Dialog>
  )
}