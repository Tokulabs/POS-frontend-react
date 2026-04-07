import { FC, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconPlus, IconReceipt, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useRestaurantOrders } from '@/hooks/restaurant/useRestaurantOrders'
import { useRestaurantTables } from '@/hooks/restaurant/useRestaurantTables'
import { useRestaurantMode } from '@/store/useRestaurantMode'
import { useRestaurantWebSocket } from '@/hooks/restaurant/useRestaurantWebSocket'
import { ORDER_STATUS_LABELS, IRestaurantOrder, OrderStatus, OrderItemStatus } from '@/pages/Restaurant/types/RestaurantTypes'
import { CreateOrderModal } from './components/CreateOrderModal'
import { ModeSwitcher } from './components/ModeSwitcher'
import { KitchenKanban } from './components/KitchenKanban'
import { WaiterTableGrid } from './components/WaiterTableGrid'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatNumberToColombianPesos } from '@/utils/helpers'

const PAGE_SIZE = 10

const ORDER_STATUS_BADGE: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  in_preparation: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  ready: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  billed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

const ACTIVE_STATUSES: OrderStatus[] = ['open', 'in_preparation', 'ready']

const getTotal = (order: IRestaurantOrder) => {
  const activeItems = order.order_items.filter((i) => i.status !== 'cancelled')
  return activeItems.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
}

