import { FC, useState } from 'react'
import Authcomponent from '@/components/Auth/AuthComponent'
import { IAuthProps } from '@/types/AuthTypes'
import { passswordResetURL } from '@/utils/network'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { axiosRequest } from '@/api/api'
import { DataPropsForm } from '@/types/GlobalTypes'
import { toast } from 'sonner'
import { PasswordResetForm } from '@/components/AuthForms/PasswordResetForm'

const PasswordReset: FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)

  const AuthProps: IAuthProps = {
    successCallback: () => {
      navigate('/')
    },
  }
  useAuth(AuthProps)

  const onSubmit = async (values: DataPropsForm) => {
    const { confirmation_code, password } = values
    const email = searchParams.get('email')
    try {
      setLoading(true)
      const response = await axiosRequest<{ message: string }>({
        method: 'post',
        url: passswordResetURL,
        payload: {
          email,
          confirmation_code,
          new_password: password,
        },
        errorObject: {
          message: 'Error en la solicitud',
        },
      })
      if (response) {
        navigate('/')
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
      <PasswordResetForm onSubmit={onSubmit} loading={loading} />
    </Authcomponent>
  )
}

export default PasswordReset
