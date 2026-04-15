import { FC, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { IconPlus, IconTrash, IconPackage } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useComboItems } from '@/hooks/restaurant/useComboItems'
import { IRestaurantProductDetail } from '@/pages/Restaurant/types/RestaurantTypes'
import { axiosRequest } from '@/api/api'
import { restaurantMenuURL } from '@/utils/network'
import { useDebouncedCallback } from '@/hooks/useDebounceCallback'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNumberToColombianPesos } from '@/utils/helpers'

interface ComboEditorProps {
  menuItemId: number
  isLoadingProducts?: boolean
}

const ComboEditor: FC<ComboEditorProps> = ({ menuItemId, isLoadingProducts }) => {
  const { comboItems, isLoading, addItem, removeItem } = useComboItems(menuItemId)

  const [search, setSearch]               = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [quantity, setQuantity]           = useState('1')
  const [selected, setSelected]           = useState<{ id: number; name: string; selling_price: number; code: string } | null>(null)

  const updateDebounced = useDebouncedCallback((val: string) => setDebouncedSearch(val), 300)

  const { data: searchResults = [] } = useQuery({
    queryKey: ['menu-search-combo', debouncedSearch],
    queryFn: async () => {
      const url = new URL(restaurantMenuURL)
      url.searchParams.set('keyword', debouncedSearch)
      const response = await axiosRequest<{ results: IRestaurantProductDetail[] }>({ url, hasAuth: true })
      return response?.data?.results ?? []
    },
    enabled: debouncedSearch.trim().length >= 2 && !selected,
    staleTime: 1000 * 30,
  })

  const alreadyAdded = new Set(comboItems.map((ci) => ci.product_id))

  const filtered = searchResults.filter(
    (item) => item.id !== menuItemId && !alreadyAdded.has(item.product),
  )

  const handleAdd = () => {
    if (!selected) return
    const qty = parseInt(quantity, 10)
    if (!qty || qty < 1) { toast.error('Cantidad inválida'); return }
    addItem.mutate(
      { product_id: selected.id, quantity: qty },
      {
        onSuccess: () => {
          setSearch('')
          setSelected(null)
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

      {/* Add product — server-side menu search */}
      <div className='space-y-2'>
        <p className='text-sm font-medium'>Agregar producto</p>

        <Input
          placeholder='Buscar por nombre o código...'
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelected(null); updateDebounced(e.target.value) }}
        />

        {/* Results dropdown */}
        {debouncedSearch.trim().length >= 2 && !selected && (
          <div className='rounded-lg border border-border bg-card shadow-sm divide-y divide-border max-h-48 overflow-y-auto'>
            {filtered.length === 0 ? (
              <p className='px-4 py-3 text-sm text-muted-foreground'>Sin resultados</p>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelected({
                      id: item.product,
                      name: item.product_detail?.name ?? '',
                      selling_price: item.product_detail?.selling_price ?? 0,
                      code: item.product_detail?.code ?? '',
                    })
                    setSearch(item.product_detail?.name ?? '')
                  }}
                  className='w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-accent transition-colors'
                >
                  <div className='min-w-0'>
                    <p className='text-sm font-medium truncate'>{item.product_detail?.name}</p>
                    <p className='text-xs text-muted-foreground'>{item.product_detail?.code}</p>
                  </div>
                  <span className='text-xs text-muted-foreground shrink-0 ml-3'>
                    {formatNumberToColombianPesos(item.product_detail?.selling_price ?? 0, true)}
                  </span>
                </button>
              ))
            )}
          </div>
        )}

        {/* Selected + quantity + add */}
        {selected && (
          <div className='flex items-center gap-2 p-3 rounded-lg bg-muted/40 border border-border'>
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium truncate'>{selected.name}</p>
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
