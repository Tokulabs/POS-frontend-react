import { FC, useState } from 'react'
import ImageCarousel from '@/components/Carrousel/Carrousel'
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
    <div className="flex w-100 h-100">
  <div className="md:w-[50%] min-h-[100vh] bg-gray-200 md:flex items-center justify-center hidden">
    <ImageCarousel/>
  </div>
  <div className="w-[50%] min-h-[100vh] flex flex-col items-center justify-center">
    <div className="w-[60%] h-[100%] translate-y-[-15px] scale-95">
      <PasswordResetForm onSubmit={onSubmit} loading={loading} />
    </div>
    <p className="text-base font-semibold p-4 fixed bottom-9 text-center">
      © 2024 Toku Softlabs S.A.S. Todos los derechos reservados
    </p>
  </div>
</div>
  )
}

export default PasswordReset
