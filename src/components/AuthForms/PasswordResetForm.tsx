import { DataPropsForm } from '@/types/GlobalTypes'
import { Button, Form } from 'antd'
import { FC, useState } from 'react'
import UpdatePasswordContainer from './InputPassword'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { REGEXP_ONLY_DIGITS } from 'input-otp'
import KiospotLogoColor from '@/assets/logos/Kiospot-Horizontal-Logo-Color.webp'

interface IAuthForm {
  onSubmit: (values: DataPropsForm) => void
  loading: boolean
}

export const PasswordResetForm: FC<IAuthForm> = ({ onSubmit, loading }) => {
  const [allValid, setAllValid] = useState(false)

  const handleAllValid = (value: boolean) => {
    setAllValid(value)
  }

  return (
    <div className='justify-center'>
      {/* Logo section */}
      <div className='justify-center'>
        <img
          src='src/assets/logos/Kiospot-Horizontal-Logo-white.webp'
          alt='Logo'
          className='h-[85px] md:h-[155px]'
        />
      </div>

      {/* Form section */}
      <Form layout='vertical' onFinish={onSubmit} className='w-full max-w-sm mx-auto'>
        <div className='flex justify-center'>
          <img src={KiospotLogoColor} className='-mt-8 h-32 md:h-40' />
        </div>

        {/* Verification code section */}
        <p className='text-center font-semibold'>Código de verificación</p>
        <Form.Item
          name='confirmation_code'
          className='text-center font-semibold'
          labelCol={{ span: 24 }}
          rules={[{ required: true, message: 'Debes ingresar un código' }]}
        >
          <div className='flex justify-center'>
            <InputOTP
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              containerClassName='border-solid rounded-lg border-[1px] border-gray-300 w-[70%]'
            >
              <InputOTPGroup className='flex w-full justify-between'>
                <InputOTPSlot
                  index={0}
                  className='border-solid border-r-gray-300 shadow-none border-l-primary-foreground w-full'
                />
                <InputOTPSlot
                  index={1}
                  className='border-solid border-r-gray-300 shadow-none border-l-primary-foreground w-full'
                />
                <InputOTPSlot
                  index={2}
                  className='border-solid border-r-gray-300 shadow-none border-l-primary-foreground w-full'
                />
                <InputOTPSlot
                  index={3}
                  className='border-solid border-r-gray-300 shadow-none border-l-primary-foreground w-full'
                />
                <InputOTPSlot
                  index={4}
                  className='border-solid border-r-gray-300 shadow-none border-l-primary-foreground w-full'
                />
                <InputOTPSlot
                  index={5}
                  className='border-solid border-r-gray-300 shadow-none border-l-primary-foreground border-r-primary-foreground w-full'
                />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </Form.Item>

        <p className='text-center text-sm text-muted-foreground mb-3'>
          Por favor ingresa el código que enviamos a tu correo
        </p>

        <UpdatePasswordContainer handleAllValid={handleAllValid} />

        <Form.Item>
          <Button htmlType='submit' type='primary' block loading={loading} disabled={!allValid}>
            Confirmar
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
