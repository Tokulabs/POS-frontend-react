import { FC } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  IconArrowLeft,
  IconCheck,
  IconX,
  IconFileInvoice,
  IconInfoCircle,
} from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { useCreditNoteById } from '@/hooks/useCreditNotes'
import { useHasPermission } from '@/hooks/useHasPermission'
import { useSubscription } from '@/hooks/useSubscription'
import { postSendCreditNote } from './helpers/services'
import { formatNumberToColombianPesos } from '@/utils/helpers'
import { formatDateTime } from '@/layouts/helpers/helpers'
import { CREDIT_NOTE_REASON_LABELS } from './types/CreditNoteTypes'
import { CreditNoteActions } from './Components/CreditNoteActions'

const CreditNoteItem: FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { isPending, creditNoteData } = useCreditNoteById('creditNote', id)
  const { featureFlags } = useSubscription()
  const canSendInvoice = useHasPermission('can_send_electronic_invoice')
  const canUseCreditNotes = featureFlags['can_use_credit_notes'] ?? false

  const { mutate: mutateSend, isPending: sending } = useMutation({
    mutationFn: postSendCreditNote,
    onSuccess: (response) => {
      if (response?.data?.success) {
        toast.success('Nota crédito enviada a DIAN!')
        queryClient.invalidateQueries({ queryKey: ['creditNote', id] })
      } else {
        toast.error('Error al enviar la nota crédito')
      }
    },
  })

  if (isPending) {
    return (
      <div className='bg-card text-card-foreground h-full rounded-lg p-6 flex flex-col gap-4'>
        <Skeleton className='h-10 w-64' />
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Skeleton className='h-40 rounded-lg' />
          <Skeleton className='h-40 rounded-lg' />
        </div>
        <Skeleton className='flex-1 rounded-lg' />
      </div>
    )
  }

  if (!creditNoteData) {
    return (
      <div className='flex items-center justify-center w-full h-full text-muted-foreground'>
        Nota crédito no encontrada
      </div>
    )
  }

  const handleSend = () => {
    if (creditNoteData.id) mutateSend(creditNoteData.id)
  }

  const total = (creditNoteData.credit_note_items ?? []).reduce(
    (acc, it) => acc + ((it.original_amount ?? 0) - (it.discount ?? 0)),
    0,
  )

  const fullNumber = `${creditNoteData.prefix || ''}${creditNoteData.number || ''}`
  const invoicePrefix = creditNoteData.invoice?.dian_resolution?.prefix ?? ''
  const invoiceFullNumber = `${invoicePrefix}${creditNoteData.invoice?.e_invoice_number ?? ''}`

  return (
    <div className='bg-card text-card-foreground h-full rounded-lg p-6 flex flex-col gap-5 overflow-y-auto'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='icon' onClick={() => navigate('/credit-notes')}>
            <IconArrowLeft size={18} />
          </Button>
          <h1 className='text-2xl font-semibold text-foreground'>
            Nota Crédito {fullNumber || `#${creditNoteData.id}`}
          </h1>
        </div>
        {creditNoteData.sent_to_dian ? (
          <Badge className='gap-1 bg-green-600 hover:bg-green-600'>
            <IconCheck size={13} /> Enviada a DIAN
          </Badge>
        ) : (
          <Badge variant='secondary' className='gap-1'>
            <IconX size={13} /> Pendiente
          </Badge>
        )}
      </div>

      {/* Info cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='rounded-lg border border-border p-4 flex flex-col gap-3'>
          <div className='flex items-center gap-2 text-sm font-medium'>
            <IconInfoCircle size={15} className='text-muted-foreground' />
            Información
          </div>
          <div className='grid grid-cols-1 gap-2 text-sm'>
            <Field label='Fecha' value={formatDateTime(creditNoteData.created_at)} />
            <Field
              label='Motivo'
              value={CREDIT_NOTE_REASON_LABELS[creditNoteData.discrepancy_code] ?? '—'}
            />
            <Field label='Descripción' value={creditNoteData.description || '—'} />
            {creditNoteData.cude && (
              <div>
                <span className='text-xs text-muted-foreground'>CUDE</span>
                <p className='font-mono text-xs break-all'>{creditNoteData.cude}</p>
              </div>
            )}
          </div>
        </div>

        <div className='rounded-lg border border-border p-4 flex flex-col gap-3'>
          <div className='flex items-center gap-2 text-sm font-medium'>
            <IconFileInvoice size={15} className='text-muted-foreground' />
            Factura referenciada
          </div>
          <div className='grid grid-cols-1 gap-2 text-sm'>
            <Field label='Número' value={invoiceFullNumber || '—'} />
            <div>
              <span className='text-xs text-muted-foreground'>CUFE factura</span>
              <p className='font-mono text-xs break-all'>
                {creditNoteData.invoice?.cufe ?? '—'}
              </p>
            </div>
            <Field
              label='Fecha factura'
              value={creditNoteData.invoice?.created_at?.slice(0, 10) ?? '—'}
            />
            <Field label='Cliente' value={creditNoteData.invoice?.customer?.name ?? '—'} />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className='flex flex-col gap-2'>
        <h3 className='text-sm font-medium'>Items</h3>
        <div className='rounded-md border border-border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead className='text-center'>Cantidad</TableHead>
                <TableHead className='text-right'>Valor original</TableHead>
                <TableHead className='text-right'>Descuento</TableHead>
                <TableHead className='text-right'>Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(creditNoteData.credit_note_items ?? []).map((it, idx) => (
                <TableRow key={idx}>
                  <TableCell className='font-mono text-xs'>{it.item_code}</TableCell>
                  <TableCell>{it.item_name}</TableCell>
                  <TableCell className='text-center'>{it.quantity}</TableCell>
                  <TableCell className='text-right font-mono text-xs'>
                    {formatNumberToColombianPesos(it.original_amount ?? 0)}
                  </TableCell>
                  <TableCell className='text-right font-mono text-xs'>
                    {formatNumberToColombianPesos(it.discount ?? 0)}
                  </TableCell>
                  <TableCell className='text-right font-mono text-xs'>
                    {formatNumberToColombianPesos((it.original_amount ?? 0) - (it.discount ?? 0))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5} className='text-right font-semibold'>
                  Total
                </TableCell>
                <TableCell className='text-right font-semibold'>
                  {formatNumberToColombianPesos(total)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

      <CreditNoteActions
        onSend={handleSend}
        isSent={creditNoteData.sent_to_dian}
        isLoading={sending}
        canSend={canSendInvoice && canUseCreditNotes}
      />
    </div>
  )
}

const Field: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <span className='text-xs text-muted-foreground'>{label}</span>
    <p className='font-medium'>{value}</p>
  </div>
)

export { CreditNoteItem }
