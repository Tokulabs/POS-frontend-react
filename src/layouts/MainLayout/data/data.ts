import {
  IconProps,
  IconPackage,
  IconShoppingCart,
  IconBuildingStore,
  IconCash,
  IconToolsKitchen2,
} from '@tabler/icons-react'
import { ForwardRefExoticComponent, RefAttributes } from 'react'

interface NavigationMenuItem {
  label: string
  link?: string
  requiredPermission?: string
  requiredAnyPermission?: string[]
  requiredFeatureFlag?: string
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
    children: [
      {
        label: 'Bodega',
        link: '/storage',
        requiredPermission: 'can_manage_storage',
        requiredFeatureFlag: 'can_manage_storage',
        description: 'Gestione el inventario y controle el stock disponible',
        action: '',
      },
      {
        label: 'Categoría',
        link: '/inventory-groups',
        requiredPermission: 'can_manage_categories',
        description: 'Clasifica y organiza los productos para una gestión más eficiente',
        action: '',
      },
      {
        label: 'Productos',
        link: '/inventories',
        requiredPermission: 'can_view_inventory',
        action: '',
        description: 'Administra y visualiza todos los productos disponibles en la tienda',
      },
      {
        label: 'Movimiento de Inventarios',
        link: '/inventory-movements',
        requiredAnyPermission: ['can_view_inventory_movements', 'can_create_shipment_movement', 'can_create_return_movement'],
        requiredFeatureFlag: 'can_view_inventory_movements',
        description: 'Registra y gestiona las devoluciones de productos fácilmente',
        action: '',
      },
      {
        label: 'Gestión de Inventario',
        link: '/inventory-management',
        requiredPermission: 'can_import_inventory',
        requiredFeatureFlag: 'can_import_inventory',
        description: 'Crea y actualiza productos de manera masiva con archivos CSV',
        action: '',
      }
    ],
  },
  {
    label: 'Ventas',
    icon: IconShoppingCart,
    children: [
      {
        label: 'Clientes',
        link: '**',
        description: 'Administra y consulta la información de tus clientes',
        disabled: true,
      },
      {
        label: 'Facturas de Venta',
        link: '/invoices',
        requiredPermission: 'can_view_invoices',
        description: 'Genera, visualiza y administra facturas de ventas fácilmente',
        action: '',
      },
      {
        label: 'Notas Crédito',
        link: '/credit-notes',
        requiredPermission: 'can_view_credit_notes',
        requiredFeatureFlag: 'can_use_credit_notes',
        description: 'Crea y envía notas crédito electrónicas a la DIAN',
        action: '',
      },
      {
        label: 'Datáfonos',
        link: '/payment-terminals',
        requiredPermission: 'can_manage_company',
        requiredFeatureFlag: 'can_edit_payment_methods',
        description: 'Gestiona los dispositivos de pago electrónico disponibles',
        action: '',
      },
      {
        label: 'Resoluciones DIAN',
        link: '/dian-resolution',
        action: '',
        requiredPermission: 'can_manage_dian',
        description: 'Solo puedes tener una resolución activa a la vez por tipo',
      },
    ],
  },
  {
    label: 'Compras',
    icon: IconCash,
    children: [
      {
        label: 'Proveedores',
        link: '/suppliers',
        requiredPermission: 'can_manage_suppliers',
        description: 'Administra y consulta la información de tus proveedores',
        action: '',
      },
      {
        label: 'Compras',
        link: '/purchases',
        requiredAnyPermission: ['can_view_purchases', 'can_create_purchase'],
        requiredFeatureFlag: 'can_view_purchases',
        description: 'Registra y gestiona las compras realizadas a proveedores',
        action: '',
      },
    ],
  },
  {
    label: 'Restaurante',
    icon: IconToolsKitchen2,
    requiredFeatureFlag: 'restaurant_addon',
    children: [
      {
        label: 'Unidades de Medida',
        link: '/restaurant/units',
        requiredFeatureFlag: 'restaurant_addon',
        requiredPermission: 'can_manage_restaurant_ingredients',
        description: 'Gestiona las unidades de medida para tus ingredientes',
      },
      {
        label: 'Ingredientes',
        link: '/restaurant/ingredients',
        requiredFeatureFlag: 'restaurant_addon',
        requiredPermission: 'can_manage_restaurant_ingredients',
        description: 'Controla el stock de ingredientes y sus costos',
      },
      {
        label: 'Mesas',
        link: '/restaurant/tables',
        requiredFeatureFlag: 'restaurant_addon',
        requiredPermission: 'can_manage_restaurant_tables',
        description: 'Gestiona las mesas del restaurante y sus áreas',
      },
      {
        label: 'Comandas',
        link: '/restaurant/orders',
        requiredFeatureFlag: 'restaurant_addon',
        requiredPermission: 'can_manage_restaurant_orders',
        description: 'Gestiona las comandas activas del restaurante',
      },
      {
        label: 'Menú',
        link: '/restaurant/menu',
        requiredFeatureFlag: 'restaurant_addon',
        requiredPermission: 'can_manage_restaurant_menu',
        description: 'Gestiona los platos del menú y sus recetas',
      },
      {
        label: 'Fidelización',
        link: '/restaurant/membership-cards',
        requiredFeatureFlag: 'restaurant_addon',
        requiredPermission: 'can_view_membership_cards',
        description: 'Gestiona las tarjetas de fidelización de tus clientes',
      },
    ],
  },
  {
    label: 'Tienda',
    icon: IconBuildingStore,
    children: [
      {
        label: 'Reportes',
        link: '',
        requiredAnyPermission: [
          'can_download_daily_report',
          'can_download_inventory_report',
          'can_download_product_sales_report',
          'can_download_invoices_report',
          'can_download_electronic_invoice_report',
        ],
        description: 'Descarga y consulta reportes detallados de ventas y operaciones',
        action: 'openDownloadModal',
      },
      {
        label: 'Metas',
        link: '',
        action: 'openGoalsModal',
        requiredPermission: 'can_manage_goals',
        requiredFeatureFlag: 'can_manage_goals',
        description: 'Crea y gestiona objetivos de ventas para tu negocio',
      },
      {
        label: 'Usuarios',
        link: '/users',
        requiredPermission: 'can_manage_users',
        requiredFeatureFlag: 'can_manage_users',
        description: 'Gestiona y agrega usuarios a tu negocio',
      },
    ],
  },
]
