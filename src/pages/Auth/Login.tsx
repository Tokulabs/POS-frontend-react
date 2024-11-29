import { FC, useState } from 'react'
import Authcomponent from '@/components/Auth/AuthComponent'
import { IAuthProps, ILoginResponseData } from '@/types/AuthTypes'
import { loginURL } from '@/utils/network'
import { tokenName } from '@/utils/constants'
import { useNavigate, createSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { axiosRequest } from '@/api/api'
import { DataPropsForm } from '@/types/GlobalTypes'
import { LoginForm } from '@/components/AuthForms/Login'

const Login: FC = () => {
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
      const response = await axiosRequest<ILoginResponseData>({
        method: 'post',
        url: loginURL,
        payload: values,
        errorObject: {
          message: 'Error al iniciar sesión',
        },
      })
      if (response) {
        const accessType = Object.keys(response.data)[0]
        if (accessType === 'access') {
          localStorage.setItem(tokenName, response.data.access ?? '')
          navigate('/')
          return
        }
        const { email } = values
        navigate({
          pathname: '/force-update-password',
          search: createSearchParams({
            email: email as string,
            session: response.data.session ?? '',
          }).toString(),
        })
      }
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Authcomponent>
      <LoginForm onSubmit={onSubmit} loading={loading} />
    </Authcomponent>
  )
}

export default Login
