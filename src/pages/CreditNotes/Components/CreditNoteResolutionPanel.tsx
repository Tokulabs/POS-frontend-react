import { FC, useContext, useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { IconEdit, IconCheck, IconX, IconReceipt2 } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

import { store } from '@/store'
import { ActionTypes } from '@/types/StoreTypes'
import { putCompanyCreditNoteNumbering } from '@/pages/Profile/helpers/services'

const CreditNoteResolutionPanel: FC = () => {
  const { state, dispatch } = useContext(store)
  const company = state.user?.company

  const [editing, setEditing] = useState(false)
  const [prefix, setPrefix] = useState('NC')
  const [fromNumber, setFromNumber] = useState<number>(1)
  const [toNumber, setToNumber] = useState<number>(1000)
  const [currentNumber, setCurrentNumber] = useState<number>(0)

  const isConfigured =
    !!company?.credit_note_prefix &&
    company?.credit_note_from_number != null &&
    company?.credit_note_to_number != null

  useEffect(() => {
    if (company) {
      setPrefix(company.credit_note_prefix ?? 'NC')
      setFromNumber(company.credit_note_from_number ?? 1)
      setToNumber(company.credit_note_to_number ?? 1000)
      setCurrentNumber(company.credit_note_current_number ?? 0)
    }
  }, [company])

  const { mutate: mutateSave, isPending: saving } = useMutation({
    mutationFn: putCompanyCreditNoteNumbering,
    onSuccess: (response) => {
      toast.success('Numeración de Nota Crédito actualizada')
      if (response?.data) {
        dispatch({ type: ActionTypes.UPDATE_COMPANY_INFO, payload: response.data })
      }
      setEditing(false)
    },
    onError: () => toast.error('Error al actualizar la numeración'),
  })

  const handleSave = () => {
    const trimmedPrefix = prefix.trim()
    if (!trimmedPrefix) {
      toast.error('Ingresa el prefijo')
      return
    }
    if (toNumber <= fromNumber) {
      toast.error('El número final debe ser mayor al inicial')
      return
    }
    if (currentNumber < 0) {
      toast.error('El número actual no puede ser negativo')
      return
    }
    if (currentNumber > toNumber) {
      toast.error('El número actual no puede superar el límite final')
      return
    }
    if (currentNumber > 0 && currentNumber < fromNumber) {
      toast.error('El número actual debe ser 0 o estar dentro del rango configurado')
      return
    }

    mutateSave({
      credit_note_prefix: trimmedPrefix,
      credit_note_from_number: fromNumber,
      credit_note_to_number: toNumber,
      credit_note_current_number: currentNumber,
    })
  }

  const handleCancel = () => {
    if (company) {
      setPrefix(company.credit_note_prefix ?? 'NC')
      setFromNumber(company.credit_note_from_number ?? 1)
      setToNumber(company.credit_note_to_number ?? 1000)
      setCurrentNumber(company.credit_note_current_number ?? 0)
    }
    setEditing(false)
  }

  const remaining = isConfigured
    ? Math.max(0, (company!.credit_note_to_number ?? 0) - (company!.credit_note_current_number ?? 0))
    : 0

  return (
    <div className='rounded-lg border border-border bg-muted/40 p-4 flex flex-col gap-3'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <IconReceipt2 size={16} className='text-muted-foreground' />
          <h3 className='text-sm font-semibold m-0'>Numeración Manual de Notas Crédito</h3>
          {isConfigured ? (
            <Badge variant='secondary' className='text-xs'>
              {remaining.toLocaleString()} disponibles
            </Badge>
          ) : (
            <Badge variant='destructive' className='text-xs'>
              Sin configurar
            </Badge>
          )}
        </div>
        {!editing && (
          <Button variant='ghost' size='sm' className='gap-1' onClick={() => setEditing(true)}>
            <IconEdit size={14} />
            {isConfigured ? 'Editar' : 'Configurar'}
          </Button>
        )}
      </div>

      {!editing ? (
        isConfigured ? (
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm'>
            <Field label='Prefijo' value={company!.credit_note_prefix ?? '—'} />
            <Field
              label='Desde'
              value={(company!.credit_note_from_number ?? 0).toLocaleString()}
            />
            <Field
              label='Hasta'
              value={(company!.credit_note_to_number ?? 0).toLocaleString()}
            />
            <Field
              label='Actual'
              value={(company!.credit_note_current_number ?? 0).toLocaleString()}
            />
          </div>
        ) : (
          <p className='text-xs text-muted-foreground'>
            Aún no has configurado el prefijo y el rango de numeración manual para tus notas
            crédito. Configúralos antes de enviar la primera a la DIAN.
          </p>
        )
      ) : (
        <div className='flex flex-col gap-3'>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
            <FieldInput
              label='Prefijo'
              value={prefix}
              onChange={(v) => setPrefix(v.toUpperCase().slice(0, 10))}
              placeholder='NC'
            />
            <FieldInput
              label='Desde'
              type='number'
              value={String(fromNumber)}
              onChange={(v) => setFromNumber(Number(v) || 0)}
            />
            <FieldInput
              label='Hasta'
              type='number'
              value={String(toNumber)}
              onChange={(v) => setToNumber(Number(v) || 0)}
            />
            <FieldInput
              label='Actual'
              type='number'
              value={String(currentNumber)}
              onChange={(v) => setCurrentNumber(Number(v) || 0)}
            />
          </div>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' size='sm' onClick={handleCancel} disabled={saving}>
              <IconX size={14} /> Cancelar
            </Button>
            <Button size='sm' onClick={handleSave} disabled={saving}>
              <IconCheck size={14} />
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

const Field: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <span className='text-xs text-muted-foreground'>{label}</span>
    <p className='font-medium'>{value}</p>
  </div>
)

const FieldInput: FC<{
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}> = ({ label, value, onChange, type, placeholder }) => (
  <div className='flex flex-col gap-1'>
    <label className='text-xs text-muted-foreground'>{label}</label>
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className='h-8'
    />
  </div>
)

export { CreditNoteResolutionPanel }
