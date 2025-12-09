import { FC, ReactNode } from 'react'
import { formatDateTime } from '@/layouts/helpers/helpers'
import { IconCopy, IconCheck } from '@tabler/icons-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface InvoiceDetailsPanelProps {
  createdAt: string
  customerName: string
  children: ReactNode
  footer?: ReactNode
  cufe?: string | null
  eInvoiceNumber?: string | null
  dianPrefix?: string | null
}

const CopyButton: FC<{ text: string; label: string }> = ({ text, label }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(`${label} copiado!`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Error al copiar')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className='p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground'
      title={`Copiar ${label}`}
    >
      {copied ? <IconCheck size={16} className='text-green-1' /> : <IconCopy size={16} />}
    </button>
  )
}

export const InvoiceDetailsPanel: FC<InvoiceDetailsPanelProps> = ({
  createdAt,
  customerName,
  children,
  footer,
  cufe,
  eInvoiceNumber,
  dianPrefix,
}) => {
  const fullEInvoiceNumber = eInvoiceNumber
    ? `${dianPrefix || 'FE'} - ${eInvoiceNumber}`
    : null

  return (
    <div className='flex flex-col w-full overflow-hidden bg-card border border-border rounded-lg shadow-sm lg:flex-1 min-h-[60vh] lg:min-h-0'>
      <div className='flex-1 p-4 overflow-hidden overflow-y-auto sm:p-6 scrollbar-hide'>
        <div className='mb-6'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div>
              <p className='text-sm text-muted-foreground'>Fecha de venta</p>
              <p className='font-medium'>{formatDateTime(createdAt)}</p>
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Nombre del Cliente</p>
              <p className='font-medium'>{customerName || 'N/A'}</p>
            </div>
          </div>
          {/* Electronic Invoice Information */}
          {(cufe || eInvoiceNumber) && (
            <div className='grid grid-cols-1 gap-4 mt-4 pt-4 border-t border-border'>
              {fullEInvoiceNumber && (
                <div>
                  <p className='text-sm text-muted-foreground'>Número de Factura Electrónica</p>
                  <div className='flex items-center justify-between gap-2'>
                    <p className='font-semibold text-lg text-green-1 flex-1'>{fullEInvoiceNumber}</p>
                    <CopyButton text={fullEInvoiceNumber} label='Número FE' />
                  </div>
                </div>
              )}
              {cufe && (
                <div>
                  <p className='text-sm text-muted-foreground'>CUFE</p>
                  <div className='flex items-start justify-between gap-2'>
                    <p className='font-medium text-sm break-all flex-1'>{cufe}</p>
                    <CopyButton text={cufe} label='CUFE' />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {children}
      </div>
      {footer}
    </div>
  )
}
