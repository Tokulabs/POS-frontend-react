import { FC, useState } from 'react'
import { Button } from '@/components/ui/button'
import { IconSend } from '@tabler/icons-react'
import { DialogContainer } from '@/components/DialogContainer/DialogContainer'

interface CreditNoteActionsProps {
  onSend: () => void
  isSent: boolean
  isLoading: boolean
  canSend?: boolean
}

const CreditNoteActions: FC<CreditNoteActionsProps> = ({
  onSend,
  isSent,
  isLoading,
  canSend = true,
}) => {
  const [openSendDialog, setOpenSendDialog] = useState(false)

  const handleSend = () => {
    onSend()
    setOpenSendDialog(false)
  }

  if (isSent || !canSend) return null

  return (
    <div className='flex flex-col gap-3 p-4 border-t sm:flex-row sm:flex-wrap sm:p-6 bg-secondary'>
      <DialogContainer
        title='Enviar Nota Crédito a la DIAN'
        triggerTitle='Enviar a DIAN'
        triggerComponent={
          <Button variant='default' size='lg' className='w-full sm:w-auto' disabled={isLoading}>
            <IconSend size={18} strokeWidth={1.5} />
            <span>Enviar Nota Crédito a DIAN</span>
          </Button>
        }
        open={openSendDialog}
        onOpenChange={setOpenSendDialog}
      >
        <div className='flex flex-col gap-4'>
          <p className='text-muted-foreground'>
            ¿Estás seguro de enviar esta nota crédito a la DIAN? Esta acción no se puede deshacer.
          </p>
          <div className='flex justify-end gap-3'>
            <Button variant='outline' onClick={() => setOpenSendDialog(false)}>
              Cancelar
            </Button>
            <Button variant='default' onClick={handleSend} disabled={isLoading}>
              Sí, enviar
            </Button>
          </div>
        </div>
      </DialogContainer>
    </div>
  )
}

export { CreditNoteActions }
