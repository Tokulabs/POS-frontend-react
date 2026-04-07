import { FC, useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { IIngredient } from '@/pages/Restaurant/types/RestaurantTypes'
import { IProvider } from '@/pages/Providers/types/ProviderTypes'

type MovementType = 'purchase' | 'adjustment' | 'waste'

interface StockMovementModalProps {
  open: boolean
  ingredient: IIngredient | null
  providers: IProvider[]
  isPending: boolean
  onSubmit: (data: {
    ingredientId: number
    movement_type: MovementType
    quantity: string
    cost_per_unit?: string | null
    provider?: number | null
    notes?: string
  }) => void
  onCancel: () => void
}

const MOVEMENT_LABELS: Record<MovementType, string> = {
  purchase: 'Compra (entrada de stock)',
  adjustment: 'Ajuste manual',
  waste: 'Merma / pérdida (salida)',
}

const StockMovementModal: FC<StockMovementModalProps> = ({
  open,
  ingredient,
  providers,
  isPending,
  onSubmit,
  onCancel,
}) => {
  const [movementType, setMovementType] = useState<MovementType>('purchase')
  const [qtyIn, setQtyIn] = useState('')
  const [qtyOut, setQtyOut] = useState('')
  const [costPerUnit, setCostPerUnit] = useState('')
  const [providerId, setProviderId] = useState<string>('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (open) {
      setMovementType('purchase')
      setQtyIn('')
      setQtyOut('')
      setCostPerUnit('')
      setProviderId(ingredient?.provider ? String(ingredient.provider.id) : '')
      setNotes('')
    }
  }, [open, ingredient])

  const handleSubmit = () => {
    if (!ingredient) return

    let signedQty: number
    if (movementType === 'purchase') {
      signedQty = Number(qtyIn)
    } else if (movementType === 'waste') {
      signedQty = -Number(qtyOut)
    } else {
      // adjustment: one of the two fields
      const inVal = Number(qtyIn)
      const outVal = Number(qtyOut)
      signedQty = inVal > 0 ? inVal : -outVal
    }

    if (signedQty === 0) return

    onSubmit({
      ingredientId: ingredient.id,
      movement_type: movementType,
      quantity: String(signedQty),
      cost_per_unit: movementType === 'purchase' && costPerUnit ? costPerUnit : null,
      provider: movementType === 'purchase' && providerId ? Number(providerId) : null,
      notes,
    })
  }

  const unitSymbol = ingredient?.unit_detail?.symbol ?? ''

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel() }}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>Ajustar stock — {ingredient?.name}</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-1'>
          {/* Movement type */}
          <div className='space-y-1.5'>
            <Label>Tipo de movimiento</Label>
            <Select value={movementType} onValueChange={(v) => setMovementType(v as MovementType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(MOVEMENT_LABELS) as [MovementType, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity fields */}
          {movementType === 'purchase' && (
            <div className='space-y-1.5'>
              <Label>Cantidad a ingresar ({unitSymbol})</Label>
              <Input
                type='number'
                min={0}
                step='0.001'
                placeholder='0.000'
                value={qtyIn}
                onChange={(e) => setQtyIn(e.target.value)}
              />
            </div>
          )}

          {movementType === 'waste' && (
            <div className='space-y-1.5'>
              <Label>Cantidad a retirar ({unitSymbol})</Label>
              <Input
                type='number'
                min={0}
                step='0.001'
                placeholder='0.000'
                value={qtyOut}
                onChange={(e) => setQtyOut(e.target.value)}
              />
            </div>
          )}

          {movementType === 'adjustment' && (
            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <Label className='text-emerald-600 dark:text-emerald-400'>
                  Cantidad entrada ({unitSymbol})
                </Label>
                <Input
                  type='number'
                  min={0}
                  step='0.001'
                  placeholder='0.000'
                  value={qtyIn}
                  onChange={(e) => { setQtyIn(e.target.value); if (e.target.value) setQtyOut('') }}
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-red-500 dark:text-red-400'>
                  Cantidad salida ({unitSymbol})
                </Label>
                <Input
                  type='number'
                  min={0}
                  step='0.001'
                  placeholder='0.000'
                  value={qtyOut}
                  onChange={(e) => { setQtyOut(e.target.value); if (e.target.value) setQtyIn('') }}
                />
              </div>
            </div>
          )}

          {/* Purchase-only fields */}
          {movementType === 'purchase' && (
            <>
              <div className='space-y-1.5'>
                <Label>
                  Costo por unidad{' '}
                  <span className='text-muted-foreground font-normal'>(opcional)</span>
                </Label>
                <div className='relative'>
                  <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm'>$</span>
                  <Input
                    type='number'
                    min={0}
                    step='0.01'
                    placeholder='0.00'
                    className='pl-7'
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(e.target.value)}
                  />
                </div>
              </div>

              <div className='space-y-1.5'>
                <Label>
                  Proveedor{' '}
                  <span className='text-muted-foreground font-normal'>(opcional)</span>
                </Label>
                <Select value={providerId || 'none'} onValueChange={(v) => setProviderId(v === 'none' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder='Sin proveedor' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='none'>Sin proveedor</SelectItem>
                    {providers.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Notes */}
          <div className='space-y-1.5'>
            <Label>
              Notas{' '}
              <span className='text-muted-foreground font-normal'>(opcional)</span>
            </Label>
            <Textarea
              rows={2}
              placeholder='Ej: Compra semanal, proveedor entregó menos...'
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
            {isPending ? 'Registrando...' : 'Registrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { StockMovementModal }
