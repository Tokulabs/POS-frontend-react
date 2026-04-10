import { FC, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { IIngredient, IUnitOfMeasure } from '@/pages/Restaurant/types/RestaurantTypes'
import { ISupplier } from '@/pages/Suppliers/types/SupplierTypes'
import { UnitSelector } from '@/pages/Restaurant/components/UnitSelector'

const ingredientFormSchema = z.object({
  name: z.string().min(1, 'Ingresa el nombre'),
  unit: z.string().min(1, 'Selecciona la unidad'),
  stock_quantity: z.coerce.number().min(0, 'Debe ser mayor o igual a 0'),
  min_stock: z.coerce.number().min(0, 'Debe ser mayor o igual a 0'),
  cost_per_unit: z.coerce.number().min(0, 'Debe ser mayor o igual a 0'),
  supplier_id: z.coerce.number().optional().nullable(),
})

const ingredientSubmitSchema = ingredientFormSchema.transform((data) => ({
  ...data,
  unit: Number(data.unit),
  supplier_id: data.supplier_id || null,
}))

export type IngredientFormValues = z.infer<typeof ingredientSubmitSchema>

interface IngredientFormProps {
  open: boolean
  editingIngredient: IIngredient | null
  units: IUnitOfMeasure[]
  providers: ISupplier[]
  onSubmit: (values: IngredientFormValues) => void
  onCancel: () => void
  isPending: boolean
}

const IngredientForm: FC<IngredientFormProps> = ({
  open,
  editingIngredient,
  units,
  providers,
  onSubmit,
  onCancel,
  isPending,
}) => {
  const form = useForm<z.infer<typeof ingredientFormSchema>>({
    resolver: zodResolver(ingredientFormSchema),
    defaultValues: {
      name: '',
      unit: '',
      stock_quantity: 0,
      min_stock: 0,
      cost_per_unit: 0,
      supplier_id: null,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        editingIngredient
          ? {
              name: editingIngredient.name,
              unit: String(editingIngredient.unit),
              stock_quantity: Number(editingIngredient.stock_quantity),
              min_stock: Number(editingIngredient.min_stock),
              cost_per_unit: Number(editingIngredient.cost_per_unit),
              supplier_id: editingIngredient.supplier?.id ?? null,
            }
          : { name: '', unit: '', stock_quantity: 0, min_stock: 0, cost_per_unit: 0, supplier_id: null },
      )
    }
  }, [open, editingIngredient])

  const handleSubmit = (values: z.infer<typeof ingredientFormSchema>) => {
    onSubmit(ingredientSubmitSchema.parse(values))
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel() }}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{editingIngredient ? 'Editar ingrediente' : 'Nuevo ingrediente'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4 py-2'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder='Ej: Harina de trigo' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-2 gap-3'>
              <FormField
                control={form.control}
                name='unit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad de medida</FormLabel>
                    <FormControl>
                      <UnitSelector units={units} value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='supplier_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Proveedor{' '}
                      <span className='text-muted-foreground font-normal'>(opcional)</span>
                    </FormLabel>
                    <Select
                      value={field.value != null ? String(field.value) : 'none'}
                      onValueChange={(v) => field.onChange(v === 'none' ? null : Number(v))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Sin proveedor' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='none'>Sin proveedor</SelectItem>
                        {providers.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <FormField
                control={form.control}
                name='stock_quantity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock actual</FormLabel>
                    <FormControl>
                      <Input type='number' min={0} step='0.001' placeholder='0.000' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='min_stock'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock mínimo</FormLabel>
                    <FormControl>
                      <Input type='number' min={0} step='0.001' placeholder='0.000' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='cost_per_unit'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Costo por unidad (COP)</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm'>
                        $
                      </span>
                      <Input type='number' min={0} step='0.01' placeholder='0.00' className='pl-7' {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className='pt-2'>
              <Button type='button' variant='outline' onClick={onCancel} disabled={isPending}>
                Cancelar
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending
                  ? 'Guardando...'
                  : editingIngredient
                    ? 'Guardar cambios'
                    : 'Crear ingrediente'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export { IngredientForm }
