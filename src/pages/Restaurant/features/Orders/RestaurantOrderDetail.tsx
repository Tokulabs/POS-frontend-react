import { FC, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconPencil, IconPlus, IconReceipt, IconArrowsExchange } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import { axiosRequest } from '@/api/api'
import { restaurantOrdersURL } from '@/utils/network'
import { useRestaurantOrders } from '@/hooks/restaurant/useRestaurantOrders'
import { useRestaurantTables } from '@/hooks/restaurant/useRestaurantTables'
import { useRestaurantMode } from '@/store/useRestaurantMode'
import { useRestaurantWebSocket } from '@/hooks/restaurant/useRestaurantWebSocket'
import { ModeSwitcher } from './components/ModeSwitcher'
import { ORDER_STATUS_LABELS, OrderItemStatus, IRestaurantOrder, IRestaurantOrderItem } from '@/pages/Restaurant/types/RestaurantTypes'
import { OrderItemRow } from './components/OrderItemRow'
import { AddOrderItemModal } from './components/AddOrderItemModal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatNumberToColombianPesos } from '@/utils/helpers'

const ORDER_STATUS_BADGE: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300',
  open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  in_preparation: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  ready: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  billed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

const ITEM_NEXT_KITCHEN: Partial<Record<OrderItemStatus, { status: OrderItemStatus; label: string; style: string }>> = {
  pending: { status: 'preparing', label: '▶ Iniciar preparación', style: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white' },
  preparing: { status: 'served', label: '✓ Marcar como listo', style: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white' },
}

function getElapsed(createdAt: string): string {
  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
  return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h ${mins % 60}m`
}

const RestaurantOrderDetail: FC = () => {
  useRestaurantWebSocket()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const orderId = Number(id)
  const { mode } = useRestaurantMode()

  const { isLoading, data: order } = useQuery({
    queryKey: ['restaurant-order', orderId],
    queryFn: async () => {
      const res = await axiosRequest<IRestaurantOrder>({
        url: `${restaurantOrdersURL}${orderId}/`,
        hasAuth: true,
      })
      return res?.data ?? null
    },
    enabled: !!orderId,
    refetchOnWindowFocus: false,
  })

  const { addItem, removeItem, updateItem, updateItemStatus, convertToInvoice, updateOrder, moveItems } =
    useRestaurantOrders()
  const { tables } = useRestaurantTables()

  const [addItemOpen, setAddItemOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Record<number, number>>({})
  const [moveTableOpen, setMoveTableOpen] = useState(false)
  const [targetTableId, setTargetTableId] = useState<string>('')
  const [editingItem, setEditingItem] = useState<{ id: number; name: string; quantity: number; notes: string } | null>(null)

  if (isLoading) {
    return (
      <div className='bg-card h-full rounded-lg p-4 space-y-3'>
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-8 w-40' />
        <Skeleton className='h-64 w-full' />
      </div>
    )
  }

  if (!order) {
    return (
      <div className='bg-card h-full rounded-lg p-6 flex flex-col items-center justify-center gap-3 text-muted-foreground'>
        <IconReceipt size={40} className='opacity-40' />
        <p>Orden no encontrada.</p>
        <Button variant='outline' onClick={() => navigate('/restaurant/orders')}>
          Volver a comandas
        </Button>
      </div>
    )
  }

  const isBilledOrCancelled = order.status === 'billed' || order.status === 'cancelled'
  const activeItems = order.order_items.filter((i) => i.status !== 'cancelled')
  const total = activeItems.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)

  const toggleItemSelection = (item: { id: number; quantity: number }) => {
    setSelectedItems((prev) => {
      if (item.id in prev) {
        const { [item.id]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [item.id]: item.quantity }
    })
  }

  const updateMoveQuantity = (itemId: number, qty: number) => {
    setSelectedItems((prev) => ({ ...prev, [itemId]: qty }))
  }

  const handleAddItem = (
    item: number,
    quantity: number,
    notes: string,
    selectedOptions?: { group_id: number; product_id: number }[],
  ) => {
    addItem.mutate(
      { orderId, item, quantity, notes, selected_options: selectedOptions },
      {
        onSuccess: () => { toast.success('Producto agregado'); setAddItemOpen(false) },
        onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Error al agregar producto'),
      },
    )
  }

  const handleRemoveItem = (itemId: number) => {
    removeItem.mutate(
      { orderId, itemId },
      { onError: () => toast.error('Error al eliminar el producto') },
    )
  }

  const handleItemStatus = (itemId: number, status: OrderItemStatus) => {
    updateItemStatus.mutate(
      { orderId, itemId, status },
      { onError: () => toast.error('Error al actualizar el estado') },
    )
  }

  const handleConvertToInvoice = () => {
    convertToInvoice.mutate(orderId, {
      onSuccess: (response: any) => {
        const items: any[] = response?.data?.items ?? []

        // Merge items that share the same product code AND same effective price.
        // Items with the same code but different prices (e.g. two combos where one
        // had an option surcharge) stay as separate cart lines.
        const mergedMap = new Map<string, any>()
        items.forEach((item) => {
          const key = `${item.item_code}::${item.unit_price}`
          if (mergedMap.has(key)) {
            const existing = mergedMap.get(key)
            existing.quantity += item.quantity
            existing.total = existing.selling_price * existing.quantity
            existing.usd_total = existing.usd_price * existing.quantity
          } else {
            mergedMap.set(key, {
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
              extra_cost: item.extra_cost ?? 0,
            })
          }
        })
        const preloadedItems = Array.from(mergedMap.values())
        navigate('/pos', { state: { preloadedItems, restaurantOrderId: orderId } })
      },
      onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Error al facturar la orden'),
    })
  }

  const selectedCount = Object.keys(selectedItems).length

  const handleMoveItems = () => {
    if (!targetTableId || selectedCount === 0) return
    const items = Object.entries(selectedItems).map(([id, quantity]) => ({ id: Number(id), quantity }))
    moveItems.mutate(
      { orderId, items, targetTableId: Number(targetTableId) },
      {
        onSuccess: (response: any) => {
          const data = response?.data
          toast.success(`${data?.moved_count ?? selectedCount} ítem(s) movidos a ${data?.target_order_number ?? 'nueva orden'}`)
          setSelectedItems({})
          setMoveTableOpen(false)
          setTargetTableId('')
        },
        onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Error al mover los ítems'),
      },
    )
  }

  const handleCancelOrder = () => {
    updateOrder.mutate(
      { id: orderId, status: 'cancelled' },
      {
        onSuccess: () => {
          toast.success('Orden cancelada')
          navigate('/restaurant/orders')
        },
        onError: () => toast.error('Error al cancelar la orden'),
      },
    )
  }

  const handleConfirmOrder = () => {
    updateOrder.mutate(
      { id: orderId, status: 'open' },
      {
        onSuccess: () => toast.success('Pedido enviado a cocina'),
        onError: () => toast.error('Error al confirmar el pedido'),
      },
    )
  }

  const handleEditSave = () => {
    if (!editingItem) return
    updateItem.mutate(
      { orderId, itemId: editingItem.id, quantity: editingItem.quantity, notes: editingItem.notes },
      {
        onSuccess: () => { toast.success('Ítem actualizado'); setEditingItem(null) },
        onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Error al actualizar el ítem'),
      },
    )
  }

  const backPath = mode === 'normal' ? '/restaurant/tables' : '/restaurant/orders'
  const moveTargetTables = tables.filter((t) => t.id !== order.table)

  // ── Kitchen mode detail ───────────────────────────────────────────────────
  if (mode === 'kitchen') {
    // Kitchen works on actual cookable items: exclude combo headers (billing only), show children
    const kitchenItems = activeItems.filter((i) => !i.is_combo_header)
    const pendingItems = kitchenItems.filter((i) => i.status === 'pending')
    const preparingItems = kitchenItems.filter((i) => i.status === 'preparing')

    return (
      <div className='bg-card text-card-foreground h-full rounded-lg flex flex-col'>
        {/* Header */}
        <div className='flex items-center gap-3 p-4 border-b border-border'>
          <Button variant='ghost' size='icon' className='h-9 w-9 shrink-0' onClick={() => navigate(backPath)}>
            <IconArrowLeft size={18} />
          </Button>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 flex-wrap'>
              <span className='font-bold text-lg'>{order.order_number}</span>
              {order.table_number && (
                <span className='text-sm text-muted-foreground'>· Mesa {order.table_number}</span>
              )}
            </div>
            <p className='text-xs text-muted-foreground mt-0.5'>⏱ {getElapsed(order.confirmed_at ?? order.created_at)} desde el pedido</p>
          </div>
          <ModeSwitcher />
        </div>

        {/* Items — big touch targets */}
        <div className='flex-1 overflow-y-auto p-3 space-y-3'>
          {kitchenItems.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-40 text-muted-foreground gap-2'>
              <IconReceipt size={32} className='opacity-40' />
              <p className='text-sm'>Sin ítems activos</p>
            </div>
          ) : (
            kitchenItems.map((item: IRestaurantOrderItem) => {
              const next = ITEM_NEXT_KITCHEN[item.status]
              const isServed = item.status === 'served'
              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-4 transition-colors ${
                    isServed
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 opacity-70'
                      : 'bg-card border-border'
                  }`}
                >
                  <div className='flex items-start justify-between gap-3 mb-3'>
                    <div>
                      {item.parent_item !== null && (() => {
                        const parent = order.order_items.find((p) => p.id === item.parent_item)
                        return parent ? (
                          <p className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5'>
                            Combo: {parent.item_name}
                          </p>
                        ) : null
                      })()}
                      <p className='font-bold text-base leading-tight'>
                        {item.quantity}× {item.item_name}
                      </p>
                      {item.notes && (
                        <p className='text-sm text-amber-600 dark:text-amber-400 mt-1 font-medium'>
                          ⚠ {item.notes}
                        </p>
                      )}
                    </div>
                    {isServed && (
                      <span className='text-sm text-emerald-700 dark:text-emerald-400 font-bold shrink-0 mt-0.5'>
                        ✓ Listo
                      </span>
                    )}
                  </div>
                  {next && (
                    <button
                      className={`w-full py-3.5 rounded-lg font-semibold text-sm transition-colors ${next.style} disabled:opacity-50`}
                      disabled={updateItemStatus.isPending}
                      onClick={() => handleItemStatus(item.id, next.status)}
                    >
                      {next.label}
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Batch footer */}
        {!isBilledOrCancelled && (pendingItems.length > 0 || preparingItems.length > 0) && (
          <div className='border-t border-border p-4 flex gap-2'>
            {pendingItems.length > 0 && (
              <button
                className='flex-1 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold text-sm transition-colors disabled:opacity-50'
                disabled={updateItemStatus.isPending}
                onClick={() => pendingItems.forEach((i) => handleItemStatus(i.id, 'preparing'))}
              >
                ▶ Iniciar todos ({pendingItems.length})
              </button>
            )}
            {preparingItems.length > 0 && (
              <button
                className='flex-1 py-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm transition-colors disabled:opacity-50'
                disabled={updateItemStatus.isPending}
                onClick={() => preparingItems.forEach((i) => handleItemStatus(i.id, 'served'))}
              >
                ✓ Servir todos ({preparingItems.length})
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  // ── Waiter mode detail ────────────────────────────────────────────────────
  if (mode === 'waiter') {
    // Exclude combo children from grouping — they appear under their parent header
    const topLevelActive = activeItems.filter((i) => i.parent_item === null)

    // Combo headers never get marked served by the kitchen — derive status from children
    const effectiveStatus = (item: IRestaurantOrderItem): OrderItemStatus => {
      if (!item.is_combo_header || item.combo_children.length === 0) return item.status
      if (item.combo_children.every((c) => c.status === 'served' || c.status === 'cancelled')) return 'served'
      if (item.combo_children.some((c) => c.status === 'preparing')) return 'preparing'
      return 'pending'
    }

    const servedItems = topLevelActive.filter((i) => effectiveStatus(i) === 'served')
    const preparingItems = topLevelActive.filter((i) => effectiveStatus(i) === 'preparing')
    const pendingItems = topLevelActive.filter((i) => effectiveStatus(i) === 'pending')
    const progressPct = topLevelActive.length > 0 ? (servedItems.length / topLevelActive.length) * 100 : 0
    const allReady = topLevelActive.length > 0 && servedItems.length === topLevelActive.length

    const WaiterItemRow = ({ item }: { item: IRestaurantOrderItem }) => {
      // ── Combo header: show name + indented children ──
      if (item.is_combo_header) {
        return (
          <div className='border-b border-border last:border-0'>
            <div className='flex items-start gap-3 px-4 py-3'>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold leading-tight'>
                  {item.quantity}× {item.item_name}{' '}
                  <span className='text-xs font-normal text-muted-foreground'>(Combo)</span>
                </p>
                {item.notes && (
                  <p className='text-xs text-amber-600 dark:text-amber-400 mt-0.5'>⚠ {item.notes}</p>
                )}
              </div>
              {!isBilledOrCancelled && item.status === 'pending' && order.status === 'draft' && (
                <button
                  onClick={() => setEditingItem({ id: item.id, name: item.item_name, quantity: item.quantity, notes: item.notes })}
                  disabled={updateItem.isPending}
                  className='shrink-0 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 mt-0.5'
                >
                  <IconPencil size={13} />
                </button>
              )}
              {!isBilledOrCancelled && item.status === 'pending' && (
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={removeItem.isPending}
                  className='shrink-0 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40 mt-0.5 text-xs'
                >
                  ✕
                </button>
              )}
            </div>
            {item.combo_children.map((child) => (
              <div key={child.id} className='flex items-center gap-2 pl-8 pr-4 py-1.5 bg-muted/20'>
                <span className='text-xs text-muted-foreground w-4 text-center shrink-0'>{child.quantity}×</span>
                <p className='flex-1 text-xs text-muted-foreground truncate'>{child.item_name}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                  child.status === 'served'    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                  child.status === 'preparing' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {child.status === 'served' ? 'Listo' : child.status === 'preparing' ? 'Prep.' : 'Pendiente'}
                </span>
              </div>
            ))}
          </div>
        )
      }

      // ── Regular item ──
      return (
        <div className='flex items-start gap-3 px-4 py-3 border-b border-border last:border-0'>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-semibold leading-tight'>
              {item.quantity}× {item.item_name}
            </p>
            {item.notes && (
              <p className='text-xs text-amber-600 dark:text-amber-400 mt-0.5'>⚠ {item.notes}</p>
            )}
          </div>
          {!isBilledOrCancelled && item.status === 'pending' && order.status === 'draft' && (
            <button
              onClick={() => setEditingItem({ id: item.id, name: item.item_name, quantity: item.quantity, notes: item.notes })}
              disabled={updateItem.isPending}
              className='shrink-0 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 mt-0.5'
            >
              <IconPencil size={13} />
            </button>
          )}
          {!isBilledOrCancelled && item.status === 'pending' && (
            <button
              onClick={() => handleRemoveItem(item.id)}
              disabled={removeItem.isPending}
              className='shrink-0 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40 mt-0.5 text-xs'
            >
              ✕
            </button>
          )}
        </div>
      )
    }

    return (
      <div className='bg-card text-card-foreground h-full rounded-lg flex flex-col'>
        {/* Header */}
        <div className='flex items-center gap-3 p-4 border-b border-border'>
          <Button variant='ghost' size='icon' className='h-9 w-9 shrink-0' onClick={() => navigate(backPath)}>
            <IconArrowLeft size={18} />
          </Button>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 flex-wrap'>
              <span className='font-bold text-lg'>{order.order_number}</span>
              {order.table_number && (
                <span className='text-sm text-muted-foreground'>· Mesa {order.table_number}</span>
              )}
              <Badge className={`text-xs border-0 ${ORDER_STATUS_BADGE[order.status]}`}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            </div>
          </div>
          <div className='flex items-center gap-2 shrink-0'>
            <ModeSwitcher />
            {!isBilledOrCancelled && (
              <Button size='sm' variant='outline' className='gap-1.5' onClick={() => setAddItemOpen(true)}>
                <IconPlus size={14} />
                <span className='hidden sm:inline'>Agregar</span>
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {activeItems.length > 0 && (
          <div className='px-4 pt-3 pb-1 space-y-1'>
            <div className='flex items-center justify-between text-xs text-muted-foreground'>
              <span>{allReady ? '✓ Todo listo' : `${servedItems.length} de ${topLevelActive.length} ítems listos`}</span>
              <span className='font-medium'>{Math.round(progressPct)}%</span>
            </div>
            <div className='h-1.5 w-full bg-muted rounded-full overflow-hidden'>
              <div
                className={`h-full rounded-full transition-all duration-500 ${allReady ? 'bg-emerald-500' : 'bg-amber-400'}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Grouped items */}
        <div className='flex-1 overflow-y-auto'>
          {order.order_items.length === 0 ? (
            <div className='flex flex-col items-center justify-center gap-3 h-48 text-muted-foreground'>
              <IconReceipt size={32} className='opacity-40' />
              <p className='text-sm'>Sin productos. Agrega uno con el botón de arriba.</p>
            </div>
          ) : (
            <div className='py-1'>
              {/* Listos */}
              {servedItems.length > 0 && (
                <div>
                  <div className='flex items-center gap-2 px-4 pt-3 pb-1'>
                    <span className='text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide'>
                      Listos ({servedItems.length})
                    </span>
                    <div className='flex-1 h-px bg-emerald-200 dark:bg-emerald-800' />
                  </div>
                  {servedItems.map((item) => (
                    <div key={item.id} className='bg-emerald-50/60 dark:bg-emerald-950/20'>
                      <WaiterItemRow item={item} />
                    </div>
                  ))}
                </div>
              )}

              {/* En preparación */}
              {preparingItems.length > 0 && (
                <div>
                  <div className='flex items-center gap-2 px-4 pt-3 pb-1'>
                    <span className='text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide'>
                      En preparación ({preparingItems.length})
                    </span>
                    <div className='flex-1 h-px bg-amber-200 dark:bg-amber-800' />
                  </div>
                  {preparingItems.map((item) => (
                    <WaiterItemRow key={item.id} item={item} />
                  ))}
                </div>
              )}

              {/* Pendientes */}
              {pendingItems.length > 0 && (
                <div>
                  <div className='flex items-center gap-2 px-4 pt-3 pb-1'>
                    <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
                      Pendientes ({pendingItems.length})
                    </span>
                    <div className='flex-1 h-px bg-border' />
                  </div>
                  {pendingItems.map((item) => (
                    <WaiterItemRow key={item.id} item={item} />
                  ))}
                </div>
              )}

              {/* Cancelled items — minimal */}
              {order.order_items.filter((i) => i.status === 'cancelled').length > 0 && (
                <div className='px-4 pt-3 pb-1'>
                  <p className='text-xs text-muted-foreground opacity-60'>
                    {order.order_items.filter((i) => i.status === 'cancelled').length} ítem(s) cancelados
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky footer */}
        <div className='border-t border-border p-4 space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>Total ({topLevelActive.length} ítems)</span>
            <span className='text-lg font-bold'>{formatNumberToColombianPesos(total, true)}</span>
          </div>
          {!isBilledOrCancelled && (
            order.status === 'draft' ? (
              <Button
                className='w-full h-12 text-base font-bold gap-2'
                disabled={topLevelActive.length === 0 || updateOrder.isPending}
                onClick={handleConfirmOrder}
              >
                {updateOrder.isPending ? 'Confirmando...' : 'Confirmar y enviar a cocina'}
              </Button>
            ) : (
              <Button
                className={`w-full h-12 text-base font-bold gap-2 ${allReady ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                disabled={topLevelActive.length === 0 || convertToInvoice.isPending}
                onClick={handleConvertToInvoice}
              >
                <IconReceipt size={18} />
                {convertToInvoice.isPending ? 'Procesando...' : `Cobrar ${formatNumberToColombianPesos(total, true)}`}
              </Button>
            )
          )}
        </div>

        <AddOrderItemModal
          open={addItemOpen}
          isPending={addItem.isPending}
          onAdd={handleAddItem}
          onCancel={() => setAddItemOpen(false)}
        />

        {/* Edit item dialog — waiter mode */}
        <Dialog open={!!editingItem} onOpenChange={(open) => { if (!open) setEditingItem(null) }}>
          <DialogContent className='max-w-sm'>
            <DialogHeader>
              <DialogTitle>Editar ítem</DialogTitle>
            </DialogHeader>
            {editingItem && (
              <div className='space-y-4 py-1'>
                <p className='text-sm font-medium truncate'>{editingItem.name}</p>
                <div>
                  <p className='text-xs text-muted-foreground mb-2'>Cantidad</p>
                  <div className='flex items-center gap-3'>
                    <button
                      className='h-8 w-8 rounded border border-border flex items-center justify-center text-lg font-bold hover:bg-accent transition-colors'
                      onClick={() => setEditingItem((p) => p ? { ...p, quantity: Math.max(1, p.quantity - 1) } : p)}
                    >−</button>
                    <span className='w-8 text-center font-bold text-base'>{editingItem.quantity}</span>
                    <button
                      className='h-8 w-8 rounded border border-border flex items-center justify-center text-lg font-bold hover:bg-accent transition-colors'
                      onClick={() => setEditingItem((p) => p ? { ...p, quantity: p.quantity + 1 } : p)}
                    >+</button>
                  </div>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground mb-1'>Notas</p>
                  <input
                    className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'
                    placeholder='Ej: sin cebolla...'
                    value={editingItem.notes}
                    onChange={(e) => setEditingItem((p) => p ? { ...p, notes: e.target.value } : p)}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant='outline' onClick={() => setEditingItem(null)}>Cancelar</Button>
              <Button disabled={updateItem.isPending} onClick={handleEditSave}>
                {updateItem.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // ── Normal mode detail (unchanged) ────────────────────────────────────────
  return (
    <div className='bg-card text-card-foreground flex-1 min-h-0 rounded-lg flex flex-col'>
      {/* Header */}
      <div className='flex items-center gap-3 p-4 border-b border-border'>
        <Button
          variant='ghost'
          size='icon'
          className='h-9 w-9 shrink-0'
          onClick={() => navigate(backPath)}
        >
          <IconArrowLeft size={18} />
        </Button>

        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 flex-wrap'>
            <h1 className='text-xl font-bold'>{order.order_number}</h1>
            {order.table_number && (
              <span className='text-sm text-muted-foreground'>· Mesa {order.table_number}</span>
            )}
            <Badge className={`text-xs border-0 ${ORDER_STATUS_BADGE[order.status]}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>
          <p className='text-xs text-muted-foreground mt-0.5'>
            {new Date(order.created_at).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>

        <div className='flex items-center gap-2 shrink-0'>
          <ModeSwitcher />
          {!isBilledOrCancelled && (
            <div className='flex gap-2'>
              {selectedCount > 0 && (
                <Button size='sm' variant='outline' className='gap-1.5' onClick={() => setMoveTableOpen(true)}>
                  <IconArrowsExchange size={14} />
                  Mover ({selectedCount})
                </Button>
              )}
              <Button size='sm' variant='outline' className='gap-1.5' onClick={() => setAddItemOpen(true)}>
                <IconPlus size={14} />
                Agregar
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Items list */}
      <div className='flex-1 overflow-y-auto'>
        {order.order_items.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-3 h-48 text-muted-foreground'>
            <IconReceipt size={32} className='opacity-40' />
            <p className='text-sm'>Sin productos. Agrega uno con el botón de arriba.</p>
          </div>
        ) : (
          <div>
            {order.order_items.map((item) => (
              <OrderItemRow
                key={item.id}
                item={item}
                orderBilled={isBilledOrCancelled}
                onStatusChange={handleItemStatus}
                onRemove={handleRemoveItem}
                isUpdating={updateItemStatus.isPending || removeItem.isPending}
                isDraft={order.status === 'draft'}
                onEdit={(i) => setEditingItem({ id: i.id, name: i.item_name, quantity: i.quantity, notes: i.notes })}
                selectable={!isBilledOrCancelled && !(activeItems.length === 1 && activeItems[0].quantity === 1)}
                selected={item.id in selectedItems}
                moveQuantity={selectedItems[item.id]}
                onSelect={() => toggleItemSelection(item)}
                onMoveQuantityChange={updateMoveQuantity}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className='border-t border-border p-4 space-y-3'>
        <div className='flex items-center justify-between'>
          <span className='text-sm text-muted-foreground'>Total ({activeItems.length} ítems)</span>
          <span className='text-lg font-bold'>{formatNumberToColombianPesos(total, true)}</span>
        </div>

        {!isBilledOrCancelled && (
          <>
            <hr className='border-border' />
            <div className='flex items-center gap-2'>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant='outline' className='flex-1 text-destructive hover:text-destructive'>
                    Cancelar orden
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancelar orden</AlertDialogTitle>
                    <AlertDialogDescription>
                      ¿Estás seguro de que quieres cancelar la orden {order.order_number}? La mesa quedará disponible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Volver</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelOrder}
                      className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    >
                      Sí, cancelar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {order.status === 'draft' ? (
                <Button
                  className='flex-1 gap-2'
                  disabled={activeItems.length === 0 || updateOrder.isPending}
                  onClick={handleConfirmOrder}
                >
                  {updateOrder.isPending ? 'Confirmando...' : 'Confirmar y enviar a cocina'}
                </Button>
              ) : (
                <Button
                  className='flex-1 gap-2'
                  disabled={activeItems.length === 0 || convertToInvoice.isPending}
                  onClick={handleConvertToInvoice}
                >
                  <IconReceipt size={15} />
                  {convertToInvoice.isPending ? 'Procesando...' : 'Cobrar'}
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      <AddOrderItemModal
        open={addItemOpen}
        isPending={addItem.isPending}
        onAdd={handleAddItem}
        onCancel={() => setAddItemOpen(false)}
      />

      {/* Edit item dialog — normal mode */}
      <Dialog open={!!editingItem} onOpenChange={(open) => { if (!open) setEditingItem(null) }}>
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>Editar ítem</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className='space-y-4 py-1'>
              <p className='text-sm font-medium truncate'>{editingItem.name}</p>
              <div>
                <p className='text-xs text-muted-foreground mb-2'>Cantidad</p>
                <div className='flex items-center gap-3'>
                  <button
                    className='h-8 w-8 rounded border border-border flex items-center justify-center text-lg font-bold hover:bg-accent transition-colors'
                    onClick={() => setEditingItem((p) => p ? { ...p, quantity: Math.max(1, p.quantity - 1) } : p)}
                  >−</button>
                  <span className='w-8 text-center font-bold text-base'>{editingItem.quantity}</span>
                  <button
                    className='h-8 w-8 rounded border border-border flex items-center justify-center text-lg font-bold hover:bg-accent transition-colors'
                    onClick={() => setEditingItem((p) => p ? { ...p, quantity: p.quantity + 1 } : p)}
                  >+</button>
                </div>
              </div>
              <div>
                <p className='text-xs text-muted-foreground mb-1'>Notas</p>
                <input
                  className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'
                  placeholder='Ej: sin cebolla...'
                  value={editingItem.notes}
                  onChange={(e) => setEditingItem((p) => p ? { ...p, notes: e.target.value } : p)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditingItem(null)}>Cancelar</Button>
            <Button disabled={updateItem.isPending} onClick={handleEditSave}>
              {updateItem.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move items dialog */}
      <Dialog open={moveTableOpen} onOpenChange={(open) => { setMoveTableOpen(open); if (!open) setTargetTableId('') }}>
        <DialogContent className='max-w-sm'>
          <DialogHeader>
            <DialogTitle>Mover ítems a otra mesa</DialogTitle>
          </DialogHeader>
          <p className='text-sm text-muted-foreground'>
            Selecciona la mesa destino para los <span className='font-semibold'>{selectedCount} ítem(s)</span> seleccionados.
            Si la mesa no tiene una orden activa, se creará una nueva.
          </p>
          <Select value={targetTableId} onValueChange={setTargetTableId}>
            <SelectTrigger>
              <SelectValue placeholder='Seleccionar mesa destino' />
            </SelectTrigger>
            <SelectContent>
              {moveTargetTables.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  Mesa {t.number} — {t.status === 'occupied' ? 'Ocupada' : t.status === 'available' ? 'Disponible' : t.status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant='outline' onClick={() => setMoveTableOpen(false)}>Cancelar</Button>
            <Button disabled={!targetTableId || moveItems.isPending} onClick={handleMoveItems}>
              {moveItems.isPending ? 'Moviendo...' : 'Mover ítems'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export { RestaurantOrderDetail }
