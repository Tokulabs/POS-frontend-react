import { FC, useState } from 'react'
import Authcomponent from '@/components/Auth/AuthComponent'
import { IAuthProps } from '@/types/AuthTypes'
import { passwordRecoveryURL } from '@/utils/network'
import { createSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { axiosRequest } from '@/api/api'
import { DataPropsForm } from '@/types/GlobalTypes'
import { toast } from 'sonner'
import { Button, Form, Input } from 'antd'

const PasswordRecovery: FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const AuthProps: IAuthProps = {
    successCallback: () => {
      navigate('/')
    },
  }
  useAuth(AuthProps)

  const onSubmit = async (values: DataPropsForm) => {
    try {
      setLoading(true)
      const response = await axiosRequest<{ message: string }>({
        method: 'post',
        url: passwordRecoveryURL,
        payload: values,
        errorObject: {
          message: 'Error en la solicitud',
        },
      })
      if (response) {
        const { email } = values
        navigate({
          pathname: '/password-reset',
          search: createSearchParams({
            email: email as string,
          }).toString(),
        })
        toast.error(response.data.message)
      }
    } catch (e) {
      console.log(e)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Authcomponent titleText='Recuperar contraseña'>
      <Form layout='vertical' onFinish={onSubmit}>
        <Form.Item
          label='Correo electrónico'
          name='email'
          rules={[{ required: true, message: 'El correo es un campo obligaotrio' }]}
        >
          <Input placeholder='Correo electrónico' type='email' />
        </Form.Item>
        <Form.Item>
          <Button htmlType='submit' type='primary' block loading={loading}>
            Confirmar
          </Button>
        </Form.Item>
      </Form>
    </Authcomponent>
  )
}

export default PasswordRecovery
