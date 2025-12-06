import { FC } from 'react'
import PrintInvoice from '@/components/Print/PrintInvoice'

interface InvoicePrintPreviewProps {
  invoiceNumber: string
}

export const InvoicePrintPreview: FC<InvoicePrintPreviewProps> = ({ invoiceNumber }) => {
  return (
    <div className='flex flex-col w-full gap-2 flex-1 min-h-[500px] lg:min-h-0'>
      <h3 className='text-sm font-semibold text-gray-600'>Vista de impresión</h3>
      <div className='flex items-start justify-center flex-1 overflow-hidden overflow-y-auto bg-gray-100 rounded-lg scrollbar-hide'>
        <div className='bg-white shadow-lg'>
          <PrintInvoice id={invoiceNumber} autoPrint={false} />
        </div>
      </div>
    </div>
  )
}
