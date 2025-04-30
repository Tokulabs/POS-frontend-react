import { ITableTitles } from '@/pages/POS/components/types/TableTypes'

export const createMovementData: ITableTitles[] = [
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
    tableTitle: 'Cantidad',
    tableStyles: 'col-start-7 w-full',
  },
  {
    tableTitle: 'Cantidad Bodega',
    tableStyles: 'col-start-8 col-span-2 w-full',
  },
  {
    tableTitle: 'Cantidad Tienda',
    tableStyles: 'col-start-10 col-span-2 w-full',
  },
  {
    tableTitle: 'Total COP',
    tableStyles: 'col-start-12 col-span-2 w-full',
  },
]
