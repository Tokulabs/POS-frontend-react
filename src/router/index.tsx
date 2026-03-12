import { FC, useContext } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import Login from '@/pages/Auth/Login'
import ForceUpdatePassword from '@/pages/Auth/ForceUpdatePassword'
import AuthRoutes from '@/components/Auth/AuthRoutes'
import Notfound from '@/pages/NotFound/404Notfound'
import { useAuth } from '@/hooks/useAuth'
import { MainLayout } from '@/layouts/MainLayout/MainLayout'
import PasswordRecovery from '@/pages/Auth/PasswordRecovery'
import PasswordReset from '@/pages/Auth/PasswordReset'
import { store } from '@/store/index'
import { useSubscription } from '@/hooks/useSubscription'
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
import { Profile } from '@/pages/Profile/Profile'
import { InventoryMovement } from '@/pages/InventoryMovement/InventoryMovement'
import { InventoryManagement } from '@/pages/InventoryManagement/InventoryMangament'
import { InvoiceItem } from '@/pages/InvoiceItem/InvoiceItem'
import Register from '@/pages/Auth/Register'

interface ISideBarData {
  path: string
  component: FC
  requiredPermission?: string
  requiredAnyPermission?: string[]
  requiredFeatureFlag?: string
}

const authRoutes: ISideBarData[] = [
  { path: '/', component: Home, requiredPermission: 'can_view_dashboard_reports' },
  { path: '/inventories', component: Inventories, requiredPermission: 'can_view_inventory' },
  { path: '/invoices', component: Invoices, requiredPermission: 'can_view_invoices' },
  { path: '/invoice/:id', component: InvoiceItem, requiredPermission: 'can_view_invoices' },
  { path: '/pos', component: POS, requiredPermission: 'can_create_invoice' },
  { path: '/inventory-groups', component: InventoryGroups, requiredPermission: 'can_manage_categories' },
  { path: '/users', component: Users, requiredPermission: 'can_manage_users', requiredFeatureFlag: 'can_manage_users' },
  { path: '/user-activities', component: UserActivities, requiredPermission: 'can_view_user_activities', requiredFeatureFlag: 'can_view_user_activities' },
  { path: '/dian-resolution', component: Dian, requiredPermission: 'can_manage_dian' },
  { path: '/storage', component: Storage, requiredPermission: 'can_manage_storage', requiredFeatureFlag: 'can_manage_storage' },
  { path: '/payment-terminals', component: PaymentTerminals, requiredPermission: 'can_manage_company', requiredFeatureFlag: 'can_edit_payment_methods' },
  { path: '/providers', component: Providers, requiredPermission: 'can_manage_providers', requiredFeatureFlag: 'can_manage_providers' },
  { path: '/purchases', component: Purchase, requiredAnyPermission: ['can_view_purchases', 'can_create_purchase'], requiredFeatureFlag: 'can_view_purchases' },
  { path: '/inventory-movements', component: InventoryMovement, requiredAnyPermission: ['can_view_inventory_movements', 'can_create_shipment_movement', 'can_create_return_movement'], requiredFeatureFlag: 'can_view_inventory_movements' },
  { path: '/inventory-movement/:id', component: InventoryMovementItem, requiredAnyPermission: ['can_view_inventory_movements', 'can_create_shipment_movement', 'can_create_return_movement'], requiredFeatureFlag: 'can_view_inventory_movements' },
  { path: '/inventory-management', component: InventoryManagement, requiredPermission: 'can_import_inventory', requiredFeatureFlag: 'can_import_inventory' },
  { path: '/settings', component: Profile },
]

const Router: FC = () => {
  const { isLogged } = useAuth({})
  const { state } = useContext(store)
  const userPermissions = state.user?.company_role?.permissions ?? []
  const { featureFlags } = useSubscription()

  const router = createBrowserRouter([
    {
      element: <AuthRoutes />,
      children: authRoutes.map((item) => {
        let hasPermission = true

        if (item.requiredPermission) {
          hasPermission = userPermissions.some((p) => p.codename === item.requiredPermission)
        } else if (item.requiredAnyPermission) {
          hasPermission = item.requiredAnyPermission.some((code) =>
            userPermissions.some((p) => p.codename === code),
          )
        }

        // Also check plan-level feature flag
        if (item.requiredFeatureFlag) {
          const flagEnabled = featureFlags[item.requiredFeatureFlag] ?? false
          if (!flagEnabled) hasPermission = false
        }

        const Component = item.component
        return hasPermission
          ? { path: item.path, element: <Component /> }
          : { path: '*', element: <Notfound /> }
      }),
    },
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/force-update-password', element: <ForceUpdatePassword /> },
    { path: '/password-recovery', element: <PasswordRecovery /> },
    { path: '/password-reset', element: <PasswordReset /> },
    {
      path: '*',
      element: isLogged ? (
        <MainLayout><Notfound /></MainLayout>
      ) : (
        <Notfound fullscreen={true} />
      ),
    },
  ])

  return <RouterProvider router={router} />
}

export { Router }
