import { DataPropsForm } from '@/types/GlobalTypes'
import { Button, Form, Input } from 'antd'
import { FC } from 'react'
import { Link } from 'react-router-dom'

interface IAuthForm {
  onSubmit: (values: DataPropsForm) => void
  loading: boolean
}

export const LoginForm: FC<IAuthForm> = ({ onSubmit, loading }) => {
  return (
    <Form layout='vertical' onFinish={onSubmit}>
      <Form.Item
        label='Email'
        name='email'
        rules={[{ required: true, message: 'El correo es un campo obligaotrio' }]}
      >
        <Input placeholder='Email' type='email' />
      </Form.Item>
      <Form.Item
        label='Password'
        name='password'
        rules={[{ required: true, message: 'Debes ingresar una contraseña' }]}
      >
        <Input.Password placeholder='Contraseña' />
      </Form.Item>
      <Form.Item>
        <Button htmlType='submit' type='primary' block loading={loading}>
          Ingresar
        </Button>
      </Form.Item>
      <Link className='text-sm no-underline' to='/password-recovery'>
        Recuperar contraseña
      </Link>
    </Form>
  )
}
