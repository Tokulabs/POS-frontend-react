import { ITableTitles } from '@/pages/POS/components/types/TableTypes'
import { TableColumnsType } from 'antd'

export const columnsDataPurchase: TableColumnsType = [
  {
    title: 'ID',
    dataIndex: 'key',
    key: 'key',
    fixed: 'left',
  },
  {
    title: 'Estado',
    dataIndex: 'state',
    key: 'state',
  },
  {
    title: 'Fecha de creación',
    dataIndex: 'created_at',
    key: 'created_at',
  },
  {
    title: 'Notas',
    dataIndex: 'delivery_notes',
    key: 'delivery_notes',
  },
  {
    title: 'Fecha de revisión',
    dataIndex: 'state_reviewed_at',
    key: 'state_reviewed_at',
  },
]

export const createPurchaseTableTitles: ITableTitles[] = [
  {
    tableTitle: 'Codigo',
    tableStyles: 'w-full',
  },
  {
    tableTitle: 'Nombre',
    tableStyles: 'col-span-3 w-full',
  },
  {
    tableTitle: 'Precio COP',
    tableStyles: 'col-span-2 col-start-5 w-full',
  },
  {
    tableTitle: 'Precio USD',
    tableStyles: 'col-start-7 w-full',
  },
  {
    tableTitle: 'Cantidad',
    tableStyles: 'col-start-8 col-span-3 w-full',
  },
  {
    tableTitle: 'Total COP',
    tableStyles: 'col-start-11 col-span-2 w-full',
  },
  {
    tableTitle: 'Total USD',
    tableStyles: 'col-start-13 w-full',
  },
]
