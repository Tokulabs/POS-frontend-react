import { FC, useState, useEffect } from 'react'
import {
  IconCirclePlus, IconEdit, IconTrash, IconAlertTriangle,
  IconChevronLeft, IconChevronRight, IconPackage, IconHistory,
} from '@tabler/icons-react'
import { toast } from 'sonner'
import { useIngredients } from '@/hooks/restaurant/useIngredients'
import { useUnitsOfMeasure } from '@/hooks/restaurant/useUnitsOfMeasure'
import { useProviders } from '@/hooks/useProviders'
import { IIngredient } from '../../types/RestaurantTypes'
import { formatNumberToColombianPesos } from '@/utils/helpers'
import { IngredientForm, IngredientFormValues } from './components/IngredientForm'
import { StockMovementModal } from './components/StockMovementModal'
import { MovementHistoryDialog } from './components/MovementHistoryDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
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

const PAGE_SIZE = 10

const UNIT_TYPE_VARIANTS: Record<string, 'default' | 'secondary' | 'outline'> = {
  weight: 'default',
  volume: 'secondary',
  count: 'outline',
}

const RestaurantIngredients: FC = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<IIngredient | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [movementIngredient, setMovementIngredient] = useState<IIngredient | null>(null)
  const [historyIngredient, setHistoryIngredient] = useState<IIngredient | null>(null)

  const { isLoading, ingredients, totalCount, createIngredient, updateIngredient, deleteIngredient, addMovement } =
    useIngredients({ keyword, page })
  const { units } = useUnitsOfMeasure()
  const { providersData } = useProviders('restaurant-providers')
  const providers = providersData?.results ?? []

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  useEffect(() => { setPage(1) }, [keyword])

  const handleSearch = (e: { preventDefault(): void }) => {
    e.preventDefault()
    setKeyword(searchInput.trim())
  }

  const openCreate = () => {
    setEditingIngredient(null)
    setModalOpen(true)
  }

  const openEdit = (ingredient: IIngredient) => {
    setEditingIngredient(ingredient)
    setModalOpen(true)
  }

  const handleSubmit = (values: IngredientFormValues) => {
    if (editingIngredient) {
      updateIngredient.mutate(
        { id: editingIngredient.id, ...values },
        {
          onSuccess: () => { toast.success('Ingrediente actualizado'); setModalOpen(false) },
          onError: () => toast.error('Error al actualizar el ingrediente'),
        },
      )
    } else {
      createIngredient.mutate(values, {
        onSuccess: () => { toast.success('Ingrediente creado'); setModalOpen(false) },
        onError: () => toast.error('Error al crear el ingrediente'),
      })
    }
  }

  const handleDelete = () => {
    if (deleteId === null) return
    deleteIngredient.mutate(deleteId, {
      onSuccess: () => { toast.success('Ingrediente eliminado'); setDeleteId(null) },
      onError: (error: any) => {
        const msg = error?.response?.data?.error
        toast.error(msg ?? 'Error al eliminar el ingrediente')
        setDeleteId(null)
      },
    })
  }

  const handleMovement = (data: Parameters<typeof addMovement.mutate>[0]) => {
    addMovement.mutate(data, {
      onSuccess: () => {
        toast.success('Movimiento registrado')
        setMovementIngredient(null)
      },
      onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Error al registrar el movimiento'),
    })
  }

  const isLowStock = (ingredient: IIngredient) =>
    Number(ingredient.stock_quantity) <= Number(ingredient.min_stock)

  const isPending = createIngredient.isPending || updateIngredient.isPending

  return (
    <div className='bg-card text-card-foreground h-full rounded-lg p-6 flex flex-col gap-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-semibold text-foreground'>Ingredientes</h1>
        <div className='flex items-center gap-3'>
          <form onSubmit={handleSearch} className='flex gap-2'>
            <Input
              placeholder='Buscar ingrediente...'
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value)
                if (e.target.value === '') setKeyword('')
              }}
              className='w-52'
            />
            <Button type='submit' variant='outline' size='sm'>
              Buscar
            </Button>
          </form>
          <Button onClick={openCreate} className='gap-2'>
            <IconCirclePlus size={16} />
            Agregar ingrediente
          </Button>
        </div>
      </div>

      <div className='rounded-lg border border-border overflow-hidden flex-1 flex flex-col'>
        {isLoading ? (
          <div className='p-4 space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-10 w-full' />
            ))}
          </div>
        ) : ingredients.length === 0 ? (
          <div className='flex items-center justify-center h-40 text-muted-foreground text-sm'>
            {keyword ? 'Sin resultados para tu búsqueda.' : 'No tienes ingredientes registrados.'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead className='text-right'>Stock actual</TableHead>
                <TableHead className='text-right'>Stock mínimo</TableHead>
                <TableHead className='text-right'>Costo / unidad</TableHead>
                <TableHead className='text-center'>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      {isLowStock(ingredient) && (
                        <IconAlertTriangle size={14} className='text-destructive shrink-0' title='Stock bajo' />
                      )}
                      <span className='font-medium'>{ingredient.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={UNIT_TYPE_VARIANTS[ingredient.unit_detail?.unit_type ?? 'count']}>
                      {ingredient.unit_detail?.symbol ?? '—'}
                    </Badge>
                  </TableCell>
                  <TableCell className='text-sm text-muted-foreground'>
                    {ingredient.provider?.name ?? '—'}
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono text-sm ${isLowStock(ingredient) ? 'text-destructive font-semibold' : ''}`}
                  >
                    {Number(ingredient.stock_quantity).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className='text-right font-mono text-sm text-muted-foreground'>
                    {Number(ingredient.min_stock).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className='text-right text-sm'>
                    {formatNumberToColombianPesos(Number(ingredient.cost_per_unit), true)}
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center justify-center gap-1'>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setMovementIngredient(ingredient)}
                        className='h-8 w-8 text-muted-foreground hover:text-emerald-600'
                        title='Ajustar stock'
                      >
                        <IconPackage size={15} />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setHistoryIngredient(ingredient)}
                        className='h-8 w-8 text-muted-foreground hover:text-foreground'
                        title='Ver historial'
                      >
                        <IconHistory size={15} />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => openEdit(ingredient)}
                        className='h-8 w-8 text-muted-foreground hover:text-foreground'
                      >
                        <IconEdit size={15} />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setDeleteId(ingredient.id)}
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
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <span>{totalCount} ingredientes · Página {page} de {totalPages}</span>
          <div className='flex items-center gap-1'>
            <Button variant='ghost' size='icon' className='h-8 w-8' disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <IconChevronLeft size={15} />
            </Button>
            <Button variant='ghost' size='icon' className='h-8 w-8' disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <IconChevronRight size={15} />
            </Button>
          </div>
        </div>
      )}

      <IngredientForm
        open={modalOpen}
        editingIngredient={editingIngredient}
        units={units}
        providers={providers}
        onSubmit={handleSubmit}
        onCancel={() => setModalOpen(false)}
        isPending={isPending}
      />

      <StockMovementModal
        open={!!movementIngredient}
        ingredient={movementIngredient}
        providers={providers}
        isPending={addMovement.isPending}
        onSubmit={handleMovement}
        onCancel={() => setMovementIngredient(null)}
      />

      <MovementHistoryDialog
        open={!!historyIngredient}
        ingredient={historyIngredient}
        onClose={() => setHistoryIngredient(null)}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar ingrediente</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar este ingrediente? Esta acción no se puede deshacer.
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

export { RestaurantIngredients }
