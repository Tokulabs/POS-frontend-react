import { File, Grid, Icon, Package, ShoppingCart, Trello, Users, Activity } from 'react-feather'

interface ISideBarData {
  icon: Icon
  title: string
  path: string
}

export const SideBarData: ISideBarData[] = [
  {
    icon: Grid,
    title: 'Panel principal',
    path: '/',
  },
  {
    icon: Package,
    title: 'Inventarios',
    path: '/inventories',
  },
  {
    icon: ShoppingCart,
    title: 'Venta',
    path: '/purchase',
  },
  {
    icon: File,
    title: 'Categorias',
    path: '/inventory-groups',
  },
  {
    icon: Users,
    title: 'Usuarios',
    path: '/users',
  },
  {
    icon: Trello,
    title: 'Tiendas',
    path: '/shops',
  },
  {
    icon: Activity,
    title: 'Actividad de Usuarios',
    path: '/user-activities',
  },
]
