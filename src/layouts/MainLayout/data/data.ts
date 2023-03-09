import {
  IconFileInvoice,
  IconLayoutDashboard,
  IconPackages,
  IconReceipt,
  IconBoxMultiple,
  IconUsers,
  IconBuildingStore,
  IconActivity,
  TablerIconsProps,
} from '@tabler/icons-react'

interface ISideBarData {
  icon: (props: TablerIconsProps) => JSX.Element
  title: string
  path: string
}

export const SideBarData: ISideBarData[] = [
  {
    icon: IconLayoutDashboard,
    title: 'Panel principal',
    path: '/',
  },
  {
    icon: IconPackages,
    title: 'Inventarios',
    path: '/inventories',
  },
  {
    icon: IconFileInvoice,
    title: 'Facturas',
    path: '/invoices',
  },
  {
    icon: IconReceipt,
    title: 'Venta',
    path: '/purchase',
  },
  {
    icon: IconBoxMultiple,
    title: 'Categorias',
    path: '/inventory-groups',
  },
  {
    icon: IconUsers,
    title: 'Usuarios',
    path: '/users',
  },
  {
    icon: IconBuildingStore,
    title: 'Tiendas',
    path: '/shops',
  },
  {
    icon: IconActivity,
    title: 'Actividad de Usuarios',
    path: '/user-activities',
  },
]
