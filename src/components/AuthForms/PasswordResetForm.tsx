import { DataPropsForm } from '@/types/GlobalTypes'
import { Button, Form, Input } from 'antd'
import { FC, useState } from 'react'
import UpdatePasswordContainer from './InputPassword'

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
    <Form layout='vertical' onFinish={onSubmit}>
      <Form.Item
        label='Codigo de confirmación'
        name='confirmation_code'
        rules={[{ required: true, message: 'Debes ingresar una contraseña' }]}
      >
        <Input.OTP formatter={(str) => str.toUpperCase()} size='large' />
      </Form.Item>
      <UpdatePasswordContainer handleAllValid={handleAllValid} />
      <Form.Item>
        <Button htmlType='submit' type='primary' block loading={loading} disabled={!allValid}>
          Confirmar
        </Button>
      </Form.Item>
    </Form>
  )
}
