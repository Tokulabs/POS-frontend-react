import {
  IconBuildingWarehouse,
  IconArchive,
  IconBuildingStore,
  IconUserStar,
} from '@tabler/icons-react'
import { ISummaryDataProps } from '../types/DashboardTypes'

export const dataSummary: ISummaryDataProps = {
  total_inventory: {
    title: 'Productos',
    value: 0,
    icon: IconBuildingWarehouse,
    color: '#4f579e',
  },
  total_group: {
    title: 'Categorias',
    value: 0,
    icon: IconArchive,
    color: '#5696c3',
  },
  total_shop: {
    title: 'Tiendas',
    value: 0,
    icon: IconBuildingStore,
    color: '#f3a29b',
  },
  total_users: {
    title: 'Usuarios',
    value: 0,
    icon: IconUserStar,
    color: '#08903c',
  },
}
