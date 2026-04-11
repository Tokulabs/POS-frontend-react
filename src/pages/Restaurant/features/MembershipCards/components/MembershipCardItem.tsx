import { FC, useState } from 'react'
import { IconRubberStamp, IconRefresh, IconTrash, IconPhone, IconUser, IconUserPlus, IconCalendar } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { IMembershipCard } from '@/hooks/restaurant/useMembershipCards'

interface MembershipCardItemProps {
  card: IMembershipCard
  onAddStamp: (id: number) => void
  onReset: (id: number) => void
  onDelete: (id: number) => void
  onLinkCustomer: (card: IMembershipCard) => void
}

const formatCardDate = (cardId: string) => {
  const ts = parseInt(cardId, 10)
  if (isNaN(ts)) return cardId
  return new Date(ts).toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const MembershipCardItem: FC<MembershipCardItemProps> = ({ card, onAddStamp, onReset, onDelete, onLinkCustomer }) => {
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const isFull = card.stamps >= card.max_stamps
  const displayName = card.customer_name ?? card.client_name
  const displayPhone = card.customer_phone ?? card.phone

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 3000)
      return
    }
    onReset(card.id)
    setConfirmReset(false)
  }

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    onDelete(card.id)
    setConfirmDelete(false)
  }

  return (
    <div className='bg-card border border-border rounded-xl p-5 flex flex-col gap-4 shadow-sm'>
      {/* Client info */}
      <div className='flex items-start justify-between gap-2'>
        <div className='flex flex-col gap-0.5 min-w-0'>
          <div className='flex items-center gap-1.5'>
            {card.customer && <IconUser size={13} className='text-primary shrink-0' />}
            <span className='font-semibold text-foreground text-base truncate'>{displayName}</span>
          </div>
          {displayPhone && (
            <span className='flex items-center gap-1 text-xs text-muted-foreground'>
              <IconPhone size={12} />
              {displayPhone}
            </span>
          )}
        </div>
        <div className='flex items-center gap-1 shrink-0'>
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7 text-muted-foreground hover:text-foreground'
            onClick={() => onLinkCustomer(card)}
            title={card.customer ? 'Cambiar cliente asociado' : 'Asociar cliente'}
          >
            <IconUserPlus size={14} />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10'
            onClick={handleDelete}
            title={confirmDelete ? 'Click de nuevo para confirmar' : 'Eliminar tarjeta'}
          >
            <IconTrash size={14} />
          </Button>
        </div>
      </div>

      {/* Card ID */}
      <div className='flex flex-col gap-0.5 bg-muted rounded px-2 py-1.5'>
        <div className='flex items-center gap-1.5'>
          <IconCalendar size={11} className='text-muted-foreground shrink-0' />
          <span className='text-[10px] text-muted-foreground'>{formatCardDate(card.card_id)}</span>
        </div>
        <span className='font-mono text-xs font-semibold tracking-wide text-foreground'>
          ID: {card.card_id}
        </span>
      </div>

      {/* Stamps grid */}
      <div>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-xs text-muted-foreground'>
            Sellos: <span className='font-semibold text-foreground'>{card.stamps}</span> / {card.max_stamps}
          </span>
          {isFull && (
            <span className='text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full'>
              Completa
            </span>
          )}
        </div>
        <div
          className='grid gap-1.5'
          style={{ gridTemplateColumns: `repeat(${Math.min(card.max_stamps, 10)}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: card.max_stamps }).map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-full border-2 flex items-center justify-center transition-colors ${
                i < card.stamps
                  ? 'bg-primary border-primary'
                  : 'bg-transparent border-border'
              }`}
            >
              {i < card.stamps && (
                <IconRubberStamp size={10} className='text-primary-foreground' />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className='flex gap-2 pt-1'>
        <Button
          className='flex-1 gap-1.5 text-xs h-8'
          size='sm'
          disabled={isFull}
          onClick={() => onAddStamp(card.id)}
        >
          <IconRubberStamp size={13} />
          {isFull ? 'Completa' : 'Agregar sello'}
        </Button>
        <Button
          variant='outline'
          size='sm'
          className={`gap-1.5 text-xs h-8 ${confirmReset ? 'border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40' : ''}`}
          onClick={handleReset}
          title='Reiniciar sellos'
        >
          <IconRefresh size={13} />
          {confirmReset ? '¿Seguro?' : 'Reiniciar'}
        </Button>
      </div>

      {confirmDelete && (
        <p className='text-[10px] text-destructive text-center -mt-2'>
          Click en el ícono de nuevo para confirmar la eliminación
        </p>
      )}
    </div>
  )
}

export { MembershipCardItem }
