import { FC, useEffect, useRef, useState } from 'react'
import { debounce } from 'lodash'
import { useQueryClient } from '@tanstack/react-query'
import {
  IconSearch,
  IconX,
  IconCheck,
  IconChevronRight,
  IconChevronLeft,
  IconPackage,
} from '@tabler/icons-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { MenuCategory, MENU_CATEGORY_LABELS, IRestaurantProductDetail } from '@/pages/Restaurant/types/RestaurantTypes'
import { getInventoriesNew } from '@/pages/Inventories/helpers/services'
import { IInventoryProps } from '@/pages/Inventories/types/InventoryTypes'

const MENU_CATEGORIES = Object.entries(MENU_CATEGORY_LABELS) as [MenuCategory, string][]

interface RowConfig {
  product: IInventoryProps
  menu_category: MenuCategory
  prep_time_minutes: number
  skip_stock_check: boolean
}

export interface BulkMenuItemPayload {
  product: number
  menu_category: MenuCategory
  prep_time_minutes: number
  skip_stock_check: boolean
  prep_notes: string
}

interface BulkAddToMenuModalProps {
  open: boolean
  existingMenuItems: IRestaurantProductDetail[]
  onSubmit: (items: BulkMenuItemPayload[]) => void
  onCancel: () => void
  isPending: boolean
}

