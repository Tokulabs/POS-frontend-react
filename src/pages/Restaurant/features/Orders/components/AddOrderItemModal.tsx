import { FC, useEffect, useRef, useState } from 'react'
import { debounce } from 'lodash'
import { useQueryClient } from '@tanstack/react-query'
import { IconSearch, IconMinus, IconPlus } from '@tabler/icons-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { axiosRequest } from '@/api/api'
import { restaurantMenuURL } from '@/utils/network'
import { IRestaurantProductDetail, MENU_CATEGORY_LABELS } from '@/pages/Restaurant/types/RestaurantTypes'
import { IPaginationProps } from '@/types/GlobalTypes'
import { formatNumberToColombianPesos } from '@/utils/helpers'

interface AddOrderItemModalProps {
  open: boolean
  isPending: boolean
  onAdd: (item: number, quantity: number, notes: string, selectedOptions?: { group_id: number; product_id: number }[]) => void
  onCancel: () => void
}

const AddOrderItemModal: FC<AddOrderItemModalProps> = ({ open, isPending, onAdd, onCancel }) => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<IRestaurantProductDetail[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selected, setSelected] = useState<IRestaurantProductDetail | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')

  // groupId → chosen productId
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({})
  const [optionErrors, setOptionErrors] = useState<number[]>([])

  const fetchMenuItems = async (keyword: string) => {
    if (!keyword.trim()) { setResults([]); return }
    setIsSearching(true)
    try {
      const url = new URL(restaurantMenuURL)
      url.searchParams.set('keyword', keyword)
      url.searchParams.set('available', 'true')
      const data = await queryClient.fetchQuery<IPaginationProps<IRestaurantProductDetail>>({
        queryKey: ['menuItemSearch', keyword],
        queryFn: () => axiosRequest<IPaginationProps<IRestaurantProductDetail>>({ url, hasAuth: true })
          .then((res) => res?.data ?? { count: 0, page: 1, results: [], next: null, previous: null }),
        staleTime: 30_000,
      })
      setResults(data.results)
    } finally {
      setIsSearching(false)
    }
  }

  const debouncedFetch = useRef(debounce((kw: string) => fetchMenuItems(kw), 300)).current

  useEffect(() => () => debouncedFetch.cancel(), [debouncedFetch])

  useEffect(() => {
    if (open) {
      setSearch(''); setResults([]); setSelected(null); setQuantity(1); setNotes('')
      setSelectedOptions({}); setOptionErrors([])
    }
  }, [open])

  const handleSelect = (item: IRestaurantProductDetail) => {
    setSelected(item)
    setSearch(item.product_detail.name)
    setResults([])
    setSelectedOptions({})
    setOptionErrors([])
  }

  const handleSubmit = () => {
    if (!selected) return

    const optionGroups = selected.option_groups ?? []

    // Validate required groups
    const missing = optionGroups
      .filter((g) => g.is_required && !(g.id in selectedOptions))
      .map((g) => g.id)

    if (missing.length > 0) {
      setOptionErrors(missing)
      return
    }

    const opts = Object.entries(selectedOptions).map(([groupId, productId]) => ({
      group_id: Number(groupId),
      product_id: productId,
    }))

    onAdd(selected.product, quantity, notes, opts.length > 0 ? opts : undefined)
  }

  const optionGroups = selected?.option_groups ?? []

  // Extra price from selected options — DecimalField comes as string, coerce to number
  const extraTotal = optionGroups.reduce((sum, group) => {
    const chosenId = selectedOptions[group.id]
    if (!chosenId) return sum
    const opt = group.options.find((o) => o.product_id === chosenId)
    return sum + Number(opt?.extra_price ?? 0)
  }, 0)

  const basePrice = Number(selected?.product_detail?.selling_price ?? 0)
  const subtotal = (basePrice + extraTotal) * quantity

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel() }}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Agregar producto a la orden</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          {/* Search */}
          <div className='space-y-2'>
            <div className='relative'>
              <IconSearch size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Buscar en el menú...'
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSelected(null); debouncedFetch(e.target.value) }}
                className='pl-8'
              />
            </div>

            {/* Results dropdown */}
            {(isSearching || results.length > 0) && !selected && (
              <div className='border border-border rounded-md max-h-48 overflow-y-auto'>
                {isSearching ? (
                  <div className='p-2 space-y-2'>
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className='h-9 w-full' />)}
                  </div>
                ) : (
                  results.map((item) => (
                    <button
                      key={item.id}
                      type='button'
                      className='w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-accent transition-colors text-left gap-3'
                      onClick={() => handleSelect(item)}
                    >
                      <div className='flex items-center gap-2 min-w-0'>
                        {item.product_detail.photo && (
                          <img
                            src={item.product_detail.photo}
                            alt=''
                            className='h-7 w-7 rounded object-cover shrink-0'
                          />
                        )}
                        <div className='min-w-0'>
                          <p className='font-medium truncate'>{item.product_detail.name}</p>
                          <Badge variant='outline' className='text-[10px] px-1 py-0 h-4'>
                            {MENU_CATEGORY_LABELS[item.menu_category]}
                          </Badge>
                        </div>
                      </div>
                      <span className='text-muted-foreground text-xs shrink-0'>
                        {formatNumberToColombianPesos(item.product_detail.selling_price, true)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}

            {!isSearching && search.trim() && results.length === 0 && !selected && (
              <p className='text-xs text-muted-foreground px-1'>Sin resultados en el menú.</p>
            )}
          </div>

          {/* Quantity & notes */}
          {selected && (
            <>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Cantidad</span>
                <div className='flex items-center gap-2'>
                  <Button
                    type='button' variant='outline' size='icon' className='h-7 w-7'
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <IconMinus size={12} />
                  </Button>
                  <span className='w-8 text-center text-sm font-semibold'>{quantity}</span>
                  <Button
                    type='button' variant='outline' size='icon' className='h-7 w-7'
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <IconPlus size={12} />
                  </Button>
                </div>
              </div>

              {/* Option group pickers — only for combos with option groups */}
              {optionGroups.length > 0 && (
                <div className='space-y-3'>
                  {optionGroups.map((group) => {
                    const hasError = optionErrors.includes(group.id)
                    const chosenId = selectedOptions[group.id]
                    return (
                      <div key={group.id} className='space-y-1.5'>
                        <div className='flex items-center gap-2'>
                          <span className='text-sm font-medium'>{group.name}</span>
                          {group.is_required ? (
                            <Badge variant='outline' className='text-[10px] h-4 px-1 text-orange-600 border-orange-300'>
                              Obligatorio
                            </Badge>
                          ) : (
                            <span className='text-xs text-muted-foreground'>(opcional)</span>
                          )}
                        </div>
                        <Select
                          value={chosenId ? String(chosenId) : ''}
                          onValueChange={(val) => {
                            setSelectedOptions((p) => ({ ...p, [group.id]: Number(val) }))
                            setOptionErrors((p) => p.filter((id) => id !== group.id))
                          }}
                        >
                          <SelectTrigger className={hasError ? 'border-destructive' : ''}>
                            <SelectValue placeholder='Seleccionar...' />
                          </SelectTrigger>
                          <SelectContent>
                            {group.options.map((opt) => (
                              <SelectItem key={opt.id} value={String(opt.product_id)}>
                                <span className='flex items-center justify-between gap-3 w-full'>
                                  <span>{opt.product_name}</span>
                                  {Number(opt.extra_price) > 0 && (
                                    <span className='text-xs text-orange-600 ml-2'>
                                      +{formatNumberToColombianPesos(Number(opt.extra_price), true)}
                                    </span>
                                  )}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {hasError && (
                          <p className='text-destructive text-xs'>Selecciona una opción.</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              <div className='space-y-1.5'>
                <label className='text-sm font-medium'>
                  Notas <span className='text-muted-foreground font-normal'>(opcional)</span>
                </label>
                <Textarea
                  placeholder='Ej: sin cebolla, punto de cocción...'
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className='flex items-center justify-between text-sm text-muted-foreground border-t border-border pt-2'>
                <span>Subtotal</span>
                <span className='font-semibold text-foreground'>
                  {formatNumberToColombianPesos(subtotal, true)}
                </span>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onCancel} disabled={isPending}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!selected || isPending}>
            {isPending ? 'Agregando...' : 'Agregar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { AddOrderItemModal }
