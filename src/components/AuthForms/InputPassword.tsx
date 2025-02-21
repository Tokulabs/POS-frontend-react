import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-react'
import { FC, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { FormControl, FormItem } from '../ui/form'

const UpdatePasswordContainer: FC = () => {
  const { register, watch } = useFormContext()
  const [showPasswordOne, setShowPasswordOne] = useState(false)
  const [showPasswordTwo, setShowPasswordTwo] = useState(false)

  const passwordOne = watch('passwordOne')
  const passwordTwo = watch('passwordTwo')

  const mustContainData = [
    ['Al menos una letra mayúscula (A-Z)', /[A-Z]/.test(passwordOne)],
    ['Al menos una letra minúscula (a-z)', /[a-z]/.test(passwordOne)],
    ['Al menos un número (0-9)', /\d/.test(passwordOne)],
    ['Al menos un carácter especial', /\W|_/.test(passwordOne)],
    ['Al menos 8 caracteres', passwordOne?.length >= 8],
    ['Las contraseñas coinciden', passwordOne === passwordTwo && passwordOne !== ''],
  ]

  return (
    <div className='flex flex-col items-center w-full'>
      <FormItem className='mt-5 w-full'>
        <Label htmlFor='password' className='font-semibold text-sm'>
          Nueva Contraseña
        </Label>
        <FormControl>
          <div className='relative w-full'>
            <Input
              id='password'
              type={showPasswordOne ? 'text' : 'password'}
              {...register('passwordOne')}
              className='pr-10 focus-visible:outline-none focus-visible:ring-0 border-solid border-neutral-300 w-full h-[35px]'
            />
            {passwordOne && (
              <button
                type='button'
                className='absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer bg-transparent border-none'
                onClick={() => setShowPasswordOne(!showPasswordOne)}
              >
                {showPasswordOne ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            )}
          </div>
        </FormControl>
      </FormItem>

      <FormItem className='mt-5 mb-1 w-full'>
        <Label htmlFor='confirm-password' className='font-semibold text-sm'>
          Confirmar Contraseña
        </Label>
        <FormControl>
          <div className='relative w-full'>
            <Input
              id='confirm-password'
              type={showPasswordTwo ? 'text' : 'password'}
              {...register('passwordTwo')}
              className='pr-10 focus-visible:outline-none focus-visible:ring-0 border-solid border-neutral-300 w-full h-[35px]'
            />
            {passwordTwo && (
              <button
                type='button'
                className='absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer bg-transparent border-none'
                onClick={() => setShowPasswordTwo(!showPasswordTwo)}
              >
                {showPasswordTwo ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            )}
          </div>
        </FormControl>
      </FormItem>

      <div className='must-container text-sm font-semibold mt-2 mb-1 w-full'>
        {mustContainData.map(([label, isValid], index) => (
          <p className='font-normal flex gap-3' key={index}>
            <span>{isValid ? '✅' : '❌'}</span>
            <span>{label}</span>
          </p>
        ))}
      </div>
    </div>
  )
}

export default UpdatePasswordContainer
