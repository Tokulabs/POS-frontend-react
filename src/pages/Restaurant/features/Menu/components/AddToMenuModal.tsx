import { FC, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { debounce } from 'lodash'
import { useQueryClient } from '@tanstack/react-query'
import { IconSearch, IconToolsKitchen2, IconPackage } from '@tabler/icons-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { MenuCategory, MENU_CATEGORY_LABELS, IRestaurantProductDetail } from '@/pages/Restaurant/types/RestaurantTypes'
import { getInventoriesNew } from '@/pages/Inventories/helpers/services'
import { IInventoryProps } from '@/pages/Inventories/types/InventoryTypes'
import { Switch } from '@/components/ui/switch'

const addToMenuSchema = z.object({
  product: z.coerce.number().min(1, 'Selecciona un producto'),
  menu_category: z.enum(['starter', 'main', 'dessert', 'drink', 'side', 'combo'], {
    required_error: 'Selecciona una categoría',
  }),
  prep_time_minutes: z.coerce.number().min(0, 'Debe ser mayor o igual a 0'),
  prep_notes: z.string(),
  skip_stock_check: z.boolean(),
})

export type AddToMenuFormValues = z.infer<typeof addToMenuSchema>

interface AddToMenuModalProps {
  open: boolean
  existingMenuItems: IRestaurantProductDetail[]
  onSubmit: (values: AddToMenuFormValues) => void
  onCreateCombo: (values: { name: string; selling_price: number }) => void
  onCancel: () => void
  isPending: boolean
}

const MENU_CATEGORIES = Object.entries(MENU_CATEGORY_LABELS) as [MenuCategory, string][]

const AddToMenuModal: FC<AddToMenuModalProps> = ({
  open,
  existingMenuItems,
  onSubmit,
  onCreateCombo,
  onCancel,
  isPending,
}) => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<IInventoryProps[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)

  const existingProductIds = new Set(existingMenuItems.map((m) => m.product))

  const fetchProducts = async (keyword: string) => {
    if (!keyword.trim()) {
      setResults([])
      return
    }
    try {
      setIsSearching(true)
      const data = await queryClient.fetchQuery({
        queryKey: ['menuProductSearch', keyword],
        queryFn: () => getInventoriesNew({ keyword, active: 'True', page: 1 }),
        staleTime: 30_000,
        gcTime: 60_000,
      })
      const filtered = (data?.results ?? []).filter((p) => !existingProductIds.has(p.id))
      setResults(filtered)
    } finally {
      setIsSearching(false)
    }
  }

  const debouncedFetch = useRef(debounce((kw: string) => fetchProducts(kw), 300)).current

  useEffect(() => {
    return () => debouncedFetch.cancel()
  }, [debouncedFetch])

  const form = useForm<AddToMenuFormValues>({
    resolver: zodResolver(addToMenuSchema),
    defaultValues: {
      product: 0,
      menu_category: 'main',
      prep_time_minutes: 0,
      prep_notes: '',
      skip_stock_check: true,
    },
  })

  const isCombo = form.watch('menu_category') === 'combo'

  const [comboName, setComboName]   = useState('')
  const [comboPrice, setComboPrice] = useState('')

  useEffect(() => {
    if (open) {
      form.reset({ product: 0, menu_category: 'main', prep_time_minutes: 0, prep_notes: '', skip_stock_check: true })
      setSearch('')
      setResults([])
      setSelectedProductId(null)
      setComboName('')
      setComboPrice('')
    }
  }, [open])

  const handleSearch = (value: string) => {
    setSearch(value)
    debouncedFetch(value)
  }

  const handleSelectProduct = (id: number) => {
    setSelectedProductId(id)
    form.setValue('product', id, { shouldValidate: true })
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel() }}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{isCombo ? 'Crear combo' : 'Agregar producto al menú'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={isCombo
              ? (e) => { e.preventDefault(); onCreateCombo({ name: comboName.trim(), selling_price: Number(comboPrice) || 0 }) }
              : form.handleSubmit(onSubmit)
            }
            className='space-y-4 py-2'
          >
            {/* Product search — hidden when creating a combo */}
            {!isCombo && (
              <div className='space-y-2'>
                <FormLabel>Producto del inventario</FormLabel>
                <div className='relative'>
                  <IconSearch
                    size={15}
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
                  />
                  <Input
                    placeholder='Buscar por nombre o código...'
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className='pl-8'
                  />
                </div>

                <div className='border border-border rounded-md max-h-44 overflow-y-auto'>
                  {isSearching ? (
                    <div className='p-2 space-y-2'>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className='h-9 w-full' />
                      ))}
                    </div>
                  ) : !search.trim() ? (
                    <div className='flex items-center justify-center gap-2 h-16 text-sm text-muted-foreground'>
                      <IconSearch size={14} />
                      Escribe para buscar productos
                    </div>
                  ) : results.length === 0 ? (
                    <div className='flex items-center justify-center gap-2 h-16 text-sm text-muted-foreground'>
                      <IconToolsKitchen2 size={16} />
                      Sin resultados para &ldquo;{search}&rdquo;
                    </div>
                  ) : (
                    results.map((product) => (
                      <button
                        key={product.id}
                        type='button'
                        onClick={() => handleSelectProduct(product.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent transition-colors text-left ${
                          selectedProductId === product.id ? 'bg-accent' : ''
                        }`}
                      >
                        <span className='font-medium'>{product.name}</span>
                        <span className='text-muted-foreground text-xs'>{product.code}</span>
                      </button>
                    ))
                  )}
                </div>
                {form.formState.errors.product && (
                  <p className='text-destructive text-sm'>{form.formState.errors.product.message}</p>
                )}
              </div>
            )}

            {/* Combo name + price — shown only when combo is selected */}
            {isCombo && (
              <div className='space-y-3'>
                <div className='space-y-1.5'>
                  <FormLabel>Nombre del combo</FormLabel>
                  <Input
                    placeholder='Ej: Combo Pizza + Bebida'
                    value={comboName}
                    onChange={(e) => setComboName(e.target.value)}
                  />
                </div>
                <div className='space-y-1.5'>
                  <FormLabel>Precio del combo</FormLabel>
                  <Input
                    type='number'
                    min={0}
                    placeholder='0'
                    value={comboPrice}
                    onChange={(e) => setComboPrice(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Category */}
            <FormField
              control={form.control}
              name='menu_category'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría del menú</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Seleccionar categoría' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MENU_CATEGORIES.map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Combo hint */}
            {isCombo && (
              <div className='flex items-start gap-2.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 px-3 py-2.5'>
                <IconPackage size={15} className='text-blue-500 shrink-0 mt-0.5' />
                <p className='text-xs text-blue-700 dark:text-blue-300 leading-relaxed'>
                  Ingresa el nombre y precio del combo. Después podrás agregar sus productos en la pestaña <strong>Componentes</strong>.
                </p>
              </div>
            )}

            {/* Prep time — hidden for combos */}
            {!isCombo && (
              <FormField
                control={form.control}
                name='prep_time_minutes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiempo de preparación (minutos)</FormLabel>
                    <FormControl>
                      <Input type='number' min={0} placeholder='0' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Prep notes — hidden for combos */}
            {!isCombo && (
              <FormField
                control={form.control}
                name='prep_notes'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Notas de preparación{' '}
                      <span className='text-muted-foreground font-normal'>(opcional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Instrucciones especiales para la cocina...'
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Stock check toggle */}
            <FormField
              control={form.control}
              name='skip_stock_check'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center justify-between rounded-lg border border-border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-sm'>Preparado en cocina</FormLabel>
                      <p className='text-xs text-muted-foreground'>
                        No valida stock al facturar. Actívalo para platos preparados con ingredientes de cocina.
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter className='pt-2'>
              <Button type='button' variant='outline' onClick={onCancel} disabled={isPending}>
                Cancelar
              </Button>
              <Button
                type='submit'
                disabled={isPending || (isCombo ? !comboName.trim() : false)}
              >
                {isPending
                  ? (isCombo ? 'Creando combo...' : 'Agregando...')
                  : (isCombo ? 'Crear combo' : 'Agregar al menú')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export { AddToMenuModal }
