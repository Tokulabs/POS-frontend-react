import { FC, PropsWithChildren, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import MainLayout from '../../layouts/MainLayout/MainLayout'
import { logout } from '../../pages/Auth/helpers'
import { IAuthProps } from '../../types/AuthTypes'
import Loading from '../Loading/Loading'

export const AuthRoutes: FC<PropsWithChildren> = ({ children }) => {
  const [loading, setLoading] = useState(true)

  const AuthProps: IAuthProps = {
    errorCallback: () => {
      logout()
    },
    successCallback: () => {
      setLoading(false)
    },
  }
  useAuth(AuthProps)

  if (loading) {
    return <Loading />
  }

  return <MainLayout>{children}</MainLayout>
}

export default AuthRoutes
