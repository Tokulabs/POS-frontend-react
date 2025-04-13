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
  IconPackage,
  IconShoppingCart,
  IconBuildingStore,
  IconCash,
  IconShoppingBag,
} from '@tabler/icons-react'
import { UserRolesEnum } from '@/pages/Users/types/UserTypes'
import { FC, ForwardRefExoticComponent, RefAttributes, ReactNode } from 'react'
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

interface ISideBarData {
  icon?: ForwardRefExoticComponent<Omit<IconProps, 'ref'> & RefAttributes<Icon>>
  title: string
  path: string
  component: FC
  allowedRoles?: string[]
  action?: string
  showInSideBar?: boolean
}

interface NavigationMenuItem {
  label: string
  link?: string
  allowedRoles: string[]
  description?: string
  action?: string
  children?: NavigationMenuItem[]
  icon?: ForwardRefExoticComponent<Omit<IconProps, 'ref'> & RefAttributes<Icon>>
}

export const navigationMenu: NavigationMenuItem[] = [
  {
    label: 'Inventario',
    icon: IconPackage,
    allowedRoles: [
      UserRolesEnum.admin,
      UserRolesEnum.posAdmin,
      UserRolesEnum.sales,
      UserRolesEnum.shopAdmin,
      UserRolesEnum.storageAdmin,
    ],
    children: [
      {
        label: 'Bodega',
        link: '/storage',
        allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.storageAdmin],
        description: 'Gestione el inventario y controle el stock disponible',
        action: '',
      },
      {
        label: 'Categoría',
        link: '/inventory-groups',
        allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.storageAdmin],
        description: 'Clasifica y organiza los productos para una gestión más eficiente',
        action: '',
      },
      {
        label: 'Productos',
        link: '/inventories',
        allowedRoles: [
          UserRolesEnum.admin,
          UserRolesEnum.posAdmin,
          UserRolesEnum.shopAdmin,
          UserRolesEnum.sales,
        ],
        action: '',
        description: 'Administra y visualiza todos los productos disponibles en la tienda',
      },
      {
        label: 'Movimiento de Inventarios',
        link: '**',
        allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.shopAdmin],
        description: 'Registra y gestiona las devoluciones de productos fácilmente',
        action: '',
      },
    ],
  },
  {
    label: 'Ventas',
    icon: IconShoppingCart,
    allowedRoles: [
      UserRolesEnum.admin,
      UserRolesEnum.posAdmin,
      UserRolesEnum.sales,
      UserRolesEnum.shopAdmin,
      UserRolesEnum.storageAdmin,
      UserRolesEnum.supportSales,
    ],
    children: [
      {
        label: 'Clientes',
        link: '**',
        allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.shopAdmin],
        description: 'Administra y consulta la información de tus clientes',
      },
      {
        label: 'Facturas de Venta',
        link: '/invoices',
        allowedRoles: [
          UserRolesEnum.admin,
          UserRolesEnum.posAdmin,
          UserRolesEnum.shopAdmin,
          UserRolesEnum.sales,
          UserRolesEnum.supportSales,
        ],
        description: 'Genera, visualiza y administra facturas de ventas fácilmente',
        action: '',
      },
      {
        label: 'Datáfonos',
        link: '/payment-terminals',
        allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin],
        description: 'Gestiona los dispositivos de pago electrónico disponibles',
        action: '',
      },
      {
        label: 'Resoluciones DIAN',
        link: '/dian-resolution',
        action: '',
        allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin],
        description: 'Solo puedes tener una resolución activa a la vez por tipo',
      },
    ],
  },
  {
    label: 'Compras',
    icon: IconCash,
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.shopAdmin],
    children: [
      {
        label: 'Proveedores',
        link: '/providers',
        allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.shopAdmin],
        description: 'Administra y consulta la información de tus proveedores',
        action: '',
      },
      {
        label: 'Compras',
        link: '/purchases',
        allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin],
        description: 'Registra y gestiona las compras realizadas a proveedores',
        action: '',
      },
    ],
  },
  {
    label: 'Tienda',
    icon: IconBuildingStore,
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.shopAdmin],
    children: [
      {
        label: 'Reportes',
        link: '',
        allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.shopAdmin],
        description: 'Descarga y consulta reportes detallados de ventas y operaciones',
        action: 'openDownloadModal',
      },
      {
        label: 'Metas',
        link: '',
        action: 'openGoalsModal',
        allowedRoles: [
          UserRolesEnum.admin,
          UserRolesEnum.posAdmin,
          UserRolesEnum.sales,
          UserRolesEnum.shopAdmin,
          UserRolesEnum.storageAdmin,
        ],
        description: 'Crea y gestiona objetivos de ventas para tu negocio',
      },
      {
        label: 'Usuarios',
        link: '/users',
        allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.shopAdmin],
        description: 'Gestiona y agrega usuarios a tu negocio',
      },
    ],
  },
]

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
    showInSideBar: true,
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
    showInSideBar: true,
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
    showInSideBar: true,
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
    showInSideBar: true,
  },
  {
    icon: IconBoxMultiple,
    title: 'Categorias',
    component: InventoryGroups,
    path: '/inventory-groups',
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.storageAdmin],
    showInSideBar: true,
  },
  {
    icon: IconUsers,
    title: 'Usuarios',
    component: Users,
    path: '/users',
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.shopAdmin],
    showInSideBar: true,
  },
  {
    icon: IconActivity,
    title: 'Actividad de Usuarios',
    path: '/user-activities',
    component: UserActivities,
    allowedRoles: [UserRolesEnum.admin],
    showInSideBar: true,
  },
  {
    icon: IconKey,
    title: 'Resoluciones DIAN',
    path: '/dian-resolution',
    component: Dian,
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin],
    showInSideBar: true,
  },
  {
    icon: IconDatabase,
    title: 'Bodega',
    path: '/storage',
    component: Storage,
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.storageAdmin],
    showInSideBar: true,
  },
  {
    icon: IconDeviceLandlinePhone,
    title: 'Datafonos',
    path: '/payment-terminals',
    component: PaymentTerminals,
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin],
    showInSideBar: true,
  },
  {
    icon: IconUsersGroup,
    title: 'Proveedores',
    path: '/providers',
    component: Providers,
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.storageAdmin],
    showInSideBar: true,
  },
  {
    icon: IconShoppingBag,
    title: 'Compras',
    path: '/purchases',
    component: Purchase,
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.storageAdmin],
    showInSideBar: true,
  },
  {
    icon: undefined,
    path: 'inventory-movement/:id',
    component: InventoryMovementItem,
    title: 'Detalle de movimiento',
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.storageAdmin],
    showInSideBar: false,
  },
]
