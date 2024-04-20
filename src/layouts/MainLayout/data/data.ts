import {
  IconFileInvoice,
  IconLayoutDashboard,
  IconPackages,
  IconReceipt,
  IconBoxMultiple,
  IconUsers,
  IconBuildingStore,
  IconActivity,
  IconKey,
  IconDatabase,
  IconDeviceLandlinePhone,
  IconUsersGroup,
  IconProps,
  Icon,
} from '@tabler/icons-react'
import { UserRolesEnum } from '../../../pages/Users/types/UserTypes'
import { ForwardRefExoticComponent, RefAttributes } from 'react'
interface ISideBarData {
  icon: ForwardRefExoticComponent<Omit<IconProps, 'ref'> & RefAttributes<Icon>>
  title: string
  path: string
  allowedRoles?: string[]
}

export const SideBarData: ISideBarData[] = [
  {
    icon: IconLayoutDashboard,
    title: 'Panel principal',
    path: '/',
    allowedRoles: [
      UserRolesEnum.admin,
      UserRolesEnum.posAdmin,
      UserRolesEnum.sales,
      UserRolesEnum.shopAdmin,
      UserRolesEnum.supportSales,
    ],
  },
  {
    icon: IconPackages,
    title: 'Inventarios Tiendas',
    path: '/inventories',
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
    path: '/inventory-groups',
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin],
  },
  {
    icon: IconUsers,
    title: 'Usuarios',
    path: '/users',
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin],
  },
  {
    icon: IconBuildingStore,
    title: 'Puntos de Venta',
    path: '/shops',
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin],
  },
  {
    icon: IconActivity,
    title: 'Actividad de Usuarios',
    path: '/user-activities',
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin],
  },
  {
    icon: IconKey,
    title: 'Resoluciones DIAN',
    path: '/dian-resolution',
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin],
  },
  {
    icon: IconDatabase,
    title: 'Bodega',
    path: '/storage',
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin],
  },
  {
    icon: IconDeviceLandlinePhone,
    title: 'Datafonos',
    path: '/payment-terminals',
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin],
  },
  {
    icon: IconUsersGroup,
    title: 'Proveedores',
    path: '/providers',
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin],
  },
]
