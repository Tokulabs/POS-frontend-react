import { FC, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { IconTrash, IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { getCostCenters, postCostCenter, deleteCostCenter } from '../helpers/costCenterServices'

const CostCentersSettings: FC = () => {
  const queryClient = useQueryClient()
  const [newName, setNewName] = useState('')

  const { data: costCenters = [], isPending } = useQuery({
    queryKey: ['costCenters'],
    queryFn: getCostCenters,
  })

  const { mutate: addCostCenter, isPending: isAdding } = useMutation({
    mutationFn: postCostCenter,
    onSuccess: () => {
      toast.success('Centro de costo creado')
      setNewName('')
      queryClient.invalidateQueries({ queryKey: ['costCenters'] })
    },
    onError: () => toast.error('Error al crear el centro de costo'),
  })

  const { mutate: removeCostCenter } = useMutation({
    mutationFn: deleteCostCenter,
    onSuccess: () => {
      toast.success('Centro de costo eliminado')
      queryClient.invalidateQueries({ queryKey: ['costCenters'] })
    },
    onError: () => toast.error('Error al eliminar el centro de costo'),
  })

  const handleAdd = () => {
    const trimmed = newName.trim()
    if (!trimmed) return
    addCostCenter(trimmed)
  }

  return (
    <div className='flex w-full h-full overflow-y-auto'>
      <div className='flex flex-col w-full gap-6 p-4 md:px-10'>
        <div>
          <h2 className='text-lg font-semibold'>Centros de Costo</h2>
          <p className='text-sm text-muted-foreground'>Administra los centros de costo de tu empresa</p>
        </div>

        <div className='flex gap-2 max-w-md'>
          <Input
            placeholder='Nombre del centro de costo'
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button onClick={handleAdd} disabled={isAdding || !newName.trim()}>
            <IconPlus size={16} className='mr-1' />
            Agregar
          </Button>
        </div>

        <div className='flex flex-col gap-2 max-w-md'>
          {isPending ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className='h-10 w-full' />)
          ) : costCenters.length === 0 ? (
            <p className='text-sm text-muted-foreground'>No hay centros de costo creados</p>
          ) : (
            costCenters.map((cc) => (
              <div key={cc.id} className='flex items-center justify-between rounded-lg border px-4 py-2 bg-background'>
                <span className='text-sm font-medium'>{cc.name}</span>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => removeCostCenter(cc.id)}
                  className='text-destructive hover:text-destructive hover:bg-destructive/10'
                >
                  <IconTrash size={16} />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export { CostCentersSettings }
