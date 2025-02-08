import { ITableTitles } from '@/pages/POS/components/types/TableTypes'

export const TableData: ITableTitles[] = [
  {
    tableTitle: 'Codigo',
    tableStyles: 'w-full',
  },
  {
    tableTitle: 'Nombre',
    tableStyles: 'w-full col-span-2',
  },
  {
    tableTitle: 'Precio COP',
    tableStyles: 'w-full col-span-2',
  },
  {
    tableTitle: 'Precio USD',
    tableStyles: 'w-full col-span-2',
  },
  {
    tableTitle: 'Cantidad',
    tableStyles: 'w-full col-span-2',
  },
  {
    tableTitle: 'Total USD',
    tableStyles: 'w-full col-span-2',
  },
  {
    tableTitle: 'Total COP',
    tableStyles: 'w-full col-span-2',
  },
]

export const columnsDataInventoryMovemenets = [
  {
    title: 'ID',
    dataIndex: 'key',
    key: 'key',
  },
  {
    title: 'Proveedor',
    dataIndex: 'provider_name',
    key: 'provider_name',
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
    title: 'Fecha de entrega',
    dataIndex: 'event_date',
    key: 'event_date',
  },
  {
    title: 'Destino',
    dataIndex: 'destination',
    key: 'destination',
  },
  {
    title: '',
    dataIndex: 'action',
    key: 'action',
  },
]
