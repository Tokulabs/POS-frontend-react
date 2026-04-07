import { FC, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { IconPlus, IconTrash, IconChefHat, IconAlertCircle } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { IRecipe, IIngredient } from '@/pages/Restaurant/types/RestaurantTypes'
import { formatNumberToColombianPesos } from '@/utils/helpers'

type RecipeRow = {
  ingredient: string  // ingredient id as string (for Select)
  quantity: string
}

const emptyRow = (): RecipeRow => ({ ingredient: '', quantity: '' })

interface RecipeEditorProps {
  productDetailId: number
  recipe: IRecipe | null | undefined
  ingredients: IIngredient[]
  isLoadingIngredients: boolean
  onSave: (data: {
    product_detail: number
    notes: string
    recipe_ingredients: { ingredient: number; quantity: number; unit: number }[]
  }) => void
  onUpdate: (data: {
    id: number
    notes: string
    recipe_ingredients: { ingredient: number; quantity: number; unit: number }[]
  }) => void
  isSaving: boolean
}

const RecipeEditor: FC<RecipeEditorProps> = ({
  productDetailId,
  recipe,
  ingredients,
  isLoadingIngredients,
  onSave,
  onUpdate,
  isSaving,
}) => {
  const [rows, setRows] = useState<RecipeRow[]>([])
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (recipe) {
      setRows(
        recipe.recipe_ingredients.map((ri) => ({
          ingredient: String(ri.ingredient),
          quantity: ri.quantity,
        })),
      )
      setNotes(recipe.notes)
    } else {
      setRows([])
      setNotes('')
    }
  }, [recipe])

  const addRow = () => setRows((prev) => [...prev, emptyRow()])

  const removeRow = (index: number) =>
    setRows((prev) => prev.filter((_, i) => i !== index))

  const updateRow = (index: number, field: keyof RecipeRow, value: string) =>
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))

  const estimatedCost = rows.reduce((total, row) => {
    const ingredient = ingredients.find((i) => i.id === Number(row.ingredient))
    const qty = parseFloat(row.quantity) || 0
    return total + qty * Number(ingredient?.cost_per_unit ?? 0)
  }, 0)

  const isValid =
    rows.length > 0 &&
    rows.every((r) => r.ingredient && r.quantity && Number(r.quantity) > 0)

  const handleSave = () => {
    if (!isValid) return
    const recipe_ingredients = rows.map((r) => {
      const ing = ingredients.find((i) => i.id === Number(r.ingredient))!
      return {
        ingredient: Number(r.ingredient),
        quantity: Number(r.quantity),
        unit: ing.unit,  // always use the ingredient's own unit
      }
    })

    if (recipe) {
      onUpdate({ id: recipe.id, notes, recipe_ingredients })
    } else {
      onSave({ product_detail: productDetailId, notes, recipe_ingredients })
    }
  }

  if (isLoadingIngredients) {
    return (
      <div className='space-y-3'>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className='h-10 w-full' />
        ))}
      </div>
    )
  }

  if (ingredients.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 border border-dashed border-border rounded-lg py-8 text-center px-4'>
        <IconAlertCircle size={28} className='text-muted-foreground opacity-60' />
        <div>
          <p className='text-sm font-medium text-foreground'>No hay ingredientes registrados</p>
          <p className='text-xs text-muted-foreground mt-1'>
            Debes crear ingredientes antes de poder armar una receta.
          </p>
        </div>
        <Link
          to='/restaurant/ingredients'
          className='text-xs font-medium underline underline-offset-2 text-foreground hover:text-muted-foreground'
        >
          Ir a Ingredientes →
        </Link>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-4'>
      {/* Notes */}
      <div className='space-y-1.5'>
        <label className='text-sm font-medium text-foreground'>
          Notas de la receta{' '}
          <span className='text-muted-foreground font-normal'>(opcional)</span>
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder='Instrucciones generales para esta receta...'
          rows={2}
        />
      </div>

      {/* Ingredient list — bordered container */}
      <div className='border border-border rounded-lg overflow-hidden'>
        {rows.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground'>
            <IconChefHat size={28} className='opacity-40' />
            <p className='text-sm'>Esta receta está vacía. Agrega ingredientes para comenzar.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className='grid grid-cols-[1fr_120px_60px_32px] gap-2 px-3 py-2 bg-muted/40 border-b border-border text-xs font-medium text-muted-foreground'>
              <span>Ingrediente</span>
              <span>Cantidad</span>
              <span>Unidad</span>
              <span />
            </div>

            {/* Rows */}
            <div className='divide-y divide-border'>
              {rows.map((row, index) => {
                const selectedIngredient = ingredients.find((i) => i.id === Number(row.ingredient))
                return (
                  <div key={index} className='grid grid-cols-[1fr_120px_60px_32px] gap-2 items-center px-3 py-2'>
                    <Select
                      value={row.ingredient}
                      onValueChange={(v) => updateRow(index, 'ingredient', v)}
                    >
                      <SelectTrigger className='text-sm h-8'>
                        <SelectValue placeholder='Seleccionar...' />
                      </SelectTrigger>
                      <SelectContent>
                        {ingredients.map((ing) => (
                          <SelectItem key={ing.id} value={String(ing.id)}>
                            {ing.name}
                            <span className='text-muted-foreground ml-1 text-xs'>
                              ({ing.unit_detail?.symbol})
                            </span>
                          </SelectItem>
                        ))}
                        <div className='border-t border-border mt-1 pt-1 px-2 pb-1'>
                          <Link
                            to='/restaurant/ingredients'
                            className='text-xs text-muted-foreground hover:text-foreground flex items-center gap-1'
                          >
                            <IconPlus size={11} />
                            Crear nuevo ingrediente
                          </Link>
                        </div>
                      </SelectContent>
                    </Select>

                    <Input
                      type='number'
                      min='0'
                      step='0.001'
                      placeholder='0.000'
                      value={row.quantity}
                      onChange={(e) => updateRow(index, 'quantity', e.target.value)}
                      className='text-sm h-8'
                    />

                    <div className='flex items-center justify-center'>
                      {selectedIngredient ? (
                        <Badge variant='outline' className='text-xs font-mono'>
                          {selectedIngredient.unit_detail?.symbol ?? '—'}
                        </Badge>
                      ) : (
                        <span className='text-xs text-muted-foreground'>—</span>
                      )}
                    </div>

                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-muted-foreground hover:text-destructive'
                      onClick={() => removeRow(index)}
                    >
                      <IconTrash size={14} />
                    </Button>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Add ingredient — always at the bottom of the box */}
        <div className='border-t border-border'>
          <Button
            type='button'
            variant='ghost'
            className='w-full rounded-none h-9 text-sm gap-1.5 text-muted-foreground hover:text-foreground'
            onClick={addRow}
          >
            <IconPlus size={13} />
            Agregar ingrediente
          </Button>
        </div>
      </div>

      {/* Footer: estimated cost + save */}
      <div className='flex items-center justify-between'>
        <span className='text-sm text-muted-foreground'>
          {rows.length > 0 && (
            <>
              Costo estimado:{' '}
              <span className='font-semibold text-foreground'>
                {formatNumberToColombianPesos(estimatedCost, true)}
              </span>
            </>
          )}
        </span>
        <Button type='button' onClick={handleSave} disabled={isSaving || !isValid} size='sm'>
          {isSaving ? 'Guardando...' : recipe ? 'Guardar receta' : 'Crear receta'}
        </Button>
      </div>
    </div>
  )
}

export { RecipeEditor }
