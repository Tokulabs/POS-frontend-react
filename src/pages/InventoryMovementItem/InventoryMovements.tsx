import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FC, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMovementById } from '../Purchase/helpers/services'
import { MovementItem } from './components/MovementItem'
import { Accordion } from '@/components/ui/accordion'
import { Provider, stateType } from '../Purchase/types/PurchaseTypes'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { postInventoryMovementState } from './helpers/services'
import { toast } from 'sonner'
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from '@/components/ui/popover'

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

const InventoryMovementItem: FC = () => {
  const [openItem, setOpenItem] = useState<string | undefined>(undefined)
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: movementIdData, isLoading } = useQuery({
    queryKey: ['lastMovementId', id],
    queryFn: async () => await getMovementById(id ?? ''),
    enabled: !!id, // Prevents execution when id is undefined
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  })

  const [movementNotes, setMovementNotes] = useState(movementIdData?.delivery_notes)

  const provider = movementIdData?.provider ?? ({} as Provider)

  const { mutate: mutateUpdateMovement, isPending } = useMutation({
    mutationFn: postInventoryMovementState,
    onSuccess: () => {
      toast.success('Movimiento actualizado correctamente')
      queryClient.invalidateQueries({ queryKey: ['paginatedInventoryMovements'] })
      navigate('/purchases')
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
              Compra # {String(movementIdData?.id).padStart(4, '0')}
            </h2>
            <h4
              className={`${stateColors[movementIdData?.state || 'pending']} text-white rounded-xl px-4 text-sm`}
            >
              {stateRename[movementIdData?.state || 'pending']}
            </h4>
          </div>
          <div className='grid grid-cols-1 gap-4 text-gray-700 sm:grid-cols-3 lg:grid-cols-5'>
            <div className='flex flex-col gap-2 p-2 bg-gray-100 rounded shadow-sm'>
              <span className='text-xs'>Razón Social</span>
              <span className='text-sm font-semibold'>{provider.legal_name}</span>
            </div>
            <div className='flex flex-col gap-2 p-2 bg-gray-100 rounded shadow-sm'>
              <span className='text-xs'>Nombre proveedor</span>
              <span className='text-sm font-semibold '>{provider.name}</span>
            </div>
            <div className='flex flex-col gap-2 p-2 bg-gray-100 rounded shadow-sm'>
              <span className='text-xs'>Correo</span>
              <span className='text-sm font-semibold truncate'>{provider.email}</span>
            </div>
            <div className='flex flex-col gap-2 p-2 bg-gray-100 rounded shadow-sm'>
              <span className='text-xs'>Teléfono</span>
              <span className='text-sm font-semibold'>{provider.phone}</span>
            </div>
            <div className='flex flex-col gap-2 p-2 bg-gray-100 rounded shadow-sm'>
              <span className='text-xs'>NIT</span>
              <span className='text-sm font-semibold'>{provider.nit}</span>
            </div>
          </div>
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
            Notas de la compra
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
            <Popover>
              <PopoverTrigger>
                <Button className='text-white bg-green-1' variant='default'>
                  Aprobar
                </Button>
              </PopoverTrigger>
              <PopoverContent side='top' align='end' sideOffset={15}>
                <div className='flex flex-col gap-4 p-4'>
                  <span className='text-center'>Estás seguro de aprobar esta compra?</span>
                  <div className='flex items-center justify-between gap-4'>
                    <Button onClick={() => updateMovement('approve')}>Sí, aprobar</Button>
                    <PopoverClose>
                      <Button variant='ghost'>Cancelar</Button>
                    </PopoverClose>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger>
                <Button variant='ghost'>Rechazar</Button>
              </PopoverTrigger>
              <PopoverContent side='top' align='end' sideOffset={15}>
                <div className='flex flex-col gap-4 p-4'>
                  <span className='text-center'>Estás seguro de rechazar esta compra?</span>
                  <div className='flex items-center justify-between gap-4'>
                    <Button onClick={() => updateMovement('reject')}>Sí, rechazar</Button>
                    <PopoverClose>
                      <Button variant='ghost'>Cancelar</Button>
                    </PopoverClose>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </>
        )}
        {movementIdData?.state === 'approved' && (
          <Popover>
            <PopoverTrigger>
              <Button variant='destructive'>Anular</Button>
            </PopoverTrigger>
            <PopoverContent side='top' align='end' sideOffset={15}>
              <div className='flex flex-col gap-4 p-4'>
                <span className='text-center'>Estás seguro de anular esta compra?</span>
                <div className='flex items-center justify-between gap-4'>
                  <Button variant='destructive' onClick={() => updateMovement('override')}>
                    Sí, Anular
                  </Button>
                  <PopoverClose>
                    <Button variant='ghost'>Cancelar</Button>
                  </PopoverClose>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </footer>
    </section>
  )
}

export { InventoryMovementItem }
