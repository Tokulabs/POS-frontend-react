import { FC, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { IUnitOfMeasure } from '@/pages/Restaurant/types/RestaurantTypes'

const unitFormSchema = z.object({
  name: z.string().min(1, 'Ingresa el nombre'),
  symbol: z.string().min(1, 'Ingresa el símbolo'),
  unit_type: z.enum(['weight', 'volume', 'count'], {
    required_error: 'Selecciona el tipo',
  }),
})

export type UnitFormValues = z.infer<typeof unitFormSchema>

interface UnitFormProps {
  open: boolean
  editingUnit: IUnitOfMeasure | null
  onSubmit: (values: UnitFormValues) => void
  onCancel: () => void
  isPending: boolean
}

const UnitForm: FC<UnitFormProps> = ({ open, editingUnit, onSubmit, onCancel, isPending }) => {
  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: { name: '', symbol: '', unit_type: undefined },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        editingUnit
          ? { name: editingUnit.name, symbol: editingUnit.symbol, unit_type: editingUnit.unit_type }
          : { name: '', symbol: '', unit_type: undefined },
      )
    }
  }, [open, editingUnit])

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel() }}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{editingUnit ? 'Editar unidad' : 'Nueva unidad de medida'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 py-2'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder='Ej: Kilogramo' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='symbol'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Símbolo</FormLabel>
                  <FormControl>
                    <Input placeholder='Ej: kg' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='unit_type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Seleccionar tipo' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='weight'>Peso</SelectItem>
                      <SelectItem value='volume'>Volumen</SelectItem>
                      <SelectItem value='count'>Conteo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className='pt-2'>
              <Button type='button' variant='outline' onClick={onCancel} disabled={isPending}>
                Cancelar
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? 'Guardando...' : editingUnit ? 'Guardar cambios' : 'Crear unidad'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export { UnitForm }
