import { FC, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { IconArrowLeft, IconToolsKitchen2 } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useRestaurantMenu, useMenuItemById } from '@/hooks/restaurant/useRestaurantMenu'
import { useRecipes } from '@/hooks/restaurant/useRecipes'
import { useIngredients } from '@/hooks/restaurant/useIngredients'
import { MENU_CATEGORY_LABELS, MenuCategory } from '@/pages/Restaurant/types/RestaurantTypes'
import { RecipeEditor } from './components/RecipeEditor'
import { ComboEditor } from './components/ComboEditor'
import { ComboOptionsEditor } from './components/ComboOptionsEditor'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatNumberToColombianPesos } from '@/utils/helpers'

const MENU_CATEGORIES = Object.entries(MENU_CATEGORY_LABELS) as [MenuCategory, string][]

const detailSchema = z.object({
  menu_category: z.enum(['starter', 'main', 'dessert', 'drink', 'side', 'combo']),
  prep_time_minutes: z.coerce.number().min(0),
  is_available: z.boolean(),
  skip_stock_check: z.boolean(),
  prep_notes: z.string(),
})

type DetailFormValues = z.infer<typeof detailSchema>

const RestaurantMenuDetail: FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const menuItemId = Number(id)

  // Fetch the specific item by ID — avoids cache collision with the paginated list
  const { isLoading, menuItem, invalidate: invalidateItem } = useMenuItemById(menuItemId)
  // Full list (unpaginated) for combo/options product selectors
  const { isLoading: isLoadingAll, menuItems, updateMenuItem } = useRestaurantMenu()

  const { ingredients, isLoading: isLoadingIngredients } = useIngredients()
  const { createRecipe, updateRecipe } = useRecipes()

  const form = useForm<DetailFormValues>({
    resolver: zodResolver(detailSchema),
    defaultValues: {
      menu_category: 'main',
      prep_time_minutes: 0,
      is_available: true,
      skip_stock_check: true,
      prep_notes: '',
    },
  })

  const isCombo = form.watch('menu_category') === 'combo'

  useEffect(() => {
    if (menuItem) {
      form.reset({
        menu_category: menuItem.menu_category,
        prep_time_minutes: menuItem.prep_time_minutes,
        is_available: menuItem.is_available,
        skip_stock_check: menuItem.skip_stock_check,
        prep_notes: menuItem.prep_notes,
      })
    }
  }, [menuItem])

  const handleSaveDetails = (values: DetailFormValues) => {
    if (!menuItem) return
    updateMenuItem.mutate(
      { id: menuItemId, product: menuItem.product, ...values },
      {
        onSuccess: () => { invalidateItem(); toast.success('Cambios guardados') },
        onError: () => toast.error('Error al guardar los cambios'),
      },
    )
  }

  const handleSaveRecipe = (data: {
    product_detail: number
    notes: string
    recipe_ingredients: { ingredient: number; quantity: number; unit: number }[]
  }) => {
    createRecipe.mutate(data, {
      onSuccess: () => toast.success('Receta creada'),
      onError: () => toast.error('Error al crear la receta'),
    })
  }

  const handleUpdateRecipe = (data: {
    id: number
    notes: string
    recipe_ingredients: { ingredient: number; quantity: number; unit: number }[]
  }) => {
    const { id: recipeId, ...payload } = data
    updateRecipe.mutate(
      { id: recipeId, ...payload },
      {
        onSuccess: () => toast.success('Receta actualizada'),
        onError: () => toast.error('Error al actualizar la receta'),
      },
    )
  }

  if (isLoading || isLoadingAll) {
    return (
      <div className='bg-card text-card-foreground h-full rounded-lg p-4 space-y-3'>
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-8 w-40' />
        <Skeleton className='h-48 w-full' />
      </div>
    )
  }

  if (!menuItem) {
    return (
      <div className='bg-card text-card-foreground h-full rounded-lg p-6 flex flex-col items-center justify-center gap-3 text-muted-foreground'>
        <IconToolsKitchen2 size={40} className='opacity-40' />
        <p>Producto no encontrado en el menú.</p>
        <Button variant='outline' onClick={() => navigate('/restaurant/menu')}>
          Volver al menú
        </Button>
      </div>
    )
  }

  const isSavingRecipe = createRecipe.isPending || updateRecipe.isPending

  return (
    <div className='bg-card text-card-foreground h-full rounded-lg p-4 flex flex-col gap-4'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => navigate('/restaurant/menu')}
          className='h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground'
        >
          <IconArrowLeft size={18} />
        </Button>

        {menuItem.product_detail?.photo && (
          <img
            src={menuItem.product_detail.photo}
            alt={menuItem.product_detail.name}
            className='w-12 h-12 rounded-lg object-cover shrink-0'
          />
        )}

        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 flex-wrap'>
            <h1 className='text-xl font-semibold text-foreground truncate'>
              {menuItem.product_detail?.name}
            </h1>
            <Badge variant='secondary' className='text-xs shrink-0'>
              {MENU_CATEGORY_LABELS[menuItem.menu_category]}
            </Badge>
          </div>
          <div className='flex items-center gap-2 text-sm text-muted-foreground mt-0.5'>
            <span>{formatNumberToColombianPesos(menuItem.product_detail?.selling_price ?? 0, true)}</span>
            <span>·</span>
            <span>{menuItem.product_detail?.code}</span>
          </div>
        </div>

        {/* Availability toggle inline in header */}
        <div className='flex items-center gap-2 shrink-0'>
          <span className='text-sm text-muted-foreground hidden sm:block'>
            {menuItem.is_available ? 'Disponible' : 'No disp.'}
          </span>
          <Switch
            checked={form.watch('is_available')}
            onCheckedChange={(v) => {
              form.setValue('is_available', v)
              if (!menuItem) return
              updateMenuItem.mutate(
                { id: menuItemId, product: menuItem.product, ...form.getValues(), is_available: v },
                {
                  onSuccess: () => invalidateItem(),
                  onError: () => toast.error('Error al actualizar disponibilidad'),
                },
              )
            }}
            disabled={updateMenuItem.isPending}
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue='config' className='flex-1 flex flex-col min-h-0'>
        <TabsList className='w-fit'>
          <TabsTrigger value='config'>Configuración</TabsTrigger>
          {isCombo ? (
            <>
              <TabsTrigger value='combo' className='flex items-center gap-1.5'>
                Componentes
                {menuItem.combo_items?.length > 0 && (
                  <Badge variant='secondary' className='h-4 px-1 text-[10px]'>
                    {menuItem.combo_items.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value='options' className='flex items-center gap-1.5'>
                Opciones
                {menuItem.option_groups?.length > 0 && (
                  <Badge variant='secondary' className='h-4 px-1 text-[10px]'>
                    {menuItem.option_groups.length}
                  </Badge>
                )}
              </TabsTrigger>
            </>
          ) : (
            <TabsTrigger value='recipe' className='flex items-center gap-1.5'>
              Receta
              {menuItem.recipe && (
                <Badge variant='secondary' className='h-4 px-1 text-[10px]'>
                  {menuItem.recipe.recipe_ingredients.length}
                </Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        {/* Config tab */}
        <TabsContent value='config' className='flex-1 overflow-y-auto mt-4'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveDetails)} className='space-y-4 w-full'>
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='menu_category'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
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

                <FormField
                  control={form.control}
                  name='prep_time_minutes'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiempo prep. (min)</FormLabel>
                      <FormControl>
                        <Input type='number' min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <Button type='submit' disabled={updateMenuItem.isPending} size='sm'>
                {updateMenuItem.isPending ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </form>
          </Form>
        </TabsContent>

        {/* Recipe tab */}
        <TabsContent value='recipe' className='flex-1 overflow-y-auto mt-4'>
          <RecipeEditor
            productDetailId={menuItemId}
            recipe={menuItem.recipe ?? null}
            ingredients={ingredients}
            isLoadingIngredients={isLoadingIngredients}
            onSave={handleSaveRecipe}
            onUpdate={handleUpdateRecipe}
            isSaving={isSavingRecipe}
          />
        </TabsContent>

        {/* Combo tab */}
        <TabsContent value='combo' className='flex-1 overflow-y-auto mt-4'>
          <ComboEditor
            menuItemId={menuItemId}
            products={menuItems
              .filter((m) => m.id !== menuItemId)
              .map((m) => m.product_detail)}
            isLoadingProducts={isLoading}
          />
        </TabsContent>

        {/* Options tab */}
        <TabsContent value='options' className='flex-1 overflow-y-auto mt-4'>
          <ComboOptionsEditor
            menuItemId={menuItemId}
            optionGroups={menuItem.option_groups ?? []}
            products={menuItems
              .filter((m) => m.id !== menuItemId)
              .map((m) => m.product_detail)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { RestaurantMenuDetail }
