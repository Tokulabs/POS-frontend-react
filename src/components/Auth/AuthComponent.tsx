import { FC } from 'react'
import { Form, Input, Button } from 'antd'
import { Link } from 'react-router-dom'
import { DataPropsForm } from '../../types/GlobalTypes'

interface IAuthComponentProps {
  titleText?: string
  isPassword?: boolean
  bottomText?: string
  linkText?: string
  linkPath?: string
  loading?: boolean
  onSubmit: (values: DataPropsForm) => void
  isUpdatePassword?: boolean
}

const Authcomponent: FC<IAuthComponentProps> = ({
  titleText = 'Ingresa',
  isPassword = true,
  bottomText = 'Login',
  linkText = 'Nuevo usuario?',
  linkPath = '/check-user',
  onSubmit,
  loading = false,
  isUpdatePassword = false,
}) => {
  return (
    <div className='w-100 min-h-[100vh] flex items-center justify-center'>
      <div className='min-w-[400px]'>
        <div className='flex justify-between items-center border-0 border-b-[1px] border-solid border-gray-200 pb-3 mb-4'>
          <h3 className='text-base'>{titleText}</h3>
          <h2 className='text-lg'>InV System POS</h2>
        </div>
        <Form layout='vertical' onFinish={onSubmit}>
          {!isUpdatePassword && (
            <Form.Item
              label='Email'
              name='email'
              rules={[{ required: true, message: 'El correo es un campo obligaotrio' }]}
            >
              <Input placeholder='Email' type='email' />
            </Form.Item>
          )}
          {isPassword && (
            <Form.Item
              label='Password'
              name='password'
              rules={[{ required: true, message: 'Debes ingresar una contraseña' }]}
            >
              <Input placeholder='Contraseña' type='password' />
            </Form.Item>
          )}
          {isUpdatePassword && (
            <Form.Item
              label='Confirm password'
              name='confirmPassword'
              rules={[{ required: true, message: 'Debes ingresar la nueva contraseña' }]}
            >
              <Input placeholder='Confirma tu contraseña' type='password' />
            </Form.Item>
          )}
          <Form.Item>
            <Button htmlType='submit' type='primary' block loading={loading}>
              {bottomText}
            </Button>
          </Form.Item>
        </Form>
        <Link className='text-xs no-underline' to={linkPath}>
          {linkText}
        </Link>
      </div>
    </div>
  )
}

export default Authcomponent
