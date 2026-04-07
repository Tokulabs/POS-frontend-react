import { FC, useState } from 'react'
import { IconCirclePlus, IconEdit, IconLock, IconTrash } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useUnitsOfMeasure } from '@/hooks/restaurant/useUnitsOfMeasure'
import { IUnitOfMeasure } from '../../types/RestaurantTypes'
import { UnitForm, UnitFormValues } from './components/UnitForm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const UNIT_TYPE_LABELS: Record<string, string> = {
  weight: 'Peso',
  volume: 'Volumen',
  count: 'Conteo',
}

const UNIT_TYPE_VARIANTS: Record<string, 'default' | 'secondary' | 'outline'> = {
  weight: 'default',
  volume: 'secondary',
  count: 'outline',
}

const RestaurantUnits: FC = () => {
  const { isLoading, globalUnits, customUnits, createUnit, updateUnit, deleteUnit } = useUnitsOfMeasure()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<IUnitOfMeasure | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const openCreate = () => {
    setEditingUnit(null)
    setModalOpen(true)
  }

  const openEdit = (unit: IUnitOfMeasure) => {
    setEditingUnit(unit)
    setModalOpen(true)
  }

  const handleSubmit = (values: UnitFormValues) => {
    if (editingUnit) {
      updateUnit.mutate(
        { id: editingUnit.id, ...values },
        {
          onSuccess: () => {
            toast.success('Unidad actualizada')
            setModalOpen(false)
          },
          onError: () => toast.error('Error al actualizar la unidad'),
        },
      )
    } else {
      createUnit.mutate(values, {
        onSuccess: () => {
          toast.success('Unidad creada')
          setModalOpen(false)
        },
        onError: () => toast.error('Error al crear la unidad'),
      })
    }
  }

  const handleDelete = () => {
    if (deleteId === null) return
    deleteUnit.mutate(deleteId, {
      onSuccess: () => {
        toast.success('Unidad eliminada')
        setDeleteId(null)
      },
      onError: (error: any) => {
        const status = error?.response?.status
        if (status === 500 || status === 409) {
          toast.error('No se puede eliminar: esta unidad está siendo usada por uno o más ingredientes.')
        } else {
          toast.error('Error al eliminar la unidad')
        }
        setDeleteId(null)
      },
    })
  }

  const isPending = createUnit.isPending || updateUnit.isPending

  return (
    <div className='bg-card text-card-foreground h-full rounded-lg p-6 flex flex-col gap-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-semibold text-foreground'>Unidades de Medida</h1>
        <Button onClick={openCreate} className='gap-2'>
          <IconCirclePlus size={16} />
          Agregar unidad
        </Button>
      </div>

      <div className='flex flex-col gap-6 overflow-y-auto'>
        {/* Global presets */}
        <section>
          <div className='flex items-center gap-2 mb-3'>
            <IconLock size={14} className='text-muted-foreground' />
            <h2 className='text-sm font-medium text-muted-foreground'>
              Unidades globales (solo lectura)
            </h2>
          </div>
          <TooltipProvider>
            <div className='flex flex-wrap gap-2'>
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className='h-6 w-14 rounded-full' />
                  ))
                : globalUnits.map((unit) => (
                    <Tooltip key={unit.id}>
                      <TooltipTrigger asChild>
                        <span className='cursor-default select-none'>
                          <Badge variant={UNIT_TYPE_VARIANTS[unit.unit_type]} className='rounded-full px-3'>
                            {unit.symbol}
                          </Badge>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {unit.name} · {UNIT_TYPE_LABELS[unit.unit_type]}
                      </TooltipContent>
                    </Tooltip>
                  ))}
            </div>
          </TooltipProvider>
        </section>

        {/* Company custom units */}
        <section>
          <h2 className='text-sm font-medium text-foreground mb-3'>Unidades personalizadas</h2>
          {customUnits.length === 0 && !isLoading ? (
            <p className='text-muted-foreground text-sm'>
              No tienes unidades personalizadas. Crea una con el botón de arriba.
            </p>
          ) : (
            <div className='rounded-lg border border-border overflow-hidden'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Símbolo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className='text-center'>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customUnits.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell className='font-medium'>{unit.name}</TableCell>
                      <TableCell>
                        <Badge variant={UNIT_TYPE_VARIANTS[unit.unit_type]}>{unit.symbol}</Badge>
                      </TableCell>
                      <TableCell className='text-muted-foreground'>
                        {UNIT_TYPE_LABELS[unit.unit_type]}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center justify-center gap-1'>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => openEdit(unit)}
                            className='h-8 w-8 text-muted-foreground hover:text-foreground'
                          >
                            <IconEdit size={15} />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => setDeleteId(unit.id)}
                            className='h-8 w-8 text-muted-foreground hover:text-destructive'
                          >
                            <IconTrash size={15} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </div>

      <UnitForm
        open={modalOpen}
        editingUnit={editingUnit}
        onSubmit={handleSubmit}
        onCancel={() => setModalOpen(false)}
        isPending={isPending}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar unidad</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar esta unidad? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export { RestaurantUnits }
