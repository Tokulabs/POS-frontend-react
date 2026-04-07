import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconPlus, IconReceipt } from '@tabler/icons-react'
import { IRestaurantOrder, ORDER_STATUS_LABELS } from '@/pages/Restaurant/types/RestaurantTypes'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatNumberToColombianPesos } from '@/utils/helpers'

const STATUS_BADGE: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  in_preparation: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  ready: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  billed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

const getTotal = (order: IRestaurantOrder) =>
  order.order_items
    .filter((i) => i.status !== 'cancelled')
    .reduce((s, i) => s + i.unit_price * i.quantity, 0)

interface WaiterOrderListProps {
  orders: IRestaurantOrder[]
  onCobrar: (orderId: number) => void
  cobrarPendingId: number | null
  onNewOrder: () => void
}

const WaiterOrderList: FC<WaiterOrderListProps> = ({ orders, onCobrar, cobrarPendingId, onNewOrder }) => {
  const navigate = useNavigate()

  // Ready orders first (most urgent), then by creation time (oldest first)
  const sorted = [...orders].sort((a, b) => {
    if (a.status === 'ready' && b.status !== 'ready') return -1
    if (b.status === 'ready' && a.status !== 'ready') return 1
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  if (!orders.length) {
    return (
      <div className='flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground'>
        <IconReceipt size={40} className='opacity-30' />
        <p className='text-sm'>No hay comandas activas</p>
        <Button size='sm' onClick={onNewOrder} className='gap-2'>
          <IconPlus size={14} />
          Nueva comanda
        </Button>
      </div>
    )
  }

  return (
    <div className='flex-1 overflow-y-auto space-y-2 pb-2'>
      {sorted.map((order) => {
        const isReady = order.status === 'ready'
        const total = getTotal(order)
        const activeItems = order.order_items.filter((i) => i.status !== 'cancelled')
        const isLoading = cobrarPendingId === order.id

        return (
          <div
            key={order.id}
            onClick={() => navigate(`/restaurant/orders/${order.id}`)}
            className={`rounded-xl border cursor-pointer transition-all active:scale-[0.99] ${
              isReady
                ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 shadow-sm'
                : 'border-border bg-card hover:bg-accent/40'
            }`}
          >
            <div className='flex items-center gap-3 px-4 py-3.5'>
              {/* Info */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 flex-wrap'>
                  <span className='font-bold text-sm'>{order.order_number}</span>
                  {order.table_number && (
                    <span className='text-xs text-muted-foreground'>· Mesa {order.table_number}</span>
                  )}
                  <Badge className={`text-xs border-0 ${STATUS_BADGE[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </div>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  {activeItems.length} ítem{activeItems.length !== 1 ? 's' : ''} ·{' '}
                  {formatNumberToColombianPesos(total, true)}
                </p>
              </div>

              {/* Cobrar button */}
              <Button
                size='sm'
                className={`shrink-0 gap-1.5 font-semibold min-w-[80px] ${
                  isReady ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
                }`}
                disabled={activeItems.length === 0 || isLoading}
                onClick={(e) => {
                  e.stopPropagation()
                  onCobrar(order.id)
                }}
              >
                <IconReceipt size={13} />
                {isLoading ? '...' : 'Cobrar'}
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export { WaiterOrderList }
