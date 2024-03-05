import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { FC } from 'react'
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
import Storage from '../pages/Storage/Storage'
import { SideBarData } from '../layouts/MainLayout/data/data'
import { useRolePermissions } from '../hooks/useRolespermissions'
import PaymentTerminals from '../pages/PaymentTerminals/PaymentTerminals'

interface IRouteGuardian {
  element: FC
  allowedRoles: string[]
}

const RouteGuardian: FC<IRouteGuardian> = ({ element, allowedRoles }) => {
  const Element: FC = element
  const { hasPermission } = useRolePermissions(allowedRoles)

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
                      allowedRoles={
                        SideBarData.filter((item) => item.path === '/')[0].allowedRoles ?? []
                      }
                    />
                  }
                />
                <Route
                  path='/users'
                  element={
                    <RouteGuardian
                      element={() => <Users />}
                      allowedRoles={
                        SideBarData.filter((item) => item.path === '/users')[0].allowedRoles ?? []
                      }
                    />
                  }
                />
                <Route
                  path='/inventory-groups'
                  element={
                    <RouteGuardian
                      element={() => <InventoryGroup />}
                      allowedRoles={
                        SideBarData.filter((item) => item.path === '/inventory-groups')[0]
                          .allowedRoles ?? []
                      }
                    />
                  }
                />
                <Route
                  path='/inventories'
                  element={
                    <RouteGuardian
                      element={() => <Inventory />}
                      allowedRoles={
                        SideBarData.filter((item) => item.path === '/inventories')[0]
                          .allowedRoles ?? []
                      }
                    />
                  }
                />
                <Route
                  path='/shops'
                  element={
                    <RouteGuardian
                      element={() => <Shops />}
                      allowedRoles={
                        SideBarData.filter((item) => item.path === '/shops')[0].allowedRoles ?? []
                      }
                    />
                  }
                />
                <Route
                  path='/user-activities'
                  element={
                    <RouteGuardian
                      element={() => <UserActivities />}
                      allowedRoles={
                        SideBarData.filter((item) => item.path === '/user-activities')[0]
                          .allowedRoles ?? []
                      }
                    />
                  }
                />
                <Route
                  path='/purchase'
                  element={
                    <RouteGuardian
                      element={() => <Purchase />}
                      allowedRoles={
                        SideBarData.filter((item) => item.path === '/purchase')[0].allowedRoles ??
                        []
                      }
                    />
                  }
                />
                <Route
                  path='/invoices'
                  element={
                    <RouteGuardian
                      element={() => <Invoices />}
                      allowedRoles={
                        SideBarData.filter((item) => item.path === '/invoices')[0].allowedRoles ??
                        []
                      }
                    />
                  }
                />
                <Route
                  path='/dian-resolution'
                  element={
                    <RouteGuardian
                      element={() => <Dian />}
                      allowedRoles={
                        SideBarData.filter((item) => item.path === '/dian-resolution')[0]
                          .allowedRoles ?? []
                      }
                    />
                  }
                />
                <Route
                  path='/storage'
                  element={
                    <RouteGuardian
                      element={() => <Storage />}
                      allowedRoles={
                        SideBarData.filter((item) => item.path === '/storage')[0].allowedRoles ?? []
                      }
                    />
                  }
                />
                <Route
                  path='/payment-terminals'
                  element={
                    <RouteGuardian
                      element={() => <PaymentTerminals />}
                      allowedRoles={
                        SideBarData.filter((item) => item.path === '/payment-terminals')[0]
                          .allowedRoles ?? []
                      }
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
