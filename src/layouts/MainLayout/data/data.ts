import {
  IconFileInvoice,
  IconLayoutDashboard,
  IconPackages,
  IconReceipt,
  IconBoxMultiple,
  IconUsers,
  IconActivity,
  IconKey,
  IconDatabase,
  IconDeviceLandlinePhone,
  IconUsersGroup,
  IconProps,
  Icon,
  IconShoppingBag,
} from '@tabler/icons-react'
import { UserRolesEnum } from '@/pages/Users/types/UserTypes'
import { FC, ForwardRefExoticComponent, RefAttributes } from 'react'
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

interface ISideBarData {
  icon: ForwardRefExoticComponent<Omit<IconProps, 'ref'> & RefAttributes<Icon>>
  title: string
  path: string
  component: FC
  allowedRoles?: string[]
}

export const SideBarData: ISideBarData[] = [
  {
    icon: IconLayoutDashboard,
    title: 'Panel principal',
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
    icon: IconPackages,
    title: 'Inventarios Tiendas',
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
    icon: IconFileInvoice,
    title: 'Facturas',
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
    icon: IconReceipt,
    title: 'POS',
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
    icon: IconBoxMultiple,
    title: 'Categorias',
    component: InventoryGroups,
    path: '/inventory-groups',
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.storageAdmin],
  },
  {
    icon: IconUsers,
    title: 'Usuarios',
    component: Users,
    path: '/users',
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.shopAdmin],
  },
  {
    icon: IconActivity,
    title: 'Actividad de Usuarios',
    path: '/user-activities',
    component: UserActivities,
    allowedRoles: [UserRolesEnum.admin],
  },
  {
    icon: IconKey,
    title: 'Resoluciones DIAN',
    path: '/dian-resolution',
    component: Dian,
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin],
  },
  {
    icon: IconDatabase,
    title: 'Bodega',
    path: '/storage',
    component: Storage,
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.storageAdmin],
  },
  {
    icon: IconDeviceLandlinePhone,
    title: 'Datafonos',
    path: '/payment-terminals',
    component: PaymentTerminals,
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin],
  },
  {
    icon: IconUsersGroup,
    title: 'Proveedores',
    path: '/providers',
    component: Providers,
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.storageAdmin],
  },
  // {
  //   icon: IconShoppingBag,
  //   title: 'Compras',
  //   path: '/purchases',
  //   component: Purchase,
  //   allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.storageAdmin],
  // },
]
