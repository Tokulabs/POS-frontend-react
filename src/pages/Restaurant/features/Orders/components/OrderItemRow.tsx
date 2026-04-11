import { FC } from 'react'
import { IconPackage, IconTrash } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { IRestaurantOrderItem, OrderItemStatus } from '@/pages/Restaurant/types/RestaurantTypes'
import { formatNumberToColombianPesos } from '@/utils/helpers'

const ITEM_STATUS_STYLES: Record<OrderItemStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  preparing: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  served: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 line-through opacity-60',
}

const NEXT_ITEM_STATUS: Partial<Record<OrderItemStatus, { status: OrderItemStatus; label: string }>> = {
  pending: { status: 'preparing', label: 'Iniciar' },
  preparing: { status: 'served', label: 'Servir' },
}

interface OrderItemRowProps {
  item: IRestaurantOrderItem
  orderBilled: boolean
  onStatusChange: (itemId: number, status: OrderItemStatus) => void
  onRemove: (itemId: number) => void
  isUpdating: boolean
  selectable?: boolean
  selected?: boolean
  moveQuantity?: number
  onSelect?: () => void
  onMoveQuantityChange?: (itemId: number, qty: number) => void
}

const OrderItemRow: FC<OrderItemRowProps> = ({
  item,
  orderBilled,
  onStatusChange,
  onRemove,
  isUpdating,
  selectable,
  selected,
  moveQuantity,
  onSelect,
  onMoveQuantityChange,
}) => {
  const next = NEXT_ITEM_STATUS[item.status]
  const canRemove = item.status === 'pending' && !orderBilled
  const canSelect = selectable && !orderBilled && item.status !== 'cancelled'

  // ── Combo header: show name + price + children list, no status badge ────────
  if (item.is_combo_header) {
    return (
      <div className='border-b border-border last:border-0'>
        <div className='flex items-center gap-3 py-3 px-4'>
          <div className='w-4 shrink-0' />
          <span className='text-sm font-bold w-5 text-center shrink-0'>{item.quantity}×</span>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-1.5'>
              <IconPackage size={13} className='text-muted-foreground shrink-0' />
              <p className='text-sm font-semibold truncate'>{item.item_name}</p>
              <Badge variant='secondary' className='text-[10px] px-1.5 h-4 shrink-0'>Combo</Badge>
            </div>
            {item.notes && (
              <p className='text-xs text-muted-foreground truncate mt-0.5'>{item.notes}</p>
            )}
          </div>
          <span className='text-sm text-muted-foreground shrink-0'>
            {formatNumberToColombianPesos(
              (item.unit_price + item.combo_children.reduce((s, c) => s + c.unit_price, 0)) * item.quantity,
              true,
            )}
          </span>
          {canRemove && (
            <Button
              size='icon'
              variant='ghost'
              className='h-7 w-7 text-muted-foreground hover:text-destructive'
              disabled={isUpdating}
              onClick={() => onRemove(item.id)}
            >
              <IconTrash size={13} />
            </Button>
          )}
        </div>
        {/* Children */}
        {item.combo_children.map((child) => (
          <div key={child.id} className='flex items-center gap-3 py-2 pl-12 pr-4 bg-muted/20'>
            <span className='text-xs text-muted-foreground w-5 text-center shrink-0'>{child.quantity}×</span>
            <p className='flex-1 text-xs text-muted-foreground truncate'>{child.item_name}</p>
            <Badge className={`text-[10px] border-0 shrink-0 ${ITEM_STATUS_STYLES[child.status]}`}>
              {child.status === 'pending' ? 'Pendiente' :
               child.status === 'preparing' ? 'Preparando' :
               child.status === 'served' ? 'Listo' : 'Cancelado'}
            </Badge>
          </div>
        ))}
      </div>
    )
  }

  // ── Regular item ─────────────────────────────────────────────────────────────
  // Skip standalone rendering of combo children — they appear under their header
  if (item.parent_item !== null) return null

  return (
    <div className={`flex items-center gap-3 py-3 px-4 border-b border-border last:border-0 ${item.status === 'cancelled' ? 'opacity-50' : ''}`}>
      {/* Checkbox — always reserves space to keep alignment consistent */}
      <div className='w-4 shrink-0 flex items-center justify-center'>
        {canSelect && (
          <Checkbox
            checked={selected ?? false}
            onCheckedChange={() => onSelect?.()}
            className='dark:border-zinc-400'
          />
        )}
      </div>

      {/* Quantity — shows move input when selected, otherwise just the count */}
      {selected && canSelect ? (
        <div className='flex items-center gap-1 shrink-0'>
          <Input
            type='number'
            min={1}
            max={item.quantity}
            value={moveQuantity ?? item.quantity}
            onChange={(e) => {
              const v = Math.min(item.quantity, Math.max(1, Number(e.target.value)))
              onMoveQuantityChange?.(item.id, v)
            }}
            className='w-14 h-6 text-center text-xs px-1'
          />
          <span className='text-xs text-muted-foreground'>/ {item.quantity}</span>
        </div>
      ) : (
        <span className='text-sm font-bold w-5 text-center shrink-0'>{item.quantity}×</span>
      )}

      {/* Name + notes */}
      <div className='flex-1 min-w-0 flex flex-col justify-center'>
        <p className={`text-sm font-medium truncate leading-none m-0 ${item.status === 'cancelled' ? 'line-through' : ''}`}>
          {item.item_name}
        </p>
        {item.notes && (
          <p className='text-xs text-muted-foreground truncate mt-0.5'>{item.notes}</p>
        )}
      </div>

      {/* Price */}
      <span className='text-sm text-muted-foreground shrink-0'>
        {formatNumberToColombianPesos(item.unit_price * item.quantity, true)}
      </span>

      {/* Status badge */}
      <Badge className={`text-xs shrink-0 border-0 ${ITEM_STATUS_STYLES[item.status]}`}>
        {item.status === 'pending' ? 'Pendiente' :
          item.status === 'preparing' ? 'Preparando' :
            item.status === 'served' ? 'Servido' : 'Cancelado'}
      </Badge>

      {/* Actions */}
      <div className='flex items-center gap-1 shrink-0'>
        {next && !orderBilled && (
          <Button
            size='sm'
            variant='outline'
            className='h-7 text-xs px-2'
            disabled={isUpdating}
            onClick={() => onStatusChange(item.id, next.status)}
          >
            {next.label}
          </Button>
        )}
        {canRemove && (
          <Button
            size='icon'
            variant='ghost'
            className='h-7 w-7 text-muted-foreground hover:text-destructive'
            disabled={isUpdating}
            onClick={() => onRemove(item.id)}
          >
            <IconTrash size={13} />
          </Button>
        )}
      </div>
    </div>
  )
}

export { OrderItemRow }
