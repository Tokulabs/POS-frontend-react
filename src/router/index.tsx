import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { FC, useContext } from 'react'
import Login from '../pages/Auth/Login'
import CheckUser from '../pages/Auth/CheckUser'
import Home from './../pages/Home/Home'
import { AuthRoutes } from './../components/Auth/AuthRoutes'
import Users from '../pages/Users/Users'
import UpdateUserPassword from '../pages/Auth/UpdateUserPassword'
import InventoryGroup from '../pages/Groups/InventoryGroups'
import Inventory from '../pages/Inventories/Inventories'
import Shops from '../pages/Shops/Shops'
import UserActivities from './../pages/UserActivities/UserActivities'
import Purchase from '../pages/Purchase/Purchase'
import Invoices from './../pages/Invoices/Invoices'
import Notfound from '../pages/NotFound/404Notfound'
import Dian from '../pages/Dian/Dian'
import { store } from '../store'
import { UserRolesEnum } from '../pages/Users/types/UserTypes'

interface IRouteGuardian {
  element: FC
  allowedRoles: string[]
}

const RouteGuardian: FC<IRouteGuardian> = ({ element, allowedRoles }) => {
  const { state } = useContext(store)
  const hasPermission = allowedRoles.includes(
    UserRolesEnum[state.user?.role as keyof typeof UserRolesEnum],
  )
  const Element: FC = element

  return hasPermission ? <Element /> : <Notfound />
}

export const Router: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/check-user' element={<CheckUser />} />
        <Route path='/create-password' element={<UpdateUserPassword />} />
        <Route
          path='*'
          element={
            <AuthRoutes>
              <Routes>
                <Route
                  path='/'
                  element={
                    <RouteGuardian
                      element={() => <Home />}
                      allowedRoles={[
                        UserRolesEnum.admin,
                        UserRolesEnum.posAdmin,
                        UserRolesEnum.sales,
                        UserRolesEnum.shopAdmin,
                        UserRolesEnum.supportSales,
                      ]}
                    />
                  }
                />
                <Route
                  path='/users'
                  element={
                    <RouteGuardian
                      element={() => <Users />}
                      allowedRoles={[UserRolesEnum.admin, UserRolesEnum.posAdmin]}
                    />
                  }
                />
                <Route
                  path='/inventory-groups'
                  element={
                    <RouteGuardian
                      element={() => <InventoryGroup />}
                      allowedRoles={[
                        UserRolesEnum.admin,
                        UserRolesEnum.posAdmin,
                        UserRolesEnum.shopAdmin,
                      ]}
                    />
                  }
                />
                <Route
                  path='/inventories'
                  element={
                    <RouteGuardian
                      element={() => <Inventory />}
                      allowedRoles={[
                        UserRolesEnum.admin,
                        UserRolesEnum.posAdmin,
                        UserRolesEnum.shopAdmin,
                      ]}
                    />
                  }
                />
                <Route
                  path='/shops'
                  element={
                    <RouteGuardian
                      element={() => <Shops />}
                      allowedRoles={[UserRolesEnum.admin, UserRolesEnum.posAdmin]}
                    />
                  }
                />
                <Route
                  path='/user-activities'
                  element={
                    <RouteGuardian
                      element={() => <UserActivities />}
                      allowedRoles={[UserRolesEnum.admin, UserRolesEnum.posAdmin]}
                    />
                  }
                />
                <Route
                  path='/purchase'
                  element={
                    <RouteGuardian
                      element={() => <Purchase />}
                      allowedRoles={[
                        UserRolesEnum.admin,
                        UserRolesEnum.posAdmin,
                        UserRolesEnum.sales,
                        UserRolesEnum.shopAdmin,
                        UserRolesEnum.supportSales,
                      ]}
                    />
                  }
                />
                <Route
                  path='/invoices'
                  element={
                    <RouteGuardian
                      element={() => <Invoices />}
                      allowedRoles={[
                        UserRolesEnum.admin,
                        UserRolesEnum.posAdmin,
                        UserRolesEnum.shopAdmin,
                      ]}
                    />
                  }
                />
                <Route
                  path='/dian-resolution'
                  element={
                    <RouteGuardian
                      element={() => <Dian />}
                      allowedRoles={[UserRolesEnum.admin, UserRolesEnum.posAdmin]}
                    />
                  }
                />
                <Route path='*' element={<Notfound />} />
              </Routes>
            </AuthRoutes>
          }
        ></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default Router
