import { FC } from 'react'
import { RouteObject, RouterProvider, createBrowserRouter } from 'react-router-dom'
import Login from '@/pages/Auth/Login'
import ForceUpdatePassword from '@/pages/Auth/ForceUpdatePassword'
import AuthRoutes from '@/components/Auth/AuthRoutes'
import { useRolePermissions } from '@/hooks/useRolespermissions'
import Notfound from '@/pages/NotFound/404Notfound'
import { useAuth } from '@/hooks/useAuth'
import { MainLayout } from '@/layouts/MainLayout/MainLayout'
import PasswordRecovery from '@/pages/Auth/PasswordRecovery'
import PasswordReset from '@/pages/Auth/PasswordReset'
// Pages

import { Home } from '@/pages/Home/Home'
import { Inventories } from '@/pages/Inventories/Inventories'
import { Invoices } from '@/pages/Invoices/Invoices'
import { POS } from '@/pages/POS/POS'
import { InventoryGroups } from '@/pages/Groups/InventoryGroups'
import { Users } from '@/pages/Users/Users'
import { UserActivities } from '@/pages/UserActivities/UserActivities'
import { Dian } from '@/pages/Dian/Dian'
import { Storage } from '@/pages/Storage/Storage'
import { PaymentTerminals } from '@/pages/PaymentTerminals/PaymentTerminals'
import { Providers } from '@/pages/Providers/Providers'
import { Purchase } from '@/pages/Purchase/Purchase'
import { InventoryMovementItem } from '@/pages/InventoryMovementItem/InventoryMovements'
// Types
import { UserRolesEnum } from '@/pages/Users/types/UserTypes'
import { InventoryMovement } from '@/pages/InventoryMovement/InventoryMovement'
import Settings from '@/pages/Settings/Settings'

interface ISideBarData {
  path: string
  component: FC
  allowedRoles?: string[]
}

const authRoutes: ISideBarData[] = [
  {
    path: '/',
    component: Home,
    allowedRoles: [
      UserRolesEnum.admin,
      UserRolesEnum.posAdmin,
      UserRolesEnum.sales,
      UserRolesEnum.shopAdmin,
      UserRolesEnum.supportSales,
      UserRolesEnum.storageAdmin,
    ],
  },
  {
    path: '/inventories',
    component: Inventories,
    allowedRoles: [
      UserRolesEnum.admin,
      UserRolesEnum.posAdmin,
      UserRolesEnum.shopAdmin,
      UserRolesEnum.sales,
    ],
  },
  {
    path: '/invoices',
    component: Invoices,
    allowedRoles: [
      UserRolesEnum.admin,
      UserRolesEnum.posAdmin,
      UserRolesEnum.shopAdmin,
      UserRolesEnum.sales,
      UserRolesEnum.supportSales,
    ],
  },
  {
    path: '/pos',
    component: POS,
    allowedRoles: [
      UserRolesEnum.admin,
      UserRolesEnum.posAdmin,
      UserRolesEnum.sales,
      UserRolesEnum.shopAdmin,
      UserRolesEnum.supportSales,
    ],
  },
  {
    component: InventoryGroups,
    path: '/inventory-groups',
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin],
  },
  {
    component: Users,
    path: '/users',
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.shopAdmin],
  },
  {
    path: '/user-activities',
    component: UserActivities,
    allowedRoles: [UserRolesEnum.admin],
  },
  {
    path: '/dian-resolution',
    component: Dian,
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin],
  },
  {
    path: '/storage',
    component: Storage,
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.storageAdmin],
  },
  {
    path: '/payment-terminals',
    component: PaymentTerminals,
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin],
  },
  {
    path: '/providers',
    component: Providers,
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.storageAdmin],
  },
  {
    path: '/purchases',
    component: Purchase,
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.storageAdmin],
  },
  {
    path: '/inventory-movements',
    component: InventoryMovement,
    allowedRoles: [
      UserRolesEnum.admin,
      UserRolesEnum.posAdmin,
      UserRolesEnum.storageAdmin,
      UserRolesEnum.shopAdmin,
    ],
  },
  {
    path: '/inventory-movement/:id',
    component: InventoryMovementItem,
    allowedRoles: [
      UserRolesEnum.admin,
      UserRolesEnum.posAdmin,
      UserRolesEnum.storageAdmin,
      UserRolesEnum.shopAdmin,
    ],
  },
  {
    path: '/settings',
    component: Settings,
    allowedRoles: [
      UserRolesEnum.admin,
      UserRolesEnum.posAdmin,
      UserRolesEnum.sales,
      UserRolesEnum.shopAdmin,
      UserRolesEnum.supportSales,
      UserRolesEnum.storageAdmin,
    ],
  },
]

const Router: FC = () => {
  const { isLogged } = useAuth({})
  const router = createBrowserRouter([
    {
      element: <AuthRoutes />,
      children: authRoutes.map((item) => {
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
