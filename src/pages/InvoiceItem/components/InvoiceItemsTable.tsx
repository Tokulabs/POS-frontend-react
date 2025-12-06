import { FC } from 'react'
import { formatNumberToColombianPesos } from '@/utils/helpers'

interface InvoiceItem {
  item_code: string
  item_name: string
  quantity: number
  original_amount: number
}

interface InvoiceItemsTableProps {
  items: InvoiceItem[]
}

export const InvoiceItemsTable: FC<InvoiceItemsTableProps> = ({ items }) => {
  return (
    <div className='mb-6'>
      <h3 className='mb-4 text-lg font-semibold'>Productos</h3>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='border-b'>
              <th className='py-2 text-left'>Código</th>
              <th className='py-2 text-left'>Descripción</th>
              <th className='py-2 text-right'>Cantidad</th>
              <th className='py-2 text-right'>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className='border-b'>
                <td className='py-2'>{item.item_code}</td>
                <td className='py-2 lowercase first-letter:uppercase'>{item.item_name}</td>
                <td className='py-2 text-right'>{item.quantity || 1}</td>
                <td className='py-2 text-right'>
                  {formatNumberToColombianPesos(item.original_amount || 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
