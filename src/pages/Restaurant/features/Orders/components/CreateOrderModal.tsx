import { FC, useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { IRestaurantTable } from '@/pages/Restaurant/types/RestaurantTypes'

interface CreateOrderModalProps {
  open: boolean
  isPending: boolean
  tables: IRestaurantTable[]
  defaultTableId?: number | null
  onCreate: (tableId: number | null, notes: string) => void
  onCancel: () => void
}

const CreateOrderModal: FC<CreateOrderModalProps> = ({
  open,
  isPending,
  tables,
  defaultTableId,
  onCreate,
  onCancel,
}) => {
  const [tableId, setTableId] = useState<string>('')
  const [notes, setNotes] = useState('')

  const availableTables = tables.filter((t) => t.status === 'available')

  useEffect(() => {
    if (open) {
      setTableId(defaultTableId ? String(defaultTableId) : '')
      setNotes('')
    }
  }, [open, defaultTableId])

  const handleSubmit = () => {
    onCreate(tableId ? Number(tableId) : null, notes)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel() }}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Nueva comanda</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          <div className='space-y-1.5'>
            <Label>
              Mesa{' '}
              <span className='text-muted-foreground font-normal'>(opcional)</span>
            </Label>
            <Select value={tableId} onValueChange={setTableId}>
              <SelectTrigger>
                <SelectValue placeholder='Sin mesa (para llevar)' />
              </SelectTrigger>
              <SelectContent>
                {availableTables.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    Mesa {t.number}
                    {t.area_detail ? ` — ${t.area_detail.name}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableTables.length === 0 && (
              <p className='text-xs text-muted-foreground'>
                No hay mesas disponibles. Puedes crear una comanda sin mesa.
              </p>
            )}
          </div>

          <div className='space-y-1.5'>
            <Label>
              Notas{' '}
              <span className='text-muted-foreground font-normal'>(opcional)</span>
            </Label>
            <Textarea
              placeholder='Ej: para llevar, cliente con alergia...'
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={onCancel} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Creando...' : 'Crear comanda'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { CreateOrderModal }
