import { FC, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { logout } from '@/pages/Auth/helpers'
import { IAuthProps } from '@/types/AuthTypes'
import Loading from '@/components/Loading/Loading'
import { MainLayout } from '@/layouts/MainLayout/MainLayout'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useCurrentPlan } from '@/hooks/useSubscription'
import { IconLock } from '@tabler/icons-react'

export const AuthRoutes: FC = () => {
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const currentPlan = useCurrentPlan()
  const { pathname } = useLocation()

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

  const isExpired =
    currentPlan !== null &&
    currentPlan.billing_period !== 'lifetime' &&
    pathname !== '/settings/subscription' &&
    (currentPlan.status === 'past_due' ||
      (currentPlan.days_until_expiry !== null && currentPlan.days_until_expiry <= 0))

  if (isExpired) {
    return (
      <MainLayout>
        <div className='flex flex-col items-center justify-center h-full gap-4 p-8 text-center'>
          <div className='rounded-full bg-destructive/10 p-5'>
            <IconLock size={36} className='text-destructive' />
          </div>
          <h2 className='text-2xl font-bold text-foreground'>Suscripción vencida</h2>
          <p className='text-muted-foreground max-w-md'>
            Tu plan <span className='font-medium text-foreground'>{currentPlan!.name}</span> ha vencido.
            Contacta a soporte para renovarlo y recuperar el acceso.
          </p>
          <Link
            to='/settings/subscription'
            className='px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity'
          >
            Ver suscripción
          </Link>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  )
}

export default AuthRoutes