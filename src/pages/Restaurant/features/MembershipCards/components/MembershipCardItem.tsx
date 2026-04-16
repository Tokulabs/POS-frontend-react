import { FC, useState } from 'react'
import { IconRubberStamp, IconRefresh, IconTrash, IconPhone, IconUser, IconUserPlus, IconCalendar, IconPencil, IconCheck, IconX } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IMembershipCard } from '@/hooks/restaurant/useMembershipCards'

interface MembershipCardItemProps {
  card: IMembershipCard
  canEdit?: boolean
  onSetStamps: (id: number, stamps: number) => void
  onReset: (id: number) => void
  onDelete: (id: number) => void
  onLinkCustomer: (card: IMembershipCard) => void
  onEditPhone: (id: number, phone: string) => void
}

const formatCardDate = (cardId: string) => {
  const ts = parseInt(cardId, 10)
  if (isNaN(ts)) return cardId
  return new Date(ts).toLocaleString('es-CO', {
    year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
  })
}

const MembershipCardItem: FC<MembershipCardItemProps> = ({
  card, canEdit = true,
  onSetStamps, onReset, onDelete, onLinkCustomer, onEditPhone,
}) => {
  const [confirmReset, setConfirmReset]   = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editingPhone, setEditingPhone]   = useState(false)
  const [phoneInput, setPhoneInput]       = useState('')
  const [phoneError, setPhoneError]       = useState('')
  const [hoverIndex, setHoverIndex]       = useState<number | null>(null)

  const isFull      = card.stamps >= card.max_stamps
  const displayName = card.customer_name ?? card.client_name
  const displayPhone = card.customer_phone ?? card.phone
  const canEditPhone = canEdit && !card.customer

  const validatePhone = (value: string) => {
    if (!/^3\d{9}$/.test(value.trim())) return 'Número colombiano inválido (10 dígitos, empieza por 3)'
    return ''
  }

  const handleStartEditPhone = () => { setPhoneInput(card.phone); setEditingPhone(true) }

  const handleSavePhone = () => {
    const phone = phoneInput.trim()
    const error = validatePhone(phone)
    if (error) { setPhoneError(error); return }
    onEditPhone(card.id, phone)
    setEditingPhone(false)
    setPhoneError('')
  }

  const handleReset = () => {
    if (!confirmReset) { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 3000); return }
    onReset(card.id)
    setConfirmReset(false)
  }

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); return }
    onDelete(card.id)
    setConfirmDelete(false)
  }

  // Clicking circle i:
  //   - if it's already the last filled circle (i === stamps - 1): remove it → set to i
  //   - if it's filled but not last: set stamps to i (remove from here forward)
  //   - if it's empty: fill up to here → set to i + 1
  const handleCircleClick = (i: number) => {
    if (!canEdit) return
    // Star-rating logic: click circle i → set to i+1, unless that's already the count → toggle off to i
    const newStamps = i + 1 === card.stamps ? i : i + 1
    onSetStamps(card.id, newStamps)
  }

  const previewStamps = hoverIndex !== null
    ? (hoverIndex + 1 === card.stamps ? hoverIndex : hoverIndex + 1)
    : card.stamps

  const previewFilled = (i: number) => i < previewStamps

  return (
    <div className='bg-card border border-border rounded-2xl p-6 flex flex-col gap-5 shadow-sm'>

      {/* Client info + actions */}
      <div className='flex items-start justify-between gap-3'>
        <div className='flex flex-col gap-1 min-w-0'>
          <div className='flex items-center gap-2'>
            {card.customer && <IconUser size={18} className='text-primary shrink-0' />}
            <span className='font-bold text-foreground text-lg leading-tight truncate'>{displayName}</span>
          </div>

          {editingPhone ? (
            <div className='flex flex-col gap-1 mt-0.5'>
              <div className='flex items-center gap-1.5'>
                <Input
                  autoFocus
                  value={phoneInput}
                  onChange={(e) => { setPhoneInput(e.target.value); setPhoneError('') }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSavePhone()
                    if (e.key === 'Escape') { setEditingPhone(false); setPhoneError('') }
                  }}
                  className={`h-8 text-sm w-36 px-2 ${phoneError ? 'border-destructive' : ''}`}
                  maxLength={10}
                  inputMode='numeric'
                />
                <button type='button' onClick={handleSavePhone} className='text-green-600 hover:text-green-700 transition-colors'>
                  <IconCheck size={16} />
                </button>
                <button type='button' onClick={() => { setEditingPhone(false); setPhoneError('') }} className='text-muted-foreground hover:text-foreground transition-colors'>
                  <IconX size={16} />
                </button>
              </div>
              {phoneError && <p className='text-[11px] text-destructive'>{phoneError}</p>}
            </div>
          ) : (
            <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
              <IconPhone size={15} />
              <span>{displayPhone || '—'}</span>
              {canEditPhone && (
                <button type='button' onClick={handleStartEditPhone} className='ml-0.5 text-muted-foreground hover:text-foreground transition-colors'>
                  <IconPencil size={13} />
                </button>
              )}
            </div>
          )}
        </div>

        {canEdit && (
          <div className='flex items-center gap-1.5 shrink-0'>
            <Button variant='ghost' size='icon' className='h-9 w-9 text-muted-foreground hover:text-foreground' onClick={() => onLinkCustomer(card)} title={card.customer ? 'Cambiar cliente asociado' : 'Asociar cliente'}>
              <IconUserPlus size={18} />
            </Button>
            <Button variant='ghost' size='icon' className='h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10' onClick={handleDelete} title={confirmDelete ? 'Click de nuevo para confirmar' : 'Eliminar tarjeta'}>
              <IconTrash size={18} />
            </Button>
          </div>
        )}
      </div>

      {/* Card ID / date */}
      <div className='flex flex-col gap-0.5 bg-muted rounded-lg px-3 py-2'>
        <div className='flex items-center gap-1.5'>
          <IconCalendar size={13} className='text-muted-foreground shrink-0' />
          <span className='text-xs text-muted-foreground'>{formatCardDate(card.card_id)}</span>
        </div>
        <span className='font-mono text-sm font-semibold tracking-wide text-foreground'>ID: {card.card_id}</span>
      </div>

      {/* Stamps */}
      <div>
        <div className='flex items-center justify-between mb-3'>
          <span className='text-sm text-muted-foreground'>
            Sellos: <span className='font-bold text-foreground text-base'>{card.stamps}</span> / {card.max_stamps}
          </span>
          {isFull && (
            <span className='text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full'>
              Completa
            </span>
          )}
        </div>
        <div
          className='grid gap-2'
          style={{ gridTemplateColumns: `repeat(${Math.min(card.max_stamps, 10)}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: card.max_stamps }).map((_, i) => {
            const filled = previewFilled(i)
            const isHovered = hoverIndex === i
            const wouldRemove = hoverIndex !== null && previewStamps < card.stamps && i >= previewStamps && i < card.stamps

            return (
              <button
                key={i}
                type='button'
                disabled={!canEdit}
                onClick={() => handleCircleClick(i)}
                onMouseEnter={() => canEdit && setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                className={`aspect-square rounded-full border-2 flex items-center justify-center transition-all
                  ${filled ? 'bg-primary border-primary' : 'bg-transparent border-border'}
                  ${wouldRemove ? 'opacity-40' : ''}
                  ${canEdit ? 'cursor-pointer hover:scale-110' : ''}
                  ${isHovered && !filled ? 'border-primary/60 bg-primary/20' : ''}
                `}
              >
                {filled && <IconRubberStamp size={14} className='text-primary-foreground' />}
              </button>
            )
          })}
        </div>
        {canEdit && (
          <p className='text-[11px] text-muted-foreground mt-2 text-center'>
            Toca un círculo para agregar o quitar sellos
          </p>
        )}
      </div>

      {/* Actions */}
      {canEdit && (
        <>
          <Button
            variant='outline'
            className={`w-full gap-2 h-10 text-sm ${confirmReset ? 'border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40' : ''}`}
            onClick={handleReset}
          >
            <IconRefresh size={16} />
            {confirmReset ? '¿Reiniciar todos los sellos?' : 'Reiniciar sellos'}
          </Button>

          {confirmDelete && (
            <p className='text-xs text-destructive text-center -mt-2'>
              Toca el ícono de nuevo para confirmar la eliminación
            </p>
          )}
        </>
      )}
    </div>
  )
}

export { MembershipCardItem }
