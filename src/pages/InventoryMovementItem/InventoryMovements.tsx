import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FC, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMovementById } from '../Purchase/helpers/services'
import { MovementItem } from './components/MovementItem'
import { Accordion } from '@/components/ui/accordion'
import { MovementEventType, Provider, stateType } from '../Purchase/types/PurchaseTypes'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { postInventoryMovementState } from './helpers/services'
import { toast } from 'sonner'
import { PopoverConfirmation } from '@/components/PopoverConfirmation/PopoverConfirmation'

type Action = 'approve' | 'reject' | 'override'

const stateRename: Record<stateType, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  overrided: 'Anulado',
}

const stateColors: Record<stateType, string> = {
  pending: 'bg-yellow-400',
  approved: 'bg-green-400',
  rejected: 'bg-red-400',
  overrided: 'bg-gray-400',
}

const movementEventType: Record<MovementEventType, string> = {
  purchase: 'Compra',
  return: 'Devolución',
  shipment: 'Remisión',
}

const DataInfoItem: FC<{ title: string; value: string }> = ({ title, value }) => {
  return (
    <div className='flex flex-col gap-2 p-2 bg-gray-100 rounded shadow-sm'>
      <span className='text-xs'>{title}</span>
      <span className='text-sm font-semibold'>{value}</span>
    </div>
  )
}

const InventoryMovementItem: FC = () => {
  const [openItem, setOpenItem] = useState<string | undefined>(undefined)
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const decodedID = id ? atob(id) : ''

  const { data: movementIdData, isLoading } = useQuery({
    queryKey: ['lastMovementId', decodedID],
    queryFn: async () => await getMovementById(decodedID ?? ''),
    enabled: !!decodedID, // Prevents execution when id is undefined
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  })

  const [movementNotes, setMovementNotes] = useState(movementIdData?.delivery_notes)

  const provider = movementIdData?.provider ?? ({} as Provider)

  const calcEventTypeName = useMemo(() => {
    const eventType = movementIdData?.event_type
    const origin = movementIdData?.origin
    if (!eventType) return 'shipment'
    if (eventType === 'purchase') return 'purchase'
    if (eventType === 'shipment') {
      return origin === 'warehouse' ? 'shipment' : 'return'
    }
    return 'shipment'
  }, [movementIdData?.event_type, movementIdData?.origin])

  const movementTypeText = movementEventType[calcEventTypeName]

  const { mutate: mutateUpdateMovement, isPending } = useMutation({
    mutationFn: postInventoryMovementState,
    onSuccess: () => {
      toast.success('Movimiento actualizado correctamente')
      queryClient.invalidateQueries({ queryKey: ['paginatedInventoryMovements'] })
      if (movementIdData?.event_type === 'purchase') {
        navigate('/purchases')
      } else {
        navigate('/inventory-movements')
      }
    },
  })

  const updateMovement = (state: Action) => {
    mutateUpdateMovement({
      id: String(movementIdData?.id),
      values: {
        state,
        delivery_notes: movementNotes || '',
      },
    })
  }

  if (isLoading || isPending) return <div>Loading...</div>

  return (
    <section className='w-full bg-white rounded-md p-5 gap-4 grid h-full grid-rows-[auto_1fr_auto]'>
      <header>
        <div className='flex flex-col w-full gap-4 p-4 bg-white rounded shadow-md'>
          <div className='flex flex-col pb-4 justify-center items-center border-b-[1px] border-gray-1'>
            <h2 className='text-2xl font-bold text-center text-gray-900 '>
              {movementTypeText} #{String(movementIdData?.id).padStart(4, '0')}
            </h2>
            <h4
              className={`${stateColors[movementIdData?.state || 'pending']} text-white rounded-xl px-4 text-sm`}
            >
              {stateRename[movementIdData?.state || 'pending']}
            </h4>
          </div>
          {movementIdData?.event_type === 'purchase' && (
            <div className='grid grid-cols-1 gap-4 text-gray-700 sm:grid-cols-3 lg:grid-cols-5'>
              <DataInfoItem title='Razón social' value={provider.legal_name} />
              <DataInfoItem title='Nombre proveedor' value={provider.name} />
              <DataInfoItem title='Correo electrónico' value={provider.email} />
              <DataInfoItem title='Teléfono' value={provider.phone} />
              <DataInfoItem title='NIT' value={provider.nit} />
            </div>
          )}
        </div>
      </header>
      <main className='flex flex-col gap-4 py-4 overflow-hidden overflow-y-scroll scrollbar-hide'>
        <Accordion
          type='single'
          className='flex flex-col gap-4'
          value={openItem}
          onValueChange={setOpenItem}
          collapsible
        >
          {movementIdData?.inventory_movement_items
            .sort((a, b) => (b.inventory.code > a.inventory.code ? -1 : 1))
            .map((item, index) => (
              <MovementItem
                key={index}
                item={item}
                setOpenItem={setOpenItem}
                movementState={movementIdData.state}
              />
            ))}
        </Accordion>
      </main>
      <footer className='flex items-end gap-4 border-t-[1px] border-gray-1'>
        <div className='w-full'>
          <Label htmlFor='movementNotes' className='text-xs'>
            Notas de la {movementTypeText}
          </Label>
          <Textarea
            id='movementNotes'
            className='resize-none'
            value={movementNotes}
            onChange={(e) => setMovementNotes(e.target.value)}
          />
        </div>
        {movementIdData?.state === 'pending' && (
          <>
            <PopoverConfirmation
              triggerText='Aprobar'
              titleText={`Estás seguro de aprobar esta ${movementTypeText} ?`}
              confirmAction={() => updateMovement('approve')}
              approveText='Sí, aprobar'
            />
            <PopoverConfirmation
              triggerText='Rechazar'
              titleText={`Estás seguro de rechazar esta ${movementTypeText} ?`}
              confirmAction={() => updateMovement('reject')}
              approveText='Sí, rechazar'
              buttonVariant='ghost'
            />
          </>
        )}
        {movementIdData?.state === 'approved' && (
          <PopoverConfirmation
            triggerText='Anular'
            titleText={`Estás seguro de anular esta ${movementTypeText} ?`}
            confirmAction={() => updateMovement('override')}
            approveText='Sí, anular'
            buttonVariant='destructive'
          />
        )}
      </footer>
    </section>
  )
}

export { InventoryMovementItem }
