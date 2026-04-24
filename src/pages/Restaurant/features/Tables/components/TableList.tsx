import { FC } from 'react'
import { IconEdit, IconTrash, IconUsers, IconChevronDown, IconArrowRight } from '@tabler/icons-react'
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

const STATUS_DOT: Record<TableStatus, string> = {
  available: 'bg-emerald-500',
  occupied: 'bg-red-500',
  reserved: 'bg-amber-500',
  cleaning: 'bg-blue-500',
  disabled: 'bg-zinc-400',
}

const SELECTABLE_STATUSES: TableStatus[] = ['available', 'reserved', 'cleaning', 'disabled']

interface TableListProps {
  tables: IRestaurantTable[]
  onTableClick: (table: IRestaurantTable) => void
  onEdit: (table: IRestaurantTable) => void
  onDelete: (id: number) => void
  onStatusChange: (id: number, status: TableStatus) => void
}

const TableList: FC<TableListProps> = ({ tables, onTableClick, onEdit, onDelete, onStatusChange }) => {
  if (tables.length === 0) return null

  return (
    <div className='border border-border rounded-lg overflow-hidden divide-y divide-border'>
      {tables.map((table) => {
        const hasActiveOrder = !!table.active_order_id
        const isDisabled = table.status === 'disabled'

        return (
          <div
            key={table.id}
            className={`flex items-center gap-3 px-4 py-2.5 bg-card hover:bg-muted/30 transition-colors ${hasActiveOrder ? 'cursor-pointer' : ''}`}
            onClick={hasActiveOrder ? () => onTableClick(table) : undefined}
          >
            {/* Status dot */}
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_DOT[table.status]}`} />

            {/* Number */}
            <span className={`font-semibold text-sm w-20 truncate ${isDisabled ? 'line-through text-muted-foreground' : ''}`}>
              Mesa {table.number}
            </span>

            {/* Area */}
            <span className='text-xs text-muted-foreground w-28 truncate'>
              {table.area_detail?.name ?? <span className='italic'>Sin área</span>}
            </span>

            {/* Capacity */}
            <span className='flex items-center gap-1 text-xs text-muted-foreground w-24'>
              <IconUsers size={12} />
              {table.capacity} personas
            </span>

            {/* Status badge */}
            <Badge variant='outline' className='text-xs font-normal hidden sm:flex'>
              {TABLE_STATUS_LABELS[table.status]}
            </Badge>

            {/* Spacer */}
            <div className='flex-1' />

            {/* Actions */}
            <div
              className='flex items-center gap-1'
              onClick={(e) => e.stopPropagation()}
            >
              {hasActiveOrder ? (
                <Button
                  variant='ghost'
                  size='sm'
                  className='h-7 text-xs px-2 gap-1 text-primary'
                  onClick={() => onTableClick(table)}
                >
                  Ver orden
                  <IconArrowRight size={12} />
                </Button>
              ) : (
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
                  <DropdownMenuContent align='end'>
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
        )
      })}
    </div>
  )
}

export { TableList }
