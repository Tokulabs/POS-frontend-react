import { FC, useState } from 'react'
import Authcomponent from '@/components/Auth/AuthComponent'
import { ForceUpdatePassword, formSchema } from '@/components/AuthForms/ForceUpdatePassword'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { IAuthProps } from '@/types/AuthTypes'
import { toast } from 'sonner'
import { forceUpdatePasswordURL } from '@/utils/network'
import { axiosRequest } from '@/api/api'
import { z } from 'zod'

const ForceUpdatePasswordAuth: FC = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const AuthProps: IAuthProps = {
    successCallback: () => {
      navigate('/')
    },
  }
  useAuth(AuthProps)

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      const { passwordOne } = values
      const email = searchParams.get('email')
      const session = searchParams.get('session')
      const response = await axiosRequest<{ message: string }>({
        method: 'post',
        url: forceUpdatePasswordURL,
        payload: {
          email,
          new_password: passwordOne,
          session,
        },
        errorObject: {
          message: 'Error al actualizar contraseña',
        },
      })
      if (response) {
        navigate('/')
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error('Error al enviar la contraseña:', error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <Authcomponent titleText='Cambio de contraseña'>
      <ForceUpdatePassword onSubmit={onSubmit} loading={loading} />
    </Authcomponent>
  )
}

export default ForceUpdatePasswordAuth
