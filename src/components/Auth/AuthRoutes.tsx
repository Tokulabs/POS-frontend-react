import { FC, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { logout } from '@/pages/Auth/helpers'
import { IAuthProps } from '@/types/AuthTypes'
import Loading from '@/components/Loading/Loading'
import { MainLayout } from '@/layouts/MainLayout/MainLayout'
import { Outlet, useNavigate } from 'react-router-dom'

export const AuthRoutes: FC = () => {
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const AuthProps: IAuthProps = {
    errorCallback: () => {
      navigate('/login')
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
