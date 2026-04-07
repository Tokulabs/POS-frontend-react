import { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconPlus, IconReceipt } from '@tabler/icons-react'
import { IRestaurantTable, IRestaurantOrder } from '@/pages/Restaurant/types/RestaurantTypes'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatNumberToColombianPesos } from '@/utils/helpers'

// ── Helpers ──────────────────────────────────────────────────────────────────

const getTotal = (order: IRestaurantOrder) =>
  order.order_items
    .filter((i) => i.status !== 'cancelled')
    .reduce((s, i) => s + i.unit_price * i.quantity, 0)

const TABLE_STATUS_LABEL: Record<string, string> = {
  cleaning: 'Limpieza',
  reserved: 'Reservada',
  disabled: 'Inactiva',
  occupied: 'Ocupada',
}

const ORDER_CARD_STYLE: Record<string, string> = {
  open: 'border-blue-400 bg-blue-50 dark:bg-blue-950/30',
  in_preparation: 'border-amber-400 bg-amber-50/80 dark:bg-amber-950/30',
  ready: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
}

const ORDER_DOT_STYLE: Record<string, string> = {
  open: 'bg-blue-500',
  in_preparation: 'bg-amber-500',
  ready: 'bg-emerald-500',
}

const ORDER_STATUS_LABEL: Record<string, string> = {
  open: 'Abierta',
  in_preparation: 'En prep.',
  ready: 'Lista ✓',
}

// ── Component ─────────────────────────────────────────────────────────────────

interface WaiterTableGridProps {
  tables: IRestaurantTable[]
  orders: IRestaurantOrder[]
  onCobrar: (orderId: number) => void
  cobrarPendingId: number | null
  onQuickCreate: (tableId: number | null, notes: string) => void
  isCreating: boolean
}

