import { FC } from 'react'
import { RouteObject, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { SideBarData } from '../layouts/MainLayout/data/data'
import Login from '../pages/Auth/Login'
import CheckUser from '../pages/Auth/CheckUser'
import UpdateUserPassword from '../pages/Auth/UpdateUserPassword'
import AuthRoutes from '../components/Auth/AuthRoutes'

const Router: FC = () => {
  const router = createBrowserRouter([
    {
      element: <AuthRoutes />,
      children: SideBarData.map((item) => {
        const Component = item.component
        const routerData: RouteObject = {
          path: item.path,
          element: <Component />,
        }
        return routerData
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
      element: <h1>404</h1>,
    },
  ])

  return <RouterProvider router={router} />
}

export { Router }
