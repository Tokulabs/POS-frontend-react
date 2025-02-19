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
    <section className='w-full max-w-sm mx-auto'>
      <Form {...form}>
        <form className='space-y-5 w-full max-w-2xl mx-auto' onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem className='justify-items-center'>
                <div className='grid gap-3 mx-auto w-[400px]'>
                  <Label htmlFor='email'>Email</Label>
                  <FormControl>
                    <Input
                      id='email'
                      type='email'
                      placeholder='Email'
                      required
                      className='focus-visible:outline-none focus-visible:ring-0 border-solid border-neutral-300 shadow-none w-[400px] h-[40px]'
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
              <FormItem className='justify-items-center '>
                <div className='grid gap-3 mx-auto w-[400px]'>
                  <Label htmlFor='password'>Contraseña</Label>
                  <div className='relative '>
                    <FormControl>
                      <Input
                        id='password'
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Contraseña'
                        {...field}
                        className='focus-visible:outline-none focus-visible:ring-0 border-solid border-neutral-300 shadow-none w-[400px] h-[40px]'
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

          <FormItem>
            <Button
              type='submit'
              className='w-[400px] bg-neutral-900 text-white border-0 cursor-pointer'
              disabled={loading}
            >
              {loading ? 'loading' : 'Ingresar'}
            </Button>
          </FormItem>

          <div className='w-[400px] mx-auto'>
            <Link to='/password-recovery' className='text-sm text-black underline'>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>
      </Form>
    </section>
  )
}
