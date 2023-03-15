import {
  IconBuildingWarehouse,
  IconArchive,
  IconBuildingStore,
  IconUserStar,
  TablerIconsProps,
} from '@tabler/icons-react'

export interface ISummaryProps {
  title: string
  value: number
  icon: (props: TablerIconsProps) => JSX.Element
  color?: string
}

export interface ISummaryDataProps {
  [key: string]: ISummaryProps
}

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
