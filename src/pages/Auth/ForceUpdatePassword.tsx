import { FC, useState } from 'react'
import Authcomponent from '@/components/Auth/AuthComponent'
import { IAuthProps } from '@/types/AuthTypes'
import { forceUpdatePasswordURL } from '@/utils/network'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { axiosRequest } from '@/api/api'
import { ForceUpdatePassword, formSchema } from '@/components/AuthForms/ForceUpdatePassword'
import { toast } from 'sonner'
import { z } from 'zod'


const ForceUpdatePasswordAuth: FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)

  const AuthProps: IAuthProps = {
    successCallback: () => {
      navigate('/')
    },
  }
  useAuth(AuthProps)

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { passwordOne } = values
    const email = searchParams.get('email')
    const session = searchParams.get('session')
    try {
      setLoading(true)
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
    } catch (e) {
      console.log(e)
      navigate('/')
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