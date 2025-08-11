import React, { useEffect, useContext } from 'react'
import usePrintInfo from '@/hooks/usePrintInfo'
import { formatDateTime } from '@/layouts/helpers/helpers'
import { useQuery } from '@tanstack/react-query'
import { getMovementById } from '@/pages/Purchase/helpers/services'
import { IconCircleCheck, IconCircleX, IconClock } from '@tabler/icons-react'
import { store } from '@/store'
import { safeValue } from '@/utils/helpers'

interface PrintInventoryMovementProps {
  id: string
  onAfterPrint?: () => void
  mode?: 'single' | 'all'
}

interface InventoryMovementItem {
  id: number | string
  quantity: number
  inventory: {
    code: string
    name?: string
    description?: string
  }
  state?: string
  delivery_notes?: string
}

const PrintInventoryMovement: React.FC<PrintInventoryMovementProps> = ({ id, onAfterPrint }) => {
  const { printContentRef, triggerPrint } = usePrintInfo()
  const { state } = useContext(store)

  const { data: movement, isLoading } = useQuery({
    queryKey: ['printMovement', id],
    queryFn: () => getMovementById(id),
    enabled: !!id,
    refetchOnMount: true,
    staleTime: 0,
    gcTime: 0,
  })

  useEffect(() => {
    if (!movement?.id) return
    triggerPrint()
    onAfterPrint?.()
  }, [movement])

  if (isLoading || !movement?.id) return null

  const movementTypeText =
    movement?.event_type === 'shipment'
      ? movement?.origin === 'warehouse'
        ? 'Remisión'
        : 'Devolución'
      : {
          purchase: 'Orden de Compra',
          return: 'Devolución',
          shipment: 'Remisión',
        }[movement?.event_type || 'shipment']

  const formatDateSafe = (dateString: string) => {
    try {
      return dateString ? formatDateTime(dateString) : 'N/A'
    } catch (error) {
      return dateString || 'N/A'
    }
  }

  const itemsToPrint: InventoryMovementItem[] = movement.inventory_movement_items || []
  const company = state.user?.company

  return (
    <div ref={printContentRef} className='p-20'>
      {/* Encabezado */}
      <div className='flex justify-between items-start mb-6'>
        <div>
          <div className='text-3xl font-bold mb-2'>
            {safeValue(movementTypeText)} #{safeValue(movement.id)}
          </div>
          <strong>Estado</strong>
          <span className='pl-[35%]'>
            {movement.state === 'approved' ? (
              <span className='inline-flex items-center justify-center ml-2 mr-1 rounded-full bg-green-500'>
                <IconCircleCheck size={20} color='white' />
              </span>
            ) : movement.state === 'pending' ? (
              <span className='inline-flex items-center justify-center ml-2 mr-1 rounded-full bg-yellow-400'>
                <IconClock size={20} color='white' />
              </span>
            ) : (
              <span className='inline-flex items-center justify-center ml-2 mr-1 rounded-full bg-red-500'>
                <IconCircleX size={20} color='white' />
              </span>
            )}
            {safeValue(
              {
                approved: 'Aprobado',
                pending: 'Pendiente',
                rejected: 'Rechazado',
                overrided: 'Anulado',
              }[movement.state] || movement.state
            )}
          </span>
          <br />
          <strong>Fecha de creación </strong>
          <span className='ml-3'>{formatDateSafe(movement.created_at)}</span>
          <br />
          <strong>Fecha de revisión </strong>
          <span className='ml-4'>{formatDateSafe(movement.updated_at)}</span>
          <br />
          <br />
          {movementTypeText !== 'Orden de Compra' && (
            <>
              <div>
                <strong>Origen:</strong>
                <span className='ml-2'>
                  {safeValue(
                    {
                      warehouse: 'Bodega',
                      store: 'Tienda',
                    }[movement.origin] || movement.origin
                  )}
                </span>
              </div>
              <div>
                <strong>Destino:</strong>
                <span className='ml-2'>
                  {safeValue(
                    {
                      warehouse: 'Bodega',
                      store: 'Tienda',
                    }[movement.destination] || movement.destination
                  )}
                </span>
              </div>
            </>
          )}
        </div>
        <div className='justify-self-end text-right'>
          <span className='text-xl font-semibold mb-1'>{safeValue(company?.name)}</span>
          <br />
          <span className='text-sm mb-1'>{safeValue(company?.nit)}</span>
          <br />
          <span className='text-xs mb-1'>Tel: {safeValue(company?.phone)}</span>
          <br />
          <span className='text-xs mb-1 text-cyan-600 underline'>{safeValue(company?.email)}</span>
        </div>
      </div>

      {/* Proveedor */}
      {movementTypeText === 'Orden de Compra' && movement.provider && (
        <div className='mb-8 w-[50%]'>
          <div className='font-bold text-2xl mb-2' style={{ lineHeight: 1 }}>
            Proveedor
          </div>
          <div className='border-b border-black mb-2' />
          <div className='flex flex-col gap-1 text-base'>
            <div className='flex'>
              <strong className='w-[170px]'>Nombre:</strong>
              <span>{safeValue(movement.provider.name)}</span>
            </div>
            <div className='flex'>
              <strong className='w-[170px]'>Razón Social:</strong>
              <span>{safeValue(movement.provider.legal_name || movement.provider.name)}</span>
            </div>
            <div className='flex'>
              <strong className='w-[170px]'>NIT:</strong>
              <span>{safeValue(movement.provider.nit)}</span>
            </div>
            <div className='flex'>
              <strong className='w-[170px]'>Correo electrónico:</strong>
              <a href={`mailto:${movement.provider.email}`} className='text-cyan-600 underline'>
                {safeValue(movement.provider.email)}
              </a>
            </div>
            <div className='flex'>
              <strong className='w-[170px]'>Teléfono:</strong>
              <span>{safeValue(movement.provider.phone)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <table className='w-full border-t border-black mt-8 text-sm'>
        <thead className='border-b border-black'>
          <tr className='text-left'>
            <th className='py-2 px-2 font-semibold'>Producto</th>
            <th className='py-2 px-2 font-semibold'>Código</th>
            <th className='py-2 px-2 font-semibold w-1/10'>Cantidad Solicitada</th>
            <th className='py-2 px-2 font-semibold w-1/10'>Cantidad Recibida</th>
            <th className='py-2 px-2 font-semibold w-2/5 text-center'>Notas</th>
            <th className='py-2 px-2 font-semibold'>Estado</th>
          </tr>
        </thead>
        <tbody>
          {itemsToPrint.map((item) => (
            <tr key={item.id} className='align-top'>
              <td className='py-1 px-2'>{safeValue(item.inventory.name) || 'Sin descripción'}</td>
              <td className='py-1 px-2'>{safeValue(item.inventory.code)}</td>
              <td className='py-1 px-2 w-1/12'>{safeValue(item.quantity)}</td>
              <td className='py-1 px-2 w-1/12'>{safeValue(item.quantity)}</td>
              <td className='py-1 px-2 w-2/5'>{safeValue(item.delivery_notes)}</td>
              <td className='py-1 px-2'>
                {safeValue(
                  {
                    approved: 'Aprobado',
                    pending: 'Pendiente',
                    rejected: 'Rechazado',
                  }[item.state || '']
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <span className='block mt-[10%] text-sm'>
        <strong>Notas</strong>
        <br />
        {safeValue(movement.delivery_notes)}
      </span>

      <span className='text-center w-[40%] block mt-[15%] text-sm border-black border-t'>
        Firma Recibido
      </span>
    </div>
  )
}

export default PrintInventoryMovement
