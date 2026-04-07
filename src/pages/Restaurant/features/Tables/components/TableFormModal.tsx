import { FC, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { IRestaurantArea, IRestaurantTable } from '@/pages/Restaurant/types/RestaurantTypes'

const tableSchema = z.object({
  number: z.string().min(1, 'El número de mesa es requerido'),
  area: z.coerce.number().nullable(),
  capacity: z.coerce.number().min(1, 'Mínimo 1 persona'),
})

type TableFormValues = z.infer<typeof tableSchema>

interface TableFormModalProps {
  open: boolean
  editing: IRestaurantTable | null
  areas: IRestaurantArea[]
  isPending: boolean
  onSubmit: (values: TableFormValues) => void
  onCancel: () => void
}

const TableFormModal: FC<TableFormModalProps> = ({ open, editing, areas, isPending, onSubmit, onCancel }) => {
  const form = useForm<TableFormValues>({
    resolver: zodResolver(tableSchema),
    defaultValues: { number: '', area: null, capacity: 4 },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        editing
          ? { number: editing.number, area: editing.area, capacity: editing.capacity }
          : { number: '', area: null, capacity: 4 },
      )
    }
  }, [open, editing])

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel() }}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar mesa' : 'Nueva mesa'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 py-2'>
            <div className='grid grid-cols-2 gap-3'>
              <FormField
                control={form.control}
                name='number'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número / nombre</FormLabel>
                    <FormControl>
                      <Input placeholder='Ej: 1, A-2, Terraza 1' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='capacity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidad</FormLabel>
                    <FormControl>
                      <Input type='number' min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='area'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Área <span className='text-muted-foreground font-normal'>(opcional)</span>
                  </FormLabel>
                  <Select
                    value={field.value != null ? String(field.value) : 'none'}
                    onValueChange={(v) => field.onChange(v === 'none' ? null : Number(v))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Sin área' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='none'>Sin área</SelectItem>
                      {areas.map((a) => (
                        <SelectItem key={a.id} value={String(a.id)}>
                          {a.name}
                        </SelectItem>
                      ))}
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
                {isPending ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear mesa'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export { TableFormModal }
export type { TableFormValues }
