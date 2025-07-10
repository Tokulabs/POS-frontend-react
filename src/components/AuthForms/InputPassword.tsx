import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff } from 'lucide-react'
import { FC, useState, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { FormControl, FormItem } from '../ui/form'

interface UpdatePasswordContainerProps {
  onValidationChange?: (isValid: boolean) => void
}

const UpdatePasswordContainer: FC<UpdatePasswordContainerProps> = ({ onValidationChange }) => {
  const { register, watch } = useFormContext()
  const [showPasswordOne, setShowPasswordOne] = useState(false)
  const [showPasswordTwo, setShowPasswordTwo] = useState(false)

  const passwordOne = watch('passwordOne') || ''
  const passwordTwo = watch('passwordTwo') || ''

  const mustContainData = [
    ['Al menos una letra mayúscula (A-Z)', /[A-Z]/.test(passwordOne)],
    ['Al menos una letra minúscula (a-z)', /[a-z]/.test(passwordOne)],
    ['Al menos un número (0-9)', /\d/.test(passwordOne)],
    ['Al menos un carácter especial', /\W|_/.test(passwordOne)],
    ['Al menos 8 caracteres', passwordOne.length >= 8],
    ['Las contraseñas coinciden', passwordOne === passwordTwo && passwordOne !== ''],
  ]

  const isAllValid = mustContainData.every(([, isValid]) => isValid)

  useEffect(() => {
    onValidationChange?.(isAllValid)
  }, [isAllValid, onValidationChange])

  return (
    <div className='flex flex-col items-center w-full'>
      <FormItem className='w-full mt-5'>
        <Label htmlFor='password' className='text-sm font-semibold'>
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
                className='absolute inset-y-0 flex items-center text-gray-500 bg-transparent border-none cursor-pointer right-3 hover:text-gray-700'
                onClick={() => setShowPasswordOne(!showPasswordOne)}
              >
                {showPasswordOne ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            )}
          </div>
        </FormControl>
      </FormItem>

      <FormItem className='w-full mt-5 mb-1'>
        <Label htmlFor='confirm-password' className='text-sm font-semibold'>
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
                className='absolute inset-y-0 flex items-center text-gray-500 bg-transparent border-none cursor-pointer right-3 hover:text-gray-700'
                onClick={() => setShowPasswordTwo(!showPasswordTwo)}
              >
                {showPasswordTwo ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            )}
          </div>
        </FormControl>
      </FormItem>

      <div className='w-full mt-2 mb-1 text-sm font-semibold must-container'>
        {mustContainData.map(([label, isValid], index) => (
          <p className='flex gap-3 font-normal' key={index}>
            <span>{isValid ? '✅' : '❌'}</span>
            <span>{label}</span>
          </p>
        ))}
      </div>
    </div>
  )
}

export default UpdatePasswordContainer
