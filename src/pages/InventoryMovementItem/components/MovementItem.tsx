import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { InventoryMovementItem, stateType } from '@/pages/Purchase/types/PurchaseTypes'
import { IconSquareCheckFilled, IconSquareXFilled } from '@tabler/icons-react'
import { ChangeEvent, FC, useState } from 'react'
import { toast } from 'sonner'
import { postInventoryMovementItem } from '../helpers/services'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type Action = 'approve' | 'reject'

const buttonsActions: Record<stateType, Action[]> = {
  pending: ['approve', 'reject'],
  approved: ['reject'],
  rejected: ['approve'],
  overrided: [],
  failed: [],
  completed: [],
}

const buttonConfig: Record<
  Action,
  { label: string; className?: string; variant?: 'destructive'; icon: JSX.Element }
> = {
  approve: {
    label: 'Aprobar',
    className: 'bg-green-1 hover:bg-card hover:text-green-1',
    icon: <IconSquareCheckFilled />,
  },
  reject: {
    label: 'Rechazar',
    variant: 'destructive',
    icon: <IconSquareXFilled />,
  },
}

interface MovementItemProps {
  item: InventoryMovementItem
  setOpenItem: (value: string | undefined) => void
  movementState: stateType
}

const stateStyles: Record<stateType, string> = {
  pending: 'border-yellow-300 bg-yellow-400',
  approved: 'border-green-300 bg-green-400',
  rejected: 'border-red-300 bg-red-400',
  overrided: 'border-gray-300 bg-gray-400',
  failed: 'border-red-600 bg-red-600',
  completed: 'border-blue-300 bg-blue-400',
}

const stateRename: Record<stateType, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  overrided: 'Anulado',
  failed: 'Fallido',
  completed: 'Completado',
}

const titles = ['Código', 'Producto', 'Cantidad Solicitada', 'Cantidad Recibida', 'Estado']

export const MovementItem: FC<MovementItemProps> = ({ item, setOpenItem, movementState }) => {
  const quantityRejected = item.state === 'rejected' ? 0 : item.approved_quantity || item.quantity
  const [deliveryNotes, setDeliveryNotes] = useState(item.delivery_notes || '')
  const [quantity, setQuantity] = useState(quantityRejected)
  const queryClient = useQueryClient()

  // Mutación para actualizar el estado del ítem en la base de datos
  const { mutate: mutateUpdateItem, isPending } = useMutation({
    mutationFn: postInventoryMovementItem,
    onSuccess: () => {
      toast.success('Item validado correctamente')
      queryClient.invalidateQueries({ queryKey: ['lastMovementId'] })
      setOpenItem('')
    },
  })

  const updateMovementItem = (state: Action) => {
    mutateUpdateItem({
      id: String(item.id),
      values: {
        state,
        delivery_notes: deliveryNotes,
        quantity: state === 'approve' ? quantity : 0,
      },
    })
  }

  const updateQuantity = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    if (value < 0) setQuantity(0)
    setQuantity(value)
  }

  return (
    <AccordionItem
      value={`item-id-${item.id}`}
      className={`px-4 border-y-0 border-r-0 border-l-4 w-full rounded-md shadow ${stateStyles[item.state]} bg-card`}
    >
      <AccordionTrigger className='w-full hover:no-underline'>
        <article className='flex flex-col w-full gap-1'>
          <div className='grid w-full grid-cols-5 gap-2'>
            {titles.map((title, index) => (
              <span key={index} className='w-full text-xs text-gray-2'>
                {title}
              </span>
            ))}
          </div>
          <div className='grid w-full grid-cols-5 gap-2 text-base font-semibold text-blue-950'>
            <span className='w-full truncate'>{item.inventory.code}</span>
            <span className='w-full truncate'>{item.inventory.name}</span>
            <span className='w-full truncate'>{item.quantity}</span>
            <span className='w-full truncate'>{quantityRejected}</span>
            <div className='h-full'>
              <span
                className={`text-sm flex w-fit font-medium justify-center items-center text-white rounded-xl px-4 py-0 truncate ${stateStyles[item.state]}`}
              >
                {stateRename[item.state]}
              </span>
            </div>
          </div>
        </article>
      </AccordionTrigger>
      <AccordionContent className='w-full border-t-[1px] border-gray-100 py-4 flex flex-row gap-8'>
        <div className='flex items-center justify-center w-56 h-56'>
          {item.inventory.photo ? (
            <img
              src={item.inventory.photo}
              alt='item photo'
              className='object-cover w-full h-full aspect-square'
            />
          ) : (
            <span className='text-4xl text-center flex justify-center items-center rounded border-[1px] w-full h-full text-gray-1'>
              No foto
            </span>
          )}
        </div>
        <div className='flex flex-col w-full gap-4'>
          <div className='w-32'>
            <Label htmlFor='receivedQuantity' className='text-xs'>
              Cantidad Recibida
            </Label>
            <Input
              id='receivedQuantity'
              type='number'
              value={quantity}
              onChange={updateQuantity}
              disabled={movementState !== 'pending' || isPending}
            />
          </div>
          <div>
            <Label htmlFor='itemNotes' className='text-xs'>
              Notas
            </Label>
            <Textarea
              id='itemNotes'
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              disabled={movementState !== 'pending' || isPending}
            />
          </div>
          {movementState === 'pending' && (
            <div className='flex flex-row gap-4'>
              {buttonsActions[item.state]?.map((action) => (
                <Button
                  key={action}
                  onClick={() => updateMovementItem(action)}
                  {...buttonConfig[action]}
                >
                  {buttonConfig[action].icon}{' '}
                  {isPending ? 'Loading...' : buttonConfig[action].label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
