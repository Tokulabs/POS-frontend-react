import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormItem, FormControl, FormMessage } from '../ui/form'

interface IAuthForm {
  onSubmit: (values: { email: string; password: string }) => void
  loading?: boolean
}

export const LoginForm: React.FC<IAuthForm> = ({ onSubmit, loading }) => {
  const [showPassword, setShowPassword] = useState(false)

  const formSchema = z.object({
    email: z.string().email('Debe ser un correo electrónico').nonempty('Campo requerido'),
    password: z.string().nonempty('Campo requerido'),
  })

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  return (
    <Form {...form}>
      <form
        className='w-full flex flex-col items-center justify-center gap-4'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem className='justify-items-center w-full'>
              <div className='grid gap-3 mx-auto w-full'>
                <Label htmlFor='email'>Email</Label>
                <FormControl>
                  <Input
                    id='email'
                    type='email'
                    placeholder='Email'
                    required
                    className='focus-visible:outline-hidden focus-visible:ring-0 border-solid border-neutral-300 shadow-none w-full h-[40px]'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='justify-items-center w-full'>
              <div className='grid gap-3 mx-auto w-full'>
                <Label htmlFor='password'>Contraseña</Label>
                <div className='relative '>
                  <FormControl>
                    <Input
                      id='password'
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Contraseña'
                      {...field}
                      className='focus-visible:outline-hidden focus-visible:ring-0 border-solid border-neutral-300 shadow-none w-full h-[40px]'
                    />
                  </FormControl>
                  <FormMessage />

                  {field.value && (
                    <button
                      type='button'
                      onClick={togglePasswordVisibility}
                      className='absolute right-3 top-1/2 -translate-y-1/2 p-0 bg-transparent border-none text-gray-500 scale-75 cursor-pointer'
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  )}
                </div>
              </div>
            </FormItem>
          )}
        />

        <FormItem className='w-full'>
          <Button
            type='submit'
            className='w-full bg-neutral-900 text-white border-0 cursor-pointer'
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Ingresar'}
          </Button>
        </FormItem>

        <div className='w-full mx-auto'>
          <Link to='/password-recovery' className='text-sm text-foreground underline'>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </form>
    </Form>
  )
}
