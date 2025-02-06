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
import ImageCarousel from '@/components/Carrousel/Carrousel'

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
    <div className='flex w-100'>
      <div className='md:w-[50%] min-h-[100vh] bg-gray-200 md:flex items-center justify-center hidden'>
        <ImageCarousel></ImageCarousel>
      </div>
      <div className='w-[50%] min-h-[100vh] flex flex-col items-center justify-center'>
        <div className='min-w-[400px]'>
          <Authcomponent>
            <LoginForm onSubmit={onSubmit} loading={loading} />
          </Authcomponent>
        </div>
        <p className="text-base ml-[0px] justify-center font-semibold items-center p-4 fixed bottom-9">
          © 2024 Toku Softlabs S.A.S. Todos los derechos reservados
         </p>
      </div>
    </div>
  )
}

export default Login