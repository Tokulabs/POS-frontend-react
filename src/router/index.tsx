import { FC } from 'react'
import { RouteObject, RouterProvider, createBrowserRouter } from 'react-router-dom'
import Login from '@/pages/Auth/Login'
import ForceUpdatePassword from '@/pages/Auth/ForceUpdatePassword'
import AuthRoutes from '@/components/Auth/AuthRoutes'
import { useRolePermissions } from '@/hooks/useRolespermissions'
import Notfound from '@/pages/NotFound/404Notfound'
import { useAuth } from '@/hooks/useAuth'
import { MainLayout } from '@/layouts/MainLayout/MainLayout'
import { SideBarData } from '@/layouts/MainLayout/data/data'
import PasswordRecovery from '@/pages/Auth/PasswordRecovery'
import PasswordReset from '@/pages/Auth/PasswordReset'

const Router: FC = () => {
  const { isLogged } = useAuth({})
  const router = createBrowserRouter([
    {
      element: <AuthRoutes />,
      children: SideBarData.map((item) => {
        const { hasPermission } = useRolePermissions({ allowedRoles: item.allowedRoles || [] })
        const Component = item.component
        const routerData: RouteObject = {
          path: item.path,
          element: <Component />,
        }
        return hasPermission
          ? routerData
          : {
              path: '*',
              element: <Notfound />,
            }
      }),
    },
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/force-update-password',
      element: <ForceUpdatePassword />,
    },
    {
      path: '/password-recovery',
      element: <PasswordRecovery />,
    },
    {
      path: '/password-reset',
      element: <PasswordReset />,
    },
    {
      path: '*',
      element: isLogged ? (
        <MainLayout>
          <Notfound />
        </MainLayout>
      ) : (
        <Notfound fullscreen={true} />
      ),
    },
  ])

  return <RouterProvider router={router} />
}

export { Router }
