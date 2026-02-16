import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { IconArrowLeft } from '@tabler/icons-react'

interface InvoiceHeaderProps {
  invoiceNumber: string
}

export const InvoiceHeader: FC<InvoiceHeaderProps> = ({ invoiceNumber }) => {
  const navigate = useNavigate()

  return (
    <div className='flex items-center gap-4 border-b'>
      <Button variant='ghost' size='icon' onClick={() => navigate(-1)}>
        <IconArrowLeft size={24} />
      </Button>
      <h2 className='text-2xl font-bold text-green-1'>Factura No. {invoiceNumber}</h2>
    </div>
  )
}
