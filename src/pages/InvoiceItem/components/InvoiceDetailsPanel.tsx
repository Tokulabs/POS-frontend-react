import { FC, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDateTime } from '@/layouts/helpers/helpers'
import { IconCopy, IconCheck, IconToolsKitchen2, IconFileMinus, IconCirclePlus, IconFileOff } from '@tabler/icons-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useSubscription } from '@/hooks/useSubscription'

interface RestaurantOrderRef {
  id: number
  order_number: string
  table_number: string | null
}

interface InvoiceDetailsPanelProps {
  createdAt: string
  customerName: string
  children: ReactNode
  footer?: ReactNode
  cufe?: string | null
  eInvoiceNumber?: string | null
  dianPrefix?: string | null
  restaurantOrder?: RestaurantOrderRef | null
  invoiceNumber?: number | string
  isElectronicInvoiced?: boolean
  isOverride?: boolean
  overrideReason?: string | null
  creditNotesCount?: number
  canCreateCreditNote?: boolean
  onCreateCreditNote?: () => void
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
  restaurantOrder,
  invoiceNumber,
  isElectronicInvoiced = false,
  isOverride = false,
  overrideReason,
  creditNotesCount = 0,
  canCreateCreditNote = false,
  onCreateCreditNote,
}) => {
  const navigate = useNavigate()
  const { featureFlags } = useSubscription()
  const canUseCreditNotes = featureFlags['can_use_credit_notes'] ?? false

  const fullEInvoiceNumber = eInvoiceNumber
    ? `${dianPrefix || 'FE'} - ${eInvoiceNumber}`
    : null

  const showCreditNotesSection = canUseCreditNotes && isElectronicInvoiced && !isOverride
  const searchParam = eInvoiceNumber ?? invoiceNumber ?? ''

  return (
    <div className={`flex flex-col w-full overflow-hidden bg-card border rounded-lg shadow-xs lg:flex-1 min-h-[60vh] lg:min-h-0 ${isOverride ? 'border-red-400 dark:border-red-600' : 'border-border'}`}>
      {isOverride && (
        <div className='flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-bold tracking-wide'>
          <IconFileOff size={16} strokeWidth={2} />
          FACTURA ANULADA
        </div>
      )}
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
          {/* Override Reason */}
          {isOverride && overrideReason && (
            <div className='flex items-start gap-2 mt-3 px-3 py-2 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'>
              <IconFileOff size={16} className='text-red-600 dark:text-red-400 shrink-0 mt-0.5' />
              <div className='text-sm'>
                <span className='text-muted-foreground'>Motivo de anulación: </span>
                <span className='font-medium text-red-700 dark:text-red-300'>{overrideReason}</span>
              </div>
            </div>
          )}
          {/* Restaurant Order Origin */}
          {restaurantOrder && (
            <div className='flex items-center gap-2 mt-3 px-3 py-2 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'>
              <IconToolsKitchen2 size={16} className='text-amber-600 dark:text-amber-400 shrink-0' />
              <div className='text-sm'>
                <span className='text-muted-foreground'>Comanda: </span>
                <span className='font-semibold text-amber-700 dark:text-amber-300'>{restaurantOrder.order_number}</span>
                {restaurantOrder.table_number && (
                  <>
                    <span className='text-muted-foreground mx-1'>·</span>
                    <span className='text-muted-foreground'>Mesa </span>
                    <span className='font-medium'>{restaurantOrder.table_number}</span>
                  </>
                )}
              </div>
            </div>
          )}
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
          {/* Credit Notes Section */}
          {showCreditNotesSection && (
            <div className='mt-4 pt-4 border-t border-border flex items-center justify-between gap-3'>
              <div className='flex items-center gap-2'>
                <IconFileMinus size={15} className='text-muted-foreground shrink-0' />
                <span className='text-sm text-muted-foreground'>Notas Crédito</span>
                {creditNotesCount > 0 && (
                  <Badge
                    variant='secondary'
                    className='cursor-pointer hover:bg-accent transition-colors'
                    onClick={() => navigate(`/credit-notes?search=${searchParam}`)}
                  >
                    {creditNotesCount}
                  </Badge>
                )}
              </div>
              {canCreateCreditNote && (
                <Button
                  variant='outline'
                  size='sm'
                  className='gap-1.5 h-7 text-xs'
                  onClick={onCreateCreditNote}
                >
                  <IconCirclePlus size={13} />
                  Crear
                </Button>
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
