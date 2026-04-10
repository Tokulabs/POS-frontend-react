import { FC } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { IIngredient, IIngredientMovement, IngredientMovementType } from '@/pages/Restaurant/types/RestaurantTypes'
import { useIngredientMovements } from '@/hooks/restaurant/useIngredients'

const MOVEMENT_LABELS: Record<IngredientMovementType, string> = {
  purchase: 'Compra',
  adjustment: 'Ajuste',
  consumption: 'Consumo',
  waste: 'Merma',
}

const MOVEMENT_BADGE: Record<IngredientMovementType, string> = {
  purchase: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  adjustment: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  consumption: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  waste: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

interface MovementHistoryDialogProps {
  open: boolean
  ingredient: IIngredient | null
  onClose: () => void
}

const MovementRow: FC<{ movement: IIngredientMovement; unitSymbol: string }> = ({ movement, unitSymbol }) => {
  const qty = Number(movement.quantity)
  const isIn = qty > 0
  const type = movement.movement_type as IngredientMovementType

  return (
    <div className='flex items-start gap-3 py-2.5 border-b border-border last:border-0'>
      <Badge className={`text-xs border-0 shrink-0 mt-0.5 ${MOVEMENT_BADGE[type]}`}>
        {MOVEMENT_LABELS[type]}
      </Badge>

      <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between gap-2'>
          <span className={`text-sm font-semibold tabular-nums ${isIn ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            {isIn ? '+' : ''}{qty.toFixed(3)} {unitSymbol}
          </span>
          <span className='text-xs text-muted-foreground shrink-0'>
            {new Date(movement.created_at).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
          </span>
        </div>
        {movement.supplier_name && (
          <p className='text-xs text-muted-foreground mt-0.5'>{movement.supplier_name}</p>
        )}
        {movement.notes && (
          <p className='text-xs text-muted-foreground mt-0.5 truncate'>{movement.notes}</p>
        )}
        {movement.created_by_name && (
          <p className='text-xs text-muted-foreground/70 mt-0.5'>{movement.created_by_name}</p>
        )}
      </div>
    </div>
  )
}

const MovementHistoryDialog: FC<MovementHistoryDialogProps> = ({ open, ingredient, onClose }) => {
  const { data: movements, isLoading } = useIngredientMovements(open ? ingredient?.id ?? null : null)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Historial — {ingredient?.name}</DialogTitle>
        </DialogHeader>

        <div className='max-h-96 overflow-y-auto -mx-1 px-1'>
          {isLoading ? (
            <div className='space-y-3 py-2'>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : !movements?.length ? (
            <div className='flex flex-col items-center justify-center h-32 text-muted-foreground text-sm'>
              <p>Sin movimientos registrados.</p>
            </div>
          ) : (
            movements.map((m) => (
              <MovementRow
                key={m.id}
                movement={m}
                unitSymbol={ingredient?.unit_detail?.symbol ?? ''}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { MovementHistoryDialog }
