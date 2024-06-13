import { FC } from 'react'
import { RouteObject, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { SideBarData } from '../layouts/MainLayout/data/data'
import Login from '../pages/Auth/Login'
import CheckUser from '../pages/Auth/CheckUser'
import UpdateUserPassword from '../pages/Auth/UpdateUserPassword'
import AuthRoutes from '../components/Auth/AuthRoutes'
import { useRolePermissions } from '../hooks/useRolespermissions'
import Notfound from '../pages/NotFound/404Notfound'
import { MainLayout } from '../layouts/MainLayout/MainLayout'
import { useAuth } from '../hooks/useAuth'

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
      path: '/check-user',
      element: <CheckUser />,
    },
    {
      path: '/create-password',
      element: <UpdateUserPassword />,
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
