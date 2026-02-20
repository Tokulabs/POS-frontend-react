import { FC, useState } from 'react'
import { IDianResolutionProps } from '../types/DianResolutionTypes'
import { formatDate, isExpired } from '../helpers/utils'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  IconEdit,
  IconDeviceFloppy,
  IconX,
  IconCalendar,
  IconHash,
  IconFileInvoice,
} from '@tabler/icons-react'

interface ResolutionCardProps {
  item: IDianResolutionProps
  hasPermission: boolean
  isEditing: boolean
  currentNumber: number
  isPendingToggle: boolean
  isPendingPut: boolean
  compact?: boolean
  onToggle: () => void
  onEditStart: () => void
  onEditCancel: () => void
  onEditSave: () => void
  onCurrentNumberChange: (value: number) => void
}

const ResolutionCard: FC<ResolutionCardProps> = ({
  item,
  hasPermission,
  isEditing,
  currentNumber,
  isPendingToggle,
  isPendingPut,
  compact = false,
  onToggle,
  onEditStart,
  onEditCancel,
  onEditSave,
  onCurrentNumberChange,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Calculate usage progress
  const totalRange = item.to_number - item.from_number
  const used = item.current_number - item.from_number
  const usagePercent = totalRange > 0 ? Math.min(Math.round((used / totalRange) * 100), 100) : 0
  const remaining = item.to_number - item.current_number
  const expired = !item.active && isExpired(item.to_date)

  // Progress bar: ensure minimum visible width when > 0%
  const progressWidth = usagePercent > 0 ? Math.max(usagePercent, 2) : 0

  // Progress bar color based on usage
  const getProgressColor = () => {
    if (usagePercent >= 90) return 'bg-red-500'
    if (usagePercent >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }



  // ─── Compact layout for inactive cards ───
  if (compact) {
    return (
      <div className='rounded-lg border bg-card overflow-hidden transition-all duration-200 hover:shadow-xs'>
        <div className='flex'>
          <div className='w-1 shrink-0 bg-muted-foreground/20' />
          <div className='flex-1 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6'>
            {/* Title + badges */}
            <div className='flex items-center gap-2 min-w-0 flex-1'>
              <h4
                className='text-sm font-bold text-foreground m-0 truncate'
                title={`${item.prefix} - ${item.document_number}`}
              >
                {item.prefix} - {item.document_number}
              </h4>
              <Badge
                variant='secondary'
                className='text-[10px] px-1.5 py-0 bg-muted text-muted-foreground hover:bg-muted shrink-0'
              >
                Inactivo
              </Badge>
              {expired && (
                <Badge
                  variant='secondary'
                  className='text-[10px] px-1.5 py-0 bg-red-500/10 text-red-500 hover:bg-red-500/10 shrink-0'
                >
                  Expirada
                </Badge>
              )}
            </div>

            {/* Compact data */}
            <div className='flex items-center gap-4 text-xs text-muted-foreground shrink-0'>
              <span>{formatDate(item.from_date)} — {formatDate(item.to_date)}</span>
              <span className='hidden sm:inline'>
                {item.from_number} – {item.to_number}
              </span>
            </div>

            {/* Toggle */}
            {expired ? (
              <span className='text-[10px] text-red-500/70 shrink-0'>Resolución expirada</span>
            ) : (
              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogTrigger asChild>
                  <div className='flex items-center gap-2 shrink-0'>
                    <span className='text-xs text-muted-foreground'>Activar</span>
                    <Switch
                      checked={false}
                      disabled={isPendingToggle}
                      onCheckedChange={() => setConfirmOpen(true)}
                      className='data-[state=checked]:bg-green-500 scale-90'
                    />
                  </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Activar resolución</AlertDialogTitle>
                    <AlertDialogDescription>
                      {`¿Está seguro que desea activar la resolución ${item.prefix} - ${item.document_number}? Si hay una resolución activa, será desactivada automáticamente.`}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onToggle()
                        setConfirmOpen(false)
                      }}
                      className='bg-green-1 hover:bg-green-1/90'
                    >
                      Activar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ─── Full layout for active cards ───
  return (
    <div
      className={`rounded-xl border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg ${item.active
        ? 'border-border hover:border-green-1/40'
        : 'border-border'
        }`}
    >
      <div className='flex'>
        {/* Status indicator strip */}
        <div
          className={`w-1.5 shrink-0 transition-colors duration-300 ${item.active ? 'bg-green-500' : 'bg-muted-foreground/30'
            }`}
        />

        <div className='flex-1 p-5 space-y-4'>
          {/* Header: Title + Badge + Toggle */}
          <div className='flex items-start justify-between gap-4'>
            <div className='flex items-center gap-2 flex-wrap min-w-0'>
              <h3
                className='text-xl font-bold text-foreground m-0 tracking-tight truncate'
                title={`${item.prefix} - ${item.document_number}`}
              >
                {item.prefix} - {item.document_number}
              </h3>
              <Badge
                variant={item.active ? 'default' : 'secondary'}
                className={`text-xs font-medium px-2.5 py-0.5 shrink-0 ${item.active
                  ? 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20 hover:bg-green-500/15'
                  : 'bg-muted text-muted-foreground hover:bg-muted'
                  }`}
              >
                {item.active ? 'Activo' : 'Inactivo'}
              </Badge>
              {expired && (
                <Badge
                  variant='secondary'
                  className='text-xs font-medium px-2.5 py-0.5 bg-red-500/10 text-red-500 hover:bg-red-500/10 shrink-0'
                >
                  Expirada
                </Badge>
              )}
            </div>

            {/* Toggle with confirmation */}
            {expired && !item.active ? (
              <div className='flex items-center gap-2 shrink-0'>
                <span className='text-xs text-red-500/70 hidden sm:inline'>Expirada</span>
                <Switch
                  checked={false}
                  disabled
                  className='opacity-40'
                />
              </div>
            ) : (
              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogTrigger asChild>
                  <div className='flex items-center gap-2 shrink-0'>
                    <span className='text-xs text-muted-foreground hidden sm:inline'>
                      {item.active ? 'Desactivar' : 'Activar'}
                    </span>
                    <Switch
                      checked={item.active}
                      disabled={isPendingToggle}
                      onCheckedChange={() => setConfirmOpen(true)}
                      className='data-[state=checked]:bg-green-500'
                    />
                  </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {item.active ? 'Desactivar' : 'Activar'} resolución
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {item.active
                        ? `¿Está seguro que desea desactivar la resolución ${item.prefix} - ${item.document_number}? Solo puede tener una resolución activa por tipo.`
                        : `¿Está seguro que desea activar la resolución ${item.prefix} - ${item.document_number}? Si hay una resolución activa, será desactivada automáticamente.`}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onToggle()
                        setConfirmOpen(false)
                      }}
                      className='bg-green-1 hover:bg-green-1/90'
                    >
                      {item.active ? 'Desactivar' : 'Activar'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {/* Data Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            {/* Dates */}
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-1.5'>
                <IconCalendar size={14} className='text-muted-foreground' />
                <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                  Fechas válidas
                </span>
              </div>
              <span className='text-sm font-semibold text-foreground'>
                {formatDate(item.from_date)} — {formatDate(item.to_date)}
              </span>
            </div>

            {/* Number range */}
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-1.5'>
                <IconHash size={14} className='text-muted-foreground' />
                <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                  Rango habilitado
                </span>
              </div>
              <span className='text-sm font-semibold text-foreground'>
                {item.from_number} — {item.to_number}
              </span>
            </div>

            {/* Last invoice */}
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-1.5'>
                <IconFileInvoice size={14} className='text-muted-foreground' />
                <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                  Última factura
                </span>
              </div>
              <div className='flex items-center gap-2'>
                {hasPermission && item.active && isEditing ? (
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-1.5'>
                      <Input
                        type='number'
                        value={currentNumber}
                        min={item.from_number}
                        max={item.to_number}
                        onChange={(e) => onCurrentNumberChange(Number(e.target.value))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && currentNumber >= item.from_number && currentNumber <= item.to_number) onEditSave()
                          if (e.key === 'Escape') onEditCancel()
                        }}
                        disabled={isPendingPut}
                        className={`h-7 w-28 text-sm font-semibold ${currentNumber < item.from_number || currentNumber > item.to_number
                          ? 'border-red-500 focus-visible:ring-red-500'
                          : ''
                          }`}
                        autoFocus
                      />
                      <button
                        onClick={onEditSave}
                        disabled={isPendingPut || currentNumber < item.from_number || currentNumber > item.to_number}
                        className='p-1 rounded-md text-green-1 hover:bg-green-1/10 transition-colors disabled:opacity-50'
                        title='Guardar'
                      >
                        <IconDeviceFloppy size={16} />
                      </button>
                      <button
                        onClick={onEditCancel}
                        className='p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors'
                        title='Cancelar'
                      >
                        <IconX size={16} />
                      </button>
                    </div>
                    {(currentNumber < item.from_number || currentNumber > item.to_number) && (
                      <span className='text-[10px] text-red-500'>
                        Rango válido: {item.from_number} – {item.to_number}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-semibold text-foreground'>
                      {item.current_number}
                    </span>
                    {hasPermission && item.active && (
                      <button
                        onClick={onEditStart}
                        className='p-1 rounded-md text-green-1 hover:bg-green-1/10 transition-colors'
                        title='Editar número actual'
                      >
                        <IconEdit size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Usage Progress Bar */}
          {item.active && (
            <div className='space-y-1.5'>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-muted-foreground'>
                  {used.toLocaleString()} usadas de {totalRange.toLocaleString()}
                </span>
                <div className='flex items-center gap-2'>
                  <span className='text-muted-foreground'>
                    {remaining.toLocaleString()} restantes
                  </span>
                  <span className='font-semibold text-foreground'>
                    {usagePercent}%
                  </span>
                </div>
              </div>
              <div className='relative h-2.5 w-full overflow-hidden rounded-full bg-muted'>
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
                  style={{ width: `${progressWidth}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { ResolutionCard }