const WaiterTableGrid: FC<WaiterTableGridProps> = ({
  tables,
  orders,
  onCobrar,
  cobrarPendingId,
  onQuickCreate,
  isCreating,
}) => {
  const navigate = useNavigate()
  // null = dialog closed; 'tableless' = open for no-table order; IRestaurantTable = open for specific table
  const [sheetTable, setSheetTable] = useState<IRestaurantTable | 'tableless' | null>(null)
  const [notes, setNotes] = useState('')

  const activeTables = tables.filter((t) => t.active)
  const orderById = new Map(orders.map((o) => [o.id, o]))
  const tablelessOrders = orders.filter((o) => o.table === null)

  // null = closed; 'tableless' = open for no-table; IRestaurantTable = open for specific table
  const openForTable = (table: IRestaurantTable) => { setSheetTable(table); setNotes('') }
  const openForTableless = () => { setSheetTable('tableless'); setNotes('') }
  const closeDialog = () => { setSheetTable(null); setNotes('') }

  const handleCreate = () => {
    const tableId = sheetTable && sheetTable !== 'tableless' ? sheetTable.id : null
    onQuickCreate(tableId, notes)
    // Navigation on success causes page unmount — dialog closes automatically.
    // On error the dialog stays open so the waiter can retry.
  }

  const dialogTitle =
    sheetTable && sheetTable !== 'tableless'
      ? `Nueva comanda — Mesa ${sheetTable.number}`
      : 'Nueva comanda (para llevar)'

  return (
    <div className='flex-1 overflow-y-auto space-y-4 pb-2'>
      {/* Table grid */}
      {activeTables.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-3 h-40 text-muted-foreground'>
          <IconReceipt size={36} className='opacity-30' />
          <p className='text-sm'>No hay mesas configuradas</p>
        </div>
      ) : (
        <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2'>
          {activeTables.map((table) => {
            const activeOrder = table.active_order_id
              ? orderById.get(table.active_order_id)
              : null

            // ── Occupied: has an active order ──
            if (activeOrder) {
              const total = getTotal(activeOrder)
              const itemCount = activeOrder.order_items.filter(
                (i) => i.status !== 'cancelled',
              ).length
              const isReady = activeOrder.status === 'ready'

              return (
                <button
                  key={table.id}
                  onClick={() => navigate(`/restaurant/orders/${activeOrder.id}`)}
                  className={`rounded-xl border-2 p-3 flex flex-col items-center gap-1 text-center transition-all active:scale-[0.97] ${
                    ORDER_CARD_STYLE[activeOrder.status] ?? 'border-border bg-card'
                  }`}
                >
                  <span className='text-sm font-bold leading-none'>{table.number}</span>
                  <span
                    className={`inline-block w-2 h-2 rounded-full mt-0.5 ${
                      ORDER_DOT_STYLE[activeOrder.status] ?? 'bg-muted-foreground'
                    } ${isReady ? 'animate-pulse' : ''}`}
                  />
                  <span className='text-[11px] font-medium text-muted-foreground leading-none'>
                    {ORDER_STATUS_LABEL[activeOrder.status] ?? activeOrder.status}
                  </span>
                  <span className='text-[11px] text-muted-foreground leading-none'>
                    {itemCount} ítem{itemCount !== 1 ? 's' : ''}
                  </span>
                  <span className='text-xs font-semibold leading-none mt-0.5'>
                    {formatNumberToColombianPesos(total, true)}
                  </span>
                </button>
              )
            }

            // ── Available: tap to quick-create ──
            if (table.status === 'available') {
              return (
                <button
                  key={table.id}
                  onClick={() => openForTable(table)}
                  className='rounded-xl border-2 border-dashed border-border hover:border-primary/60 hover:bg-muted/30 p-3 flex flex-col items-center gap-1.5 text-center transition-all active:scale-[0.97]'
                >
                  <span className='text-sm font-bold text-foreground leading-none'>
                    {table.number}
                  </span>
                  <IconPlus size={14} className='text-muted-foreground' />
                  <span className='text-[11px] text-muted-foreground leading-none'>Libre</span>
                </button>
              )
            }

            // ── Non-interactive states ──
            return (
              <div
                key={table.id}
                className='rounded-xl border-2 border-border bg-muted/20 p-3 flex flex-col items-center gap-1 text-center opacity-50'
              >
                <span className='text-sm font-bold text-muted-foreground leading-none'>
                  {table.number}
                </span>
                <span className='text-[11px] text-muted-foreground leading-none'>
                  {TABLE_STATUS_LABEL[table.status] ?? table.status}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Tableless orders */}
      {tablelessOrders.length > 0 && (
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
              Para llevar / Sin mesa
            </p>
            <button
              onClick={openForTableless}
              className='text-xs text-primary font-medium flex items-center gap-1 hover:underline'
            >
              <IconPlus size={12} />
              Nueva
            </button>
          </div>
          {tablelessOrders.map((order) => {
            const total = getTotal(order)
            const activeItems = order.order_items.filter((i) => i.status !== 'cancelled')
            const isReady = order.status === 'ready'
            const isCobrarLoading = cobrarPendingId === order.id

            return (
              <div
                key={order.id}
                onClick={() => navigate(`/restaurant/orders/${order.id}`)}
                className={`rounded-xl border cursor-pointer transition-all active:scale-[0.99] ${
                  isReady
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20'
                    : 'border-border bg-card hover:bg-accent/40'
                }`}
              >
                <div className='flex items-center gap-3 px-4 py-3'>
                  <div className='flex-1 min-w-0'>
                    <p className='font-bold text-sm'>{order.order_number}</p>
                    <p className='text-xs text-muted-foreground'>
                      {activeItems.length} ítem{activeItems.length !== 1 ? 's' : ''} ·{' '}
                      {formatNumberToColombianPesos(total, true)}
                    </p>
                  </div>
                  {isReady && (
                    <Button
                      size='sm'
                      className='shrink-0 gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white'
                      disabled={activeItems.length === 0 || isCobrarLoading}
                      onClick={(e) => {
                        e.stopPropagation()
                        onCobrar(order.id)
                      }}
                    >
                      <IconReceipt size={13} />
                      {isCobrarLoading ? '...' : 'Cobrar'}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* "Para llevar" button when no tableless orders exist */}
      {tablelessOrders.length === 0 && (
        <div className='pt-1'>
          <button
            onClick={openForTableless}
            className='w-full rounded-xl border-2 border-dashed border-border hover:border-primary/60 hover:bg-muted/30 py-3 flex items-center justify-center gap-2 text-sm text-muted-foreground transition-all active:scale-[0.99]'
          >
            <IconPlus size={14} />
            Nueva comanda para llevar
          </button>
        </div>
      )}

      {/* Quick-create dialog */}
      <Dialog open={sheetTable !== null} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent className='sm:max-w-xs'>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>
          <div className='py-1'>
            <Label className='text-sm text-muted-foreground font-normal'>
              Notas <span className='text-muted-foreground'>(opcional)</span>
            </Label>
            <Textarea
              className='mt-1.5'
              placeholder='Ej: alergia al maní, sin sal...'
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={closeDialog} disabled={isCreating}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? 'Creando...' : 'Crear comanda'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { WaiterTableGrid }
