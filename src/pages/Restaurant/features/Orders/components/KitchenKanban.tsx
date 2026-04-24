import { FC, useEffect, useState } from 'react'
import { IconChefHat, IconClock } from '@tabler/icons-react'
import { IRestaurantOrder, IRestaurantOrderItem, OrderItemStatus } from '@/pages/Restaurant/types/RestaurantTypes'
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

// ── Timer helpers ─────────────────────────────────────────────────────────────

function formatElapsed(createdAt: string, now: number): string {
  const totalSecs = Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / 1000))
  const h = Math.floor(totalSecs / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = totalSecs % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function getElapsedColor(createdAt: string, now: number): string {
  const mins = Math.floor((now - new Date(createdAt).getTime()) / 60000)
  if (mins < 10) return 'text-emerald-600 dark:text-emerald-400'
  if (mins < 20) return 'text-amber-500 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
}

// Falls back to order created_at when item has no timestamp (pre-migration rows)
function itemTimestamp(item: IRestaurantOrderItem, orderCreatedAt: string): string {
  return item.created_at ?? orderCreatedAt
}

// ── Item status stripe ────────────────────────────────────────────────────────

const ITEM_STRIPE: Record<string, string> = {
  pending:   'border-l-4 border-l-muted-foreground/20',
  preparing: 'border-l-4 border-l-amber-500',
  served:    'border-l-4 border-l-emerald-500',
}

// ── Per-item action ───────────────────────────────────────────────────────────

const ITEM_NEXT: Partial<Record<OrderItemStatus, { status: OrderItemStatus; label: string; style: string }>> = {
  pending:  { status: 'preparing', label: 'INICIAR ORDEN', style: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white' },
  preparing:{ status: 'served',    label: 'Listo ✓',       style: 'border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-transparent hover:bg-emerald-50 dark:hover:bg-emerald-950/30' },
}

// ── Kitchen order card ────────────────────────────────────────────────────────

interface KitchenOrderCardProps {
  order: IRestaurantOrder
  now: number
  onItemStatus: (orderId: number, itemId: number, status: OrderItemStatus) => void
  onMarkAll: (orderId: number, fromStatus: OrderItemStatus, toStatus: OrderItemStatus) => void
  isUpdating: boolean
}

const STATUS_SORT: Record<string, number> = { pending: 0, preparing: 1, served: 2 }

const KitchenOrderCard: FC<KitchenOrderCardProps> = ({ order, now, onItemStatus, onMarkAll, isUpdating }) => {
  type ComboGroup  = { type: 'combo';   header: IRestaurantOrderItem; children: IRestaurantOrderItem[] }
  type RegularGroup = { type: 'regular'; item: IRestaurantOrderItem }
  type RenderGroup = ComboGroup | RegularGroup

  const renderGroups: RenderGroup[] = []
  for (const item of order.order_items) {
    if (item.status === 'cancelled') continue
    if (item.parent_item !== null) continue // handled under its combo header
    if (item.is_combo_header) {
      const children = order.order_items.filter(
        (c) => c.parent_item === item.id && c.status !== 'cancelled',
      )
      if (children.length > 0) renderGroups.push({ type: 'combo', header: item, children })
    } else {
      renderGroups.push({ type: 'regular', item })
    }
  }

  const groupMinStatus = (g: RenderGroup) =>
    g.type === 'regular'
      ? (STATUS_SORT[g.item.status] ?? 0)
      : Math.min(...g.children.map((c) => STATUS_SORT[c.status] ?? 0))
  renderGroups.sort((a, b) => groupMinStatus(a) - groupMinStatus(b))

  const nonServedCount = renderGroups.reduce((acc, g) => {
    if (g.type === 'regular') return acc + (g.item.status !== 'served' ? 1 : 0)
    return acc + g.children.filter((c) => c.status !== 'served').length
  }, 0)

  const renderItem = (item: IRestaurantOrderItem) => {
    const next     = ITEM_NEXT[item.status]
    const isServed = item.status === 'served'
    return (
      <div
        key={item.id}
        className={`pl-4 pr-5 py-4 ${ITEM_STRIPE[item.status] ?? ''} ${isServed ? 'bg-muted/40 opacity-50 grayscale' : ''}`}
      >
        <div className='flex items-start justify-between gap-3 mb-3'>
          <div className='flex-1 min-w-0'>
            <p className='text-base font-bold uppercase leading-tight'>
              {item.quantity} {item.item_name}
            </p>
            {item.notes && (
              <p className='w-full text-base font-black text-amber-600 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-lg px-3 py-2 uppercase tracking-wide'>
                ⚠ {item.notes}
              </p>
            )}
          </div>
          {isServed ? (
            <span className='shrink-0 text-emerald-600 dark:text-emerald-400 font-bold text-base'>✓</span>
          ) : (
            <div className={`flex items-center gap-1 font-mono font-semibold text-sm shrink-0 tabular-nums ${getElapsedColor(itemTimestamp(item, order.created_at), now)}`}>
              <IconClock size={13} />
              {formatElapsed(itemTimestamp(item, order.created_at), now)}
            </div>
          )}
        </div>
        {next && (
          <button
            className={`w-full py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors disabled:opacity-50 ${next.style}`}
            disabled={isUpdating}
            onClick={() => onItemStatus(order.id, item.id, next.status)}
          >
            {next.label}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className='rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col'>
      {/* ── Card header ── */}
      <div className='px-5 py-4 border-b border-border bg-muted/30'>
        <div className='flex items-start justify-between gap-4'>
          <div className='min-w-0'>
            <p className='text-2xl font-black uppercase leading-tight tracking-wide truncate'>
              {order.table_number ?? order.order_number}
            </p>
            <p className='text-sm text-muted-foreground mt-0.5'>
              {order.table_number ? order.order_number : null}
              {order.notes ? ` · ${order.notes}` : null}
            </p>
          </div>
        </div>
      </div>

      {/* ── Items ── */}
      <div className='flex-1 divide-y divide-border'>
        {renderGroups.length === 0 ? (
          <div className='px-5 py-6 text-center text-sm text-muted-foreground'>Sin ítems activos</div>
        ) : (
          renderGroups.map((group) => {
            if (group.type === 'regular') return renderItem(group.item)

            const allServed = group.children.every((c) => c.status === 'served')
            return (
              <div
                key={group.header.id}
                className={`border-l-4 border-l-violet-400 ${allServed ? 'opacity-50 grayscale' : ''}`}
              >
                <div className='px-4 pt-3 pb-1 bg-violet-50 dark:bg-violet-950/20'>
                  <p className='text-xs font-black uppercase tracking-widest text-violet-600 dark:text-violet-400'>
                    {group.header.quantity}× {group.header.item_name}
                  </p>
                </div>
                <div className='divide-y divide-border/60'>
                  {group.children.map((child) => renderItem(child))}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── Batch footer: Finalizar todos ── */}
      {nonServedCount > 0 && (
        <div className='px-5 py-4 border-t border-border bg-muted/10'>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className='w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-black uppercase tracking-widest transition-colors disabled:opacity-50'
                disabled={isUpdating}
              >
                ✓ FINALIZAR TODOS ({nonServedCount})
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Finalizar todos los ítems?</AlertDialogTitle>
                <AlertDialogDescription>
                  Se marcarán {nonServedCount} ítem{nonServedCount !== 1 ? 's' : ''} como
                  listos en la orden{order.table_number ? ` de la mesa ${order.table_number}` : ` ${order.order_number}`}.
                  Esta acción no se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className='bg-emerald-600 hover:bg-emerald-700 text-white'
                  onClick={() => {
                    onMarkAll(order.id, 'pending', 'served')
                    onMarkAll(order.id, 'preparing', 'served')
                  }}
                >
                  Sí, finalizar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  )
}

// ── Kitchen board ─────────────────────────────────────────────────────────────

interface KitchenKanbanProps {
  orders: IRestaurantOrder[]
  onItemStatus: (orderId: number, itemId: number, status: OrderItemStatus) => void
  onMarkAll: (orderId: number, fromStatus: OrderItemStatus, toStatus: OrderItemStatus) => void
  isUpdating: boolean
}

const KitchenKanban: FC<KitchenKanbanProps> = ({ orders, onItemStatus, onMarkAll, isUpdating }) => {
  // Single interval drives all real-time timers
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // Only show orders that still have work to do.
  // Exclude combo headers — kitchen works on children; headers stay 'pending' forever.
  const sorted = [...orders]
    .filter((o) => o.order_items.some((i) => !i.is_combo_header && i.status !== 'cancelled' && i.status !== 'served'))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  if (sorted.length === 0) {
    return (
      <div className='flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground'>
        <IconChefHat size={48} className='opacity-20' />
        <p className='text-sm'>Sin comandas activas</p>
      </div>
    )
  }

  return (
    <div className='flex flex-1 gap-4 overflow-x-auto overflow-y-hidden pb-2'>
      {sorted.map((order) => (
        <div key={order.id} className='w-[85vw] sm:w-80 shrink-0 h-full overflow-y-auto'>
          <KitchenOrderCard
            order={order}
            now={now}
            onItemStatus={onItemStatus}
            onMarkAll={onMarkAll}
            isUpdating={isUpdating}
          />
        </div>
      ))}
    </div>
  )
}

export { KitchenKanban }
