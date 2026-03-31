import { FC, useState } from 'react'
import { IconEdit, IconTrash, IconUsers, IconChevronDown } from '@tabler/icons-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IRestaurantTable, TableStatus, TABLE_STATUS_LABELS } from '@/pages/Restaurant/types/RestaurantTypes'

const STATUS_STYLES: Record<TableStatus, { card: string; badge: string }> = {
  available: {
    card: 'border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/20',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  occupied: {
    card: 'border-red-500/40 bg-red-50/60 dark:bg-red-950/20',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  },
  reserved: {
    card: 'border-amber-500/40 bg-amber-50/60 dark:bg-amber-950/20',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  },
  cleaning: {
    card: 'border-blue-500/40 bg-blue-50/60 dark:bg-blue-950/20',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  },
  disabled: {
    card: 'border-zinc-400/40 bg-zinc-100/60 dark:bg-zinc-900/30 opacity-60',
    badge: 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300',
  },
}

// Statuses that can be manually selected (occupied is set automatically by order creation)
const SELECTABLE_STATUSES: TableStatus[] = ['available', 'reserved', 'cleaning', 'disabled']

interface TableCardProps {
  table: IRestaurantTable
  onEdit: (table: IRestaurantTable) => void
  onDelete: (id: number) => void
  onStatusChange: (id: number, status: TableStatus) => void
  onTableClick: (table: IRestaurantTable) => void
}

const TableCard: FC<TableCardProps> = ({ table, onEdit, onDelete, onStatusChange, onTableClick }) => {
  const styles = STATUS_STYLES[table.status] ?? STATUS_STYLES.available
  const isClickable = table.status === 'occupied' && !!table.active_order_id
  const isDisabled = table.status === 'disabled'
  const hasActiveOrder = !!table.active_order_id

  // Only allow status change when there's no active order
  const canChangeStatus = !hasActiveOrder

  return (
    <Card
      className={`border-2 transition-colors ${styles.card} ${isClickable ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={isClickable ? () => onTableClick(table) : undefined}
    >
      <CardContent className='p-3 space-y-2'>
        {/* Number + status */}
        <div className='flex items-start justify-between gap-1'>
          <span className={`text-lg font-bold leading-none ${isDisabled ? 'line-through text-muted-foreground' : ''}`}>
            {table.number}
          </span>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${styles.badge}`}>
            {TABLE_STATUS_LABELS[table.status] ?? table.status}
          </span>
        </div>

        {/* Capacity */}
        <div className='flex items-center gap-1 text-xs text-muted-foreground'>
          <IconUsers size={12} />
          <span>{table.capacity} personas</span>
        </div>

        {/* Area */}
        {table.area_detail && (
          <Badge variant='outline' className='text-xs font-normal h-5 px-1.5'>
            {table.area_detail.name}
          </Badge>
        )}

        {/* Actions */}
        <div
          className='flex items-center justify-between pt-1 border-t border-border/50'
          onClick={(e) => e.stopPropagation()}
        >
          {canChangeStatus && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-7 text-xs px-2 text-muted-foreground hover:text-foreground gap-1'
                >
                  Cambiar estado
                  <IconChevronDown size={11} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start'>
                {SELECTABLE_STATUSES.filter((s) => s !== table.status).map((s) => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => onStatusChange(table.id, s)}
                    className={s === 'disabled' ? 'text-destructive focus:text-destructive' : ''}
                  >
                    {TABLE_STATUS_LABELS[s]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {!canChangeStatus && <div />}

          <div className='flex items-center gap-0.5'>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-muted-foreground hover:text-foreground'
              onClick={() => onEdit(table)}
            >
              <IconEdit size={13} />
            </Button>
            {!hasActiveOrder && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7 text-muted-foreground hover:text-destructive'
                  >
                    <IconTrash size={13} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Eliminar mesa</AlertDialogTitle>
                    <AlertDialogDescription>
                      ¿Estás seguro de que quieres eliminar la Mesa {table.number}? Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(table.id)}
                      className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { TableCard }
