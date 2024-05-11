import { FC, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { logout } from '../../pages/Auth/helpers'
import { IAuthProps } from '../../types/AuthTypes'
import Loading from '../Loading/Loading'
import { MainLayout } from '../../layouts/MainLayout/MainLayout'
import { Outlet } from 'react-router-dom'

export const AuthRoutes: FC = () => {
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

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  )
}

export default AuthRoutes