const BulkAddToMenuModal: FC<BulkAddToMenuModalProps> = ({
  open,
  existingMenuItems,
  onSubmit,
  onCancel,
  isPending,
}) => {
  const queryClient = useQueryClient()

  // Step 1 state
  const [step, setStep] = useState<1 | 2>(1)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<IInventoryProps[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selected, setSelected] = useState<IInventoryProps[]>([])

  // Step 2 state
  const [rows, setRows] = useState<RowConfig[]>([])
  const [bulkCategory, setBulkCategory] = useState<MenuCategory>('main')
  const [bulkSkipStock, setBulkSkipStock] = useState(true)

  const existingProductIds = new Set(existingMenuItems.map((m) => m.product))

  const fetchProducts = async (keyword: string) => {
    if (!keyword.trim()) { setResults([]); return }
    try {
      setIsSearching(true)
      const data = await queryClient.fetchQuery({
        queryKey: ['bulkMenuProductSearch', keyword],
        queryFn: () => getInventoriesNew({ keyword, active: 'True', page: 1 }),
        staleTime: 30_000,
        gcTime: 60_000,
      })
      setResults(data?.results ?? [])
    } finally {
      setIsSearching(false)
    }
  }

  const debouncedFetch = useRef(debounce((kw: string) => fetchProducts(kw), 300)).current
  useEffect(() => () => debouncedFetch.cancel(), [debouncedFetch])

  useEffect(() => {
    if (open) {
      setStep(1)
      setSearch('')
      setResults([])
      setSelected([])
      setRows([])
      setBulkCategory('main')
      setBulkSkipStock(true)
    }
  }, [open])

  const isAlreadyInMenu = (id: number) => existingProductIds.has(id)
  const isSelectedNow = (id: number) => selected.some((p) => p.id === id)

  const toggleProduct = (product: IInventoryProps) => {
    if (isAlreadyInMenu(product.id)) return
    setSelected((prev) =>
      prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product],
    )
  }

  const removeFromSelected = (id: number) => {
    setSelected((prev) => prev.filter((p) => p.id !== id))
  }

  const goToStep2 = () => {
    setRows(
      selected.map((p) => ({
        product: p,
        menu_category: 'main',
        prep_time_minutes: 0,
        skip_stock_check: true,
      })),
    )
    setStep(2)
  }

  const applyToAll = () => {
    setRows((prev) =>
      prev.map((r) => ({ ...r, menu_category: bulkCategory, skip_stock_check: bulkSkipStock })),
    )
  }

  const updateRow = <K extends keyof RowConfig>(index: number, key: K, value: RowConfig[K]) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [key]: value } : r)))
  }

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index))
    setSelected((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (rows.length === 0) return
    onSubmit(rows.map((r) => ({ product: r.product.id, menu_category: r.menu_category, prep_time_minutes: r.prep_time_minutes, skip_stock_check: r.skip_stock_check, prep_notes: '' })))
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel() }}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] flex flex-col'>
        <DialogHeader>
          <div className='flex items-center gap-3'>
            <DialogTitle>Agregar varios productos al menú</DialogTitle>
            <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
              <span className={step === 1 ? 'text-foreground font-medium' : ''}>1. Seleccionar</span>
              <IconChevronRight size={12} />
              <span className={step === 2 ? 'text-foreground font-medium' : ''}>2. Configurar</span>
            </div>
          </div>
        </DialogHeader>

        {/* ── Step 1: product picker ─────────────────────────────────────── */}
        {step === 1 && (
          <div className='flex flex-col gap-4 flex-1 min-h-0'>
            {/* Search */}
            <div className='relative'>
              <IconSearch size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Buscar productos del inventario...'
                value={search}
                onChange={(e) => { setSearch(e.target.value); debouncedFetch(e.target.value) }}
                className='pl-8'
                autoFocus
              />
            </div>

            {/* Results list */}
            <div className='h-64 overflow-y-auto border border-border rounded-md'>
              {isSearching ? (
                <div className='p-2 space-y-1.5'>
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className='h-10 w-full' />)}
                </div>
              ) : !search.trim() ? (
                <div className='flex flex-col items-center justify-center gap-2 h-full text-muted-foreground text-sm py-10'>
                  <IconSearch size={20} className='opacity-40' />
                  Escribe para buscar productos
                </div>
              ) : results.length === 0 ? (
                <div className='flex flex-col items-center justify-center gap-2 h-full text-muted-foreground text-sm py-10'>
                  <IconPackage size={20} className='opacity-40' />
                  Sin resultados para &ldquo;{search}&rdquo;
                </div>
              ) : (
                results.map((product) => {
                  const inMenu = isAlreadyInMenu(product.id)
                  const isChosen = isSelectedNow(product.id)
                  return (
                    <button
                      key={product.id}
                      type='button'
                      disabled={inMenu}
                      onClick={() => toggleProduct(product)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors text-left border-b border-border last:border-0
                        ${inMenu ? 'opacity-40 cursor-not-allowed' : 'hover:bg-accent cursor-pointer'}
                        ${isChosen ? 'bg-accent' : ''}
                      `}
                    >
                      <div className='flex items-center gap-2.5'>
                        <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors
                          ${isChosen ? 'bg-primary border-primary' : 'border-muted-foreground/40'}
                        `}>
                          {isChosen && <IconCheck size={11} className='text-primary-foreground' strokeWidth={3} />}
                        </div>
                        <span className='font-medium'>{product.name}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs text-muted-foreground'>{product.code}</span>
                        {inMenu && <Badge variant='secondary' className='text-xs py-0 h-5'>Ya en menú</Badge>}
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Selected chips */}
            {selected.length > 0 && (
              <div className='space-y-2'>
                <p className='text-xs text-muted-foreground font-medium'>{selected.length} seleccionado{selected.length !== 1 ? 's' : ''}</p>
                <div className='flex flex-wrap gap-1.5'>
                  {selected.map((p) => (
                    <Badge key={p.id} variant='secondary' className='gap-1 pl-2 pr-1 py-1'>
                      {p.name}
                      <button
                        type='button'
                        onClick={() => removeFromSelected(p.id)}
                        className='hover:text-destructive transition-colors ml-0.5'
                      >
                        <IconX size={11} strokeWidth={2.5} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter className='pt-0'>
              <Button variant='outline' onClick={onCancel}>Cancelar</Button>
              <Button onClick={goToStep2} disabled={selected.length === 0}>
                Configurar {selected.length > 0 ? `${selected.length} producto${selected.length !== 1 ? 's' : ''}` : ''}
                <IconChevronRight size={15} className='ml-1' />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* ── Step 2: configure rows ─────────────────────────────────────── */}
        {step === 2 && (
          <div className='flex flex-col gap-4 flex-1 min-h-0'>
            {/* Apply-to-all bar */}
            <div className='flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5'>
              <span className='text-xs font-medium text-muted-foreground whitespace-nowrap'>Aplicar a todos:</span>
              <Select value={bulkCategory} onValueChange={(v) => setBulkCategory(v as MenuCategory)}>
                <SelectTrigger className='h-8 text-xs w-44'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MENU_CATEGORIES.filter(([v]) => v !== 'combo').map(([value, label]) => (
                    <SelectItem key={value} value={value} className='text-xs'>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                <Switch
                  checked={bulkSkipStock}
                  onCheckedChange={setBulkSkipStock}
                  className='scale-75 origin-left'
                />
                Cocina
              </div>
              <Button size='sm' variant='outline' className='h-8 text-xs ml-auto' onClick={applyToAll}>
                <IconCheck size={13} className='mr-1' />
                Aplicar
              </Button>
            </div>

            {/* Rows table */}
            <div className='flex-1 min-h-0 max-h-[340px] overflow-y-auto'>
              <div className='space-y-1.5 pr-1'>
                {rows.map((row, idx) => (
                  <div
                    key={row.product.id}
                    className='grid items-center gap-2 rounded-lg border border-border bg-background px-3 py-2'
                    style={{ gridTemplateColumns: '1fr 10rem 5rem auto auto' }}
                  >
                    {/* Product name */}
                    <div className='min-w-0'>
                      <p className='text-sm font-medium truncate'>{row.product.name}</p>
                      <p className='text-xs text-muted-foreground'>{row.product.code}</p>
                    </div>

                    {/* Category */}
                    <Select
                      value={row.menu_category}
                      onValueChange={(v) => updateRow(idx, 'menu_category', v as MenuCategory)}
                    >
                      <SelectTrigger className='h-8 text-xs'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MENU_CATEGORIES.filter(([v]) => v !== 'combo').map(([value, label]) => (
                          <SelectItem key={value} value={value} className='text-xs'>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Prep time */}
                    <Input
                      type='number'
                      min={0}
                      value={row.prep_time_minutes}
                      onChange={(e) => updateRow(idx, 'prep_time_minutes', Math.max(0, parseInt(e.target.value) || 0))}
                      className='h-8 text-xs text-center'
                      title='Tiempo de preparación (min)'
                    />

                    {/* Skip stock toggle */}
                    <div className='flex items-center justify-center' title='Preparado en cocina'>
                      <Switch
                        checked={row.skip_stock_check}
                        onCheckedChange={(v) => updateRow(idx, 'skip_stock_check', v)}
                        className='scale-75'
                      />
                    </div>

                    {/* Remove */}
                    <button
                      type='button'
                      onClick={() => removeRow(idx)}
                      className='text-muted-foreground hover:text-destructive transition-colors'
                      title='Quitar'
                    >
                      <IconX size={15} strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Column legend */}
            <div
              className='grid text-xs text-muted-foreground px-3'
              style={{ gridTemplateColumns: '1fr 10rem 5rem auto auto' }}
            >
              <span>Producto</span>
              <span>Categoría</span>
              <span className='text-center'>Min prep.</span>
              <span className='text-center' title='Preparado en cocina (no valida stock)'>Cocina</span>
              <span />
            </div>

            <DialogFooter className='pt-0'>
              <Button variant='outline' onClick={() => setStep(1)} disabled={isPending}>
                <IconChevronLeft size={15} className='mr-1' />
                Atrás
              </Button>
              <Button onClick={handleSubmit} disabled={isPending || rows.length === 0}>
                {isPending
                  ? 'Agregando...'
                  : `Agregar ${rows.length} producto${rows.length !== 1 ? 's' : ''} al menú`}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { BulkAddToMenuModal }
