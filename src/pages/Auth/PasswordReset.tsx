import { FC, useState } from 'react'
import Authcomponent from '@/components/Auth/AuthComponent'
import { IAuthProps } from '@/types/AuthTypes'
import { passswordResetURL } from '@/utils/network'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { axiosRequest } from '@/api/api'
import { toast } from 'sonner'
import { PasswordResetForm, formSchema } from '@/components/AuthForms/PasswordResetForm'
import { z } from 'zod'

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { passwordOne, verificationCode } = values
    const email = searchParams.get('email')
    try {
      setLoading(true)
      const response = await axiosRequest<{ message: string }>({
        method: 'post',
        url: passswordResetURL,
        payload: {
          email,
          confirmation_code: verificationCode,
          new_password: passwordOne,
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
      navigate(`/password-reset?email=${encodeURIComponent(email ?? '')}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <Authcomponent>
        <PasswordResetForm onSubmit={onSubmit} loading={loading} />
      </Authcomponent>
    </section>
  )
}

export default PasswordReset
