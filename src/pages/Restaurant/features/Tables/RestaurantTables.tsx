import { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconPlus, IconSettings, IconLayoutGrid } from '@tabler/icons-react'
import { toast } from 'sonner'
import { useRestaurantAreas } from '@/hooks/restaurant/useRestaurantAreas'
import { useRestaurantTables } from '@/hooks/restaurant/useRestaurantTables'
import { IRestaurantTable, TableStatus } from '@/pages/Restaurant/types/RestaurantTypes'
import { TableCard } from './components/TableCard'
import { TableFormModal, TableFormValues } from './components/TableFormModal'
import { ManageAreasModal } from './components/ManageAreasModal'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const RestaurantTables: FC = () => {
  const navigate = useNavigate()
  const { isLoading: areasLoading, areas, createArea, updateArea, deleteArea } = useRestaurantAreas()
  const { isLoading: tablesLoading, tables, createTable, updateTable, patchTable, deleteTable } = useRestaurantTables()

  const [activeTab, setActiveTab] = useState<string>('all')
  const [tableModalOpen, setTableModalOpen] = useState(false)
  const [areasModalOpen, setAreasModalOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<IRestaurantTable | null>(null)

  const isLoading = areasLoading || tablesLoading

  const filteredTables =
    activeTab === 'all'
      ? tables
      : activeTab === 'none'
      ? tables.filter((t) => t.area === null)
      : tables.filter((t) => t.area === Number(activeTab))

  const handleTableSubmit = (values: TableFormValues) => {
    if (editingTable) {
      updateTable.mutate(
        { id: editingTable.id, ...values },
        {
          onSuccess: () => {
            toast.success('Mesa actualizada')
            setTableModalOpen(false)
            setEditingTable(null)
          },
          onError: (error: any) => {
            const msg = error?.response?.data?.number?.[0] ?? 'Error al actualizar la mesa'
            toast.error(msg)
          },
        },
      )
    } else {
      createTable.mutate(values, {
        onSuccess: () => {
          toast.success('Mesa creada')
          setTableModalOpen(false)
        },
        onError: (error: any) => {
          const msg = error?.response?.data?.number?.[0] ?? 'Error al crear la mesa'
          toast.error(msg)
        },
      })
    }
  }

  const handleTableClick = (table: IRestaurantTable) => {
    if (table.status === 'occupied' && table.active_order_id) {
      navigate(`/restaurant/orders/${table.active_order_id}`)
    }
  }

  const handleEdit = (table: IRestaurantTable) => {
    setEditingTable(table)
    setTableModalOpen(true)
  }

  const handleDelete = (id: number) => {
    deleteTable.mutate(id, {
      onSuccess: () => toast.success('Mesa eliminada'),
      onError: () => toast.error('Error al eliminar la mesa'),
    })
  }

  const handleStatusChange = (id: number, status: TableStatus) => {
    patchTable.mutate(
      { id, status },
      { onError: () => toast.error('Error al cambiar el estado') },
    )
  }

  return (
    <div className='bg-card text-card-foreground h-full rounded-lg p-6 flex flex-col gap-5'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-semibold text-foreground'>Mesas</h1>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setAreasModalOpen(true)}
            className='gap-2'
          >
            <IconSettings size={15} />
            Áreas
          </Button>
          <Button
            size='sm'
            onClick={() => { setEditingTable(null); setTableModalOpen(true) }}
            className='gap-2'
          >
            <IconPlus size={15} />
            Nueva mesa
          </Button>
        </div>
      </div>

      {/* Area tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='flex-wrap h-auto gap-1'>
          <TabsTrigger value='all' className='text-xs'>
            Todas
            <span className='ml-1.5 text-muted-foreground'>({tables.length})</span>
          </TabsTrigger>
          {areas.map((area) => (
            <TabsTrigger key={area.id} value={String(area.id)} className='text-xs'>
              {area.name}
              <span className='ml-1.5 text-muted-foreground'>
                ({tables.filter((t) => t.area === area.id).length})
              </span>
            </TabsTrigger>
          ))}
          {tables.some((t) => t.area === null) && (
            <TabsTrigger value='none' className='text-xs'>
              Sin área
              <span className='ml-1.5 text-muted-foreground'>
                ({tables.filter((t) => t.area === null).length})
              </span>
            </TabsTrigger>
          )}
        </TabsList>
      </Tabs>

      {/* Table grid */}
      <div className='flex-1 overflow-y-auto'>
        {isLoading ? (
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className='h-36 rounded-lg' />
            ))}
          </div>
        ) : filteredTables.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-3 h-48 text-muted-foreground'>
            <IconLayoutGrid size={36} className='opacity-40' />
            <p className='text-sm'>
              {tables.length === 0
                ? 'No tienes mesas creadas. Agrega una con el botón de arriba.'
                : 'No hay mesas en esta área.'}
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>
            {filteredTables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onTableClick={handleTableClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status legend */}
      {tables.length > 0 && (
        <div className='flex flex-wrap gap-3 text-xs text-muted-foreground border-t border-border pt-3'>
          <span className='flex items-center gap-1.5'>
            <span className='w-2.5 h-2.5 rounded-full bg-emerald-500' />
            Disponible
          </span>
          <span className='flex items-center gap-1.5'>
            <span className='w-2.5 h-2.5 rounded-full bg-red-500' />
            Ocupada
          </span>
          <span className='flex items-center gap-1.5'>
            <span className='w-2.5 h-2.5 rounded-full bg-amber-500' />
            Reservada
          </span>
          <span className='flex items-center gap-1.5'>
            <span className='w-2.5 h-2.5 rounded-full bg-blue-500' />
            En limpieza
          </span>
        </div>
      )}

      <TableFormModal
        open={tableModalOpen}
        editing={editingTable}
        areas={areas}
        isPending={createTable.isPending || updateTable.isPending}
        onSubmit={handleTableSubmit}
        onCancel={() => { setTableModalOpen(false); setEditingTable(null) }}
      />

      <ManageAreasModal
        open={areasModalOpen}
        onClose={() => setAreasModalOpen(false)}
        areas={areas}
        onCreate={(name) =>
          new Promise((resolve, reject) =>
            createArea.mutate({ name }, {
              onSuccess: () => { toast.success('Área creada'); resolve() },
              onError: (e: any) => { toast.error(e?.response?.data?.name?.[0] ?? 'Error al crear el área'); reject(e) },
            }),
          )
        }
        onUpdate={(id, name) =>
          new Promise((resolve, reject) =>
            updateArea.mutate({ id, name }, {
              onSuccess: () => { toast.success('Área actualizada'); resolve() },
              onError: (e: any) => { reject(e) },
            }),
          )
        }
        onDelete={(id) =>
          new Promise((resolve, reject) =>
            deleteArea.mutate(id, {
              onSuccess: () => { toast.success('Área eliminada'); resolve() },
              onError: (e: any) => { toast.error(e?.response?.data?.error ?? 'Error al eliminar el área'); reject(e) },
            }),
          )
        }
      />
    </div>
  )
}

export { RestaurantTables }
