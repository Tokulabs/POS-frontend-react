import { IconBuildingWarehouse, IconArchive, IconUserStar } from '@tabler/icons-react'
import { ISummaryDataProps } from '../types/DashboardTypes'

export const dataSummary: ISummaryDataProps = {
  total_inventory: {
    title: 'Productos activos',
    value: 0,
    icon: IconBuildingWarehouse,
    color: '#4f579e',
  },
  total_group: {
    title: 'Categorias activos',
    value: 0,
    icon: IconArchive,
    color: '#5696c3',
  },
  total_users: {
    title: 'Usuarios activos',
    value: 0,
    icon: IconUserStar,
    color: '#08903c',
  },
}
