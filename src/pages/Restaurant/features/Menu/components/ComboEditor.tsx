import { FC, useState } from 'react'
import { IconPlus, IconTrash, IconPackage } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useComboItems } from '@/hooks/restaurant/useComboItems'
import { IMenuProductDetail } from '@/pages/Restaurant/types/RestaurantTypes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNumberToColombianPesos } from '@/utils/helpers'

interface ComboEditorProps {
  menuItemId: number
  /** Full inventory list for product search */
  products: IMenuProductDetail[]
  isLoadingProducts: boolean
}

const ComboEditor: FC<ComboEditorProps> = ({ menuItemId, products, isLoadingProducts }) => {
  const { comboItems, isLoading, addItem, removeItem } = useComboItems(menuItemId)

  const [search, setSearch]         = useState('')
  const [quantity, setQuantity]     = useState('1')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const filtered = products.filter(
    (p) =>
      search.trim().length >= 2 &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase())),
  )

  const selectedProduct = products.find((p) => p.id === selectedId)

  const handleAdd = () => {
    if (!selectedId) return
    const qty = parseInt(quantity, 10)
    if (!qty || qty < 1) { toast.error('Cantidad inválida'); return }

    addItem.mutate(
      { product_id: selectedId, quantity: qty },
      {
        onSuccess: () => {
          setSearch('')
          setSelectedId(null)
          setQuantity('1')
          toast.success('Producto agregado al combo')
        },
        onError: (e: any) =>
          toast.error(e?.response?.data?.error ?? 'Error al agregar producto'),
      },
    )
  }

  const handleRemove = (comboItemId: number) => {
    removeItem.mutate(comboItemId, {
      onError: () => toast.error('Error al eliminar componente'),
    })
  }

  if (isLoading || isLoadingProducts) {
    return (
      <div className='space-y-2'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className='h-12 w-full rounded-lg' />
        ))}
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Current combo components */}
      {comboItems.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground border border-dashed border-border rounded-xl'>
          <IconPackage size={32} className='opacity-30' />
          <p className='text-sm'>Este combo no tiene productos aún.</p>
        </div>
      ) : (
        <div className='rounded-xl border border-border overflow-hidden divide-y divide-border'>
          {comboItems.map((ci) => (
            <div key={ci.id} className='flex items-center gap-3 px-4 py-3'>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold leading-tight truncate'>{ci.product_name}</p>
                <p className='text-xs text-muted-foreground'>×{ci.quantity}</p>
              </div>
              <button
                onClick={() => handleRemove(ci.id)}
                disabled={removeItem.isPending}
                className='shrink-0 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40'
              >
                <IconTrash size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add product */}
      <div className='space-y-2'>
        <p className='text-sm font-medium'>Agregar producto</p>

        {/* Search */}
        <Input
          placeholder='Buscar por nombre o código...'
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedId(null) }}
        />

        {/* Results dropdown */}
        {search.trim().length >= 2 && !selectedId && (
          <div className='rounded-lg border border-border bg-card shadow-sm divide-y divide-border max-h-48 overflow-y-auto'>
            {filtered.length === 0 ? (
              <p className='px-4 py-3 text-sm text-muted-foreground'>Sin resultados</p>
            ) : (
              filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedId(p.id); setSearch(p.name) }}
                  className='w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-accent transition-colors'
                >
                  <div className='min-w-0'>
                    <p className='text-sm font-medium truncate'>{p.name}</p>
                    <p className='text-xs text-muted-foreground'>{p.code}</p>
                  </div>
                  <span className='text-xs text-muted-foreground shrink-0 ml-3'>
                    {formatNumberToColombianPesos(p.selling_price, true)}
                  </span>
                </button>
              ))
            )}
          </div>
        )}

        {/* Selected + quantity + add */}
        {selectedId && selectedProduct && (
          <div className='flex items-center gap-2 p-3 rounded-lg bg-muted/40 border border-border'>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium truncate'>{selectedProduct.name}</p>
            </div>
            <Input
              type='number'
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className='w-16 text-center'
            />
            <Button size='sm' className='gap-1.5 shrink-0' onClick={handleAdd} disabled={addItem.isPending}>
              <IconPlus size={13} />
              {addItem.isPending ? '...' : 'Agregar'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export { ComboEditor }