const RestaurantOrders: FC = () => {
  useRestaurantWebSocket()
  const navigate = useNavigate()
  const { mode } = useRestaurantMode()
  const [createOpen, setCreateOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('active')
  const [historySearchInput, setHistorySearchInput] = useState('')
  const [historyKeyword, setHistoryKeyword] = useState('')
  const [historyPage, setHistoryPage] = useState(1)
  const [cobrarPendingId, setCobrarPendingId] = useState<number | null>(null)

  const {
    isLoading: isActiveLoading,
    orders: activeOrders,
    createOrder,
    updateItemStatus,
    convertToInvoice,
  } = useRestaurantOrders(ACTIVE_STATUSES)

  const historyStatus: OrderStatus[] = activeTab === 'billed' ? ['billed'] : ['cancelled']
  const { isLoading: isHistoryLoading, orders: historyOrders, totalCount: historyTotal } =
    useRestaurantOrders(historyStatus, { keyword: historyKeyword, page: historyPage })

  const historyTotalPages = Math.max(1, Math.ceil(historyTotal / PAGE_SIZE))
  const { tables } = useRestaurantTables()

  useEffect(() => { setHistoryPage(1) }, [historyKeyword, activeTab])

  const handleHistorySearch = (e: { preventDefault(): void }) => {
    e.preventDefault()
    setHistoryKeyword(historySearchInput.trim())
  }

  const handleCreate = (tableId: number | null, notes: string) => {
    createOrder.mutate(
      { table: tableId ?? undefined, notes },
      {
        onSuccess: (response: any) => {
          const order = response?.data
          setCreateOpen(false)
          if (order?.id) navigate(`/restaurant/orders/${order.id}`)
        },
        onError: () => toast.error('Error al crear la comanda'),
      },
    )
  }

  // Kitchen mode handlers
  const handleItemStatus = (orderId: number, itemId: number, status: OrderItemStatus) => {
    updateItemStatus.mutate(
      { orderId, itemId, status },
      { onError: () => toast.error('Error al actualizar el estado') },
    )
  }

  const handleMarkAll = (orderId: number, fromStatus: OrderItemStatus, toStatus: OrderItemStatus) => {
    const order = activeOrders.find((o) => o.id === orderId)
    if (!order) return
    order.order_items
      .filter((i) => i.status === fromStatus)
      .forEach((item) => {
        updateItemStatus.mutate(
          { orderId, itemId: item.id, status: toStatus },
          { onError: () => toast.error('Error al actualizar el estado') },
        )
      })
  }

  // Waiter mode cobrar handler
  const handleWaiterCobrar = (orderId: number) => {
    setCobrarPendingId(orderId)
    convertToInvoice.mutate(orderId, {
      onSuccess: (response: any) => {
        const items: any[] = response?.data?.items ?? []
        const preloadedItems = items.map((item) => ({
          id: Number(item.item_id),
          code: item.item_code,
          name: item.item_name,
          selling_price: item.unit_price,
          usd_price: item.usd_price ?? 0,
          discount: 0,
          quantity: item.quantity,
          total: item.unit_price * item.quantity,
          usd_total: (item.usd_price ?? 0) * item.quantity,
          is_gift: false,
          total_in_shops: item.skip_stock_check ? 9999 : (item.total_in_shops ?? 0),
          tax: item.tax_percentage != null ? { percentage: item.tax_percentage } : null,
          skip_stock_check: item.skip_stock_check ?? false,
        }))
        setCobrarPendingId(null)
        navigate('/pos', { state: { preloadedItems, restaurantOrderId: orderId } })
      },
      onError: (e: any) => {
        setCobrarPendingId(null)
        toast.error(e?.response?.data?.error ?? 'Error al facturar la orden')
      },
    })
  }

  const isActive = activeTab === 'active'
  const isLoading = isActive ? isActiveLoading : isHistoryLoading
  const displayedOrders = isActive ? activeOrders : historyOrders

  // ── Kitchen mode ──────────────────────────────────────────────────────────
  if (mode === 'kitchen') {
    return (
      <div className='bg-card text-card-foreground h-full rounded-lg p-4 flex flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-xl font-semibold'>Cocina</h1>
          <ModeSwitcher />
        </div>
        {isActiveLoading ? (
          <div className='space-y-2'>
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className='h-32 w-full rounded-xl' />)}
          </div>
        ) : (
          <KitchenKanban
            orders={activeOrders}
            onItemStatus={handleItemStatus}
            onMarkAll={handleMarkAll}
            isUpdating={updateItemStatus.isPending}
          />
        )}
      </div>
    )
  }

  // ── Waiter mode ───────────────────────────────────────────────────────────
  if (mode === 'waiter') {
    const handleWaiterQuickCreate = (tableId: number | null, notes: string) => {
      createOrder.mutate(
        { table: tableId ?? undefined, notes },
        {
          onSuccess: (response: any) => {
            const order = response?.data
            if (order?.id) navigate(`/restaurant/orders/${order.id}`)
          },
          onError: () => toast.error('Error al crear la comanda'),
        },
      )
    }

    return (
      <div className='bg-card text-card-foreground h-full rounded-lg p-4 flex flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-xl font-semibold'>Mesas</h1>
          <ModeSwitcher />
        </div>
        {isActiveLoading ? (
          <div className='grid grid-cols-3 sm:grid-cols-4 gap-2'>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className='h-24 w-full rounded-xl' />
            ))}
          </div>
        ) : (
          <WaiterTableGrid
            tables={tables}
            orders={activeOrders}
            onCobrar={handleWaiterCobrar}
            cobrarPendingId={cobrarPendingId}
            onQuickCreate={handleWaiterQuickCreate}
            isCreating={createOrder.isPending}
          />
        )}
      </div>
    )
  }

  // ── Normal mode ───────────────────────────────────────────────────────────
  return (
    <div className='bg-card text-card-foreground h-full rounded-lg p-6 flex flex-col gap-5'>
      {/* Header */}
      <div className='flex justify-between items-center gap-3'>
        <h1 className='text-2xl font-semibold text-foreground'>Comandas</h1>
        <div className='flex items-center gap-2'>
          <ModeSwitcher />
          <Button size='sm' className='gap-2' onClick={() => setCreateOpen(true)}>
            <IconPlus size={15} />
            Nueva comanda
          </Button>
        </div>
      </div>

      {/* Status tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value='active' className='text-xs'>
            Activas
            <span className='ml-1.5 text-muted-foreground'>({activeOrders.length})</span>
          </TabsTrigger>
          <TabsTrigger value='billed' className='text-xs'>Facturadas</TabsTrigger>
          <TabsTrigger value='cancelled' className='text-xs'>Canceladas</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search bar for history tabs */}
      {!isActive && (
        <form onSubmit={handleHistorySearch} className='flex gap-2'>
          <Input
            placeholder='Buscar por número de comanda...'
            value={historySearchInput}
            onChange={(e) => {
              setHistorySearchInput(e.target.value)
              if (e.target.value === '') setHistoryKeyword('')
            }}
            className='w-64'
          />
          <Button type='submit' variant='outline' size='sm'>Buscar</Button>
        </form>
      )}

      {/* Orders list */}
      <div className='flex-1 overflow-y-auto'>
        {isLoading ? (
          <div className='space-y-2'>
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className='h-16 w-full' />)}
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-3 h-48 text-muted-foreground'>
            <IconReceipt size={36} className='opacity-40' />
            <p className='text-sm'>
              {!isActive && historyKeyword
                ? 'Sin resultados para tu búsqueda.'
                : 'No hay comandas en esta categoría.'}
            </p>
          </div>
        ) : (
          <div className='space-y-2'>
            {displayedOrders.map((order) => (
              <div
                key={order.id}
                className='flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors'
                onClick={() => navigate(`/restaurant/orders/${order.id}`)}
              >
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <span className='font-semibold text-sm'>{order.order_number}</span>
                    {order.table_number && (
                      <span className='text-xs text-muted-foreground'>· Mesa {order.table_number}</span>
                    )}
                    <Badge className={`text-xs border-0 ${ORDER_STATUS_BADGE[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </div>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    {new Date(order.created_at).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}
                    {' · '}
                    {order.order_items.filter((i) => i.status !== 'cancelled').length} ítems
                  </p>
                </div>
                <span className='font-bold text-sm shrink-0'>
                  {formatNumberToColombianPesos(getTotal(order), true)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination for history tabs */}
      {!isActive && historyTotalPages > 1 && (
        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <span>{historyTotal} comandas · Página {historyPage} de {historyTotalPages}</span>
          <div className='flex items-center gap-1'>
            <Button variant='ghost' size='icon' className='h-8 w-8' disabled={historyPage <= 1} onClick={() => setHistoryPage((p) => p - 1)}>
              <IconChevronLeft size={15} />
            </Button>
            <Button variant='ghost' size='icon' className='h-8 w-8' disabled={historyPage >= historyTotalPages} onClick={() => setHistoryPage((p) => p + 1)}>
              <IconChevronRight size={15} />
            </Button>
          </div>
        </div>
      )}

      <CreateOrderModal
        open={createOpen}
        isPending={createOrder.isPending}
        tables={tables}
        onCreate={handleCreate}
        onCancel={() => setCreateOpen(false)}
      />
    </div>
  )
}

export { RestaurantOrders }
