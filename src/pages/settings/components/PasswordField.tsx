import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form'

  const formSchema = z.object({
    password: z.string().nonempty('Campo requerido'),
  })

type PasswordFormValues = z.infer<typeof formSchema>

interface PasswordInputProps {
  onSubmit: (values: PasswordFormValues) => void
  loading?: boolean
}

export function PasswordField({ onSubmit, loading = false }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4 p-2'>
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='w-full'>
              <div className='grid gap-3 w-full'>
                <Label htmlFor='password'>Contraseña Actual <span className='text-red-500'>*</span></Label>
                <div className='relative'>
                  <FormControl>
                    <Input
                      autoComplete='off'
                      id='password'
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Contraseña'
                      {...field}
                      className='focus-visible:outline-none focus-visible:ring-0 border border-neutral-300 shadow-none w-full h-[40px]'
                    />
                  </FormControl>
                  {field.value && (
                    <button
                      type='button'
                      onClick={() => setShowPassword((prev) => !prev)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 scale-75'
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  )}
                  <FormMessage />
                </div>
              </div>
            </FormItem>
          )}
        />

        <div className='w-[50%]'>
          <Button type='submit' className='w-full bg-neutral-900 text-white font-normal' disabled={loading}>
            {loading ? 'Cargando...' : 'Actualizar Contraseña'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
