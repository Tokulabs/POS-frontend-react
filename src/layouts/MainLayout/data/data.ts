import {
  IconProps,
  IconPackage,
  IconShoppingCart,
  IconBuildingStore,
  IconCash,
} from '@tabler/icons-react'
import { UserRolesEnum } from '@/pages/Users/types/UserTypes'
import { ForwardRefExoticComponent, RefAttributes } from 'react'

interface NavigationMenuItem {
  label: string
  link?: string
  allowedRoles: string[]
  description?: string
  action?: string
  children?: NavigationMenuItem[]
  icon?: ForwardRefExoticComponent<Omit<IconProps, 'ref'> & RefAttributes<SVGSVGElement>>
  disabled?: boolean
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
        allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin],
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
        link: '/inventory-movements',
        allowedRoles: [
          UserRolesEnum.admin,
          UserRolesEnum.posAdmin,
          UserRolesEnum.shopAdmin,
          UserRolesEnum.storageAdmin,
        ],
        description: 'Registra y gestiona las devoluciones de productos fácilmente',
        action: '',
      },
      {
        label: 'Gestión de Inventario',
        link: '/inventory-management',
        allowedRoles: [
          UserRolesEnum.admin,
          UserRolesEnum.posAdmin,
        ],
        description: 'Crea y actualiza productos de manera masiva con archivos CSV',
        action: '',
      }
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
        disabled: true,
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
    allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.storageAdmin],
    children: [
      {
        label: 'Proveedores',
        link: '/providers',
        allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.storageAdmin],
        description: 'Administra y consulta la información de tus proveedores',
        action: '',
      },
      {
        label: 'Compras',
        link: '/purchases',
        allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin, UserRolesEnum.storageAdmin],
        description: 'Registra y gestiona las compras realizadas a proveedores',
        action: '',
      },
    ],
  },
  {
    label: 'Tienda',
    icon: IconBuildingStore,
    allowedRoles: [
      UserRolesEnum.admin,
      UserRolesEnum.posAdmin,
      UserRolesEnum.shopAdmin,
      UserRolesEnum.sales,
    ],
    children: [
      {
        label: 'Reportes',
        link: '',
        allowedRoles: [
          UserRolesEnum.admin,
          UserRolesEnum.posAdmin,
          UserRolesEnum.shopAdmin,
          UserRolesEnum.sales,
        ],
        description: 'Descarga y consulta reportes detallados de ventas y operaciones',
        action: 'openDownloadModal',
      },
      {
        label: 'Metas',
        link: '',
        action: 'openGoalsModal',
        allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin],
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
