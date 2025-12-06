import { FC, ReactNode } from 'react'
import { formatDateTime } from '@/layouts/helpers/helpers'

interface InvoiceDetailsPanelProps {
  createdAt: string
  customerName: string
  children: ReactNode
  footer?: ReactNode
}

export const InvoiceDetailsPanel: FC<InvoiceDetailsPanelProps> = ({
  createdAt,
  customerName,
  children,
  footer,
}) => {
  return (
    <div className='flex flex-col w-full overflow-hidden bg-white border rounded-lg shadow-sm lg:flex-1 min-h-[60vh] lg:min-h-0'>
      <div className='flex-1 p-4 overflow-hidden overflow-y-auto sm:p-6 scrollbar-hide'>
        <div className='mb-6'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div>
              <p className='text-sm text-gray-500'>Fecha de venta</p>
              <p className='font-medium'>{formatDateTime(createdAt)}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Nombre del Cliente</p>
              <p className='font-medium'>{customerName || 'N/A'}</p>
            </div>
          </div>
        </div>
        {children}
      </div>
      {footer}
    </div>
  )
}
