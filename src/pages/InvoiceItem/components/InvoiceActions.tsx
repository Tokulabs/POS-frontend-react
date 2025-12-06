import { FC, useState } from 'react'
import { Button } from '@/components/ui/button'
import { IconPrinter, IconSend, IconFileOff, IconDownload } from '@tabler/icons-react'
import { DialogContainer } from '@/components/DialogContainer/DialogContainer'

interface InvoiceActionsProps {
  onPrint: () => void
  onDownload?: () => void
  onSendInvoice: () => void
  onOverride: () => void
  isElectronicInvoiced: boolean
  isOverride: boolean
  isLoading: boolean
  showDownload?: boolean
  canOverride?: boolean
  canSendInvoice?: boolean
}

export const InvoiceActions: FC<InvoiceActionsProps> = ({
  onPrint,
  onDownload,
  onSendInvoice,
  onOverride,
  isElectronicInvoiced,
  isOverride,
  isLoading,
  showDownload = false,
  canOverride = false,
  canSendInvoice = false,
}) => {
  const [openSendDialog, setOpenSendDialog] = useState(false)
  const [openOverrideDialog, setOpenOverrideDialog] = useState(false)

  const handleSendInvoice = () => {
    onSendInvoice()
    setOpenSendDialog(false)
  }

  const handleOverride = () => {
    onOverride()
    setOpenOverrideDialog(false)
  }

  return (
    <div className='flex flex-col gap-3 p-4 border-t sm:flex-row sm:flex-wrap sm:p-6 bg-gray-50'>
      {/* Print Button */}
      <Button
        onClick={onPrint}
        variant='default'
        size='lg'
        className='w-full sm:w-auto'
        disabled={isLoading}
      >
        <IconPrinter size={18} strokeWidth={1.5} />
        <span className='hidden sm:inline'>Imprimir Factura</span>
        <span className='sm:hidden'>Imprimir</span>
      </Button>

      {/* Download Button - Only shown when PDF is available */}
      {showDownload && onDownload && (
        <Button
          onClick={onDownload}
          variant='secondary'
          size='lg'
          className='w-full sm:w-auto'
          disabled={isLoading}
        >
          <IconDownload size={18} strokeWidth={1.5} />
          <span className='hidden sm:inline'>Descargar PDF</span>
          <span className='sm:hidden'>Descargar</span>
        </Button>
      )}

      {/* Override Button - only for users with permission */}
      {canOverride && !isElectronicInvoiced && !isOverride && (
        <DialogContainer
          title='Confirmar anulación de factura'
          triggerTitle={
            <span className='flex items-center gap-2'>
              Anular Factura
              <IconFileOff size={18} strokeWidth={1.5} />
            </span>
          }
          triggerComponent={
            <Button
              variant='destructive'
              size='lg'
              className='w-full sm:w-auto'
              disabled={isLoading}
            >
              <IconFileOff size={18} strokeWidth={1.5} />
              <span className='hidden sm:inline'>Anular Factura</span>
              <span className='sm:hidden'>Anular</span>
            </Button>
          }
          open={openOverrideDialog}
          onOpenChange={setOpenOverrideDialog}
        >
          <div className='flex flex-col gap-4'>
            <p className='text-gray-600'>
              ¿Estás seguro de anular esta factura? Esta acción no se puede deshacer.
            </p>
            <div className='flex justify-end gap-3'>
              <Button variant='outline' onClick={() => setOpenOverrideDialog(false)}>
                Cancelar
              </Button>
              <Button variant='destructive' onClick={handleOverride} disabled={isLoading}>
                Sí, anular
              </Button>
            </div>
          </div>
        </DialogContainer>
      )}

      {/* Send Invoice Button - only for users with permission */}
      {canSendInvoice && !isElectronicInvoiced && !isOverride && (
        <DialogContainer
          title='Confirmar envío de factura'
          triggerTitle={
            <span className='flex items-center gap-2'>
              Enviar Factura
              <IconSend size={18} strokeWidth={1.5} />
            </span>
          }
          triggerComponent={
            <Button
              variant='outline'
              size='lg'
              className='w-full sm:w-auto'
              disabled={isLoading}
            >
              <IconSend size={18} strokeWidth={1.5} />
              <span className='hidden sm:inline'>Enviar Factura</span>
              <span className='sm:hidden'>Enviar</span>
            </Button>
          }
          open={openSendDialog}
          onOpenChange={setOpenSendDialog}
        >
          <div className='flex flex-col gap-4'>
            <p className='text-gray-600'>¿Estás seguro de enviar esta factura?</p>
            <div className='flex justify-end gap-3'>
              <Button variant='outline' onClick={() => setOpenSendDialog(false)}>
                Cancelar
              </Button>
              <Button
                variant='default'
                onClick={handleSendInvoice}
                disabled={isLoading}
              >
                Sí, enviar
              </Button>
            </div>
          </div>
        </DialogContainer>
      )}
    </div>
  )
}

