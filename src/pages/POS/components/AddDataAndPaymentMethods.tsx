// Hooks
import { useDianResolutions } from '../../../hooks/useDianResolution'
// Third party
import { Spin } from 'antd'
// Components
import Clock from '../../../components/Clock/Clock'
// Store
import { useCustomerData } from '../../../store/useCustomerStoreZustand'

export const AddDataAndPaymentMethods = () => {
  const { dianResolutionData, isLoading: isLoadingResolution } = useDianResolutions(
    'allDianResolutions',
    {},
  )
  const { customer } = useCustomerData()

  return (
    <section className='flex flex-col gap-3 h-full justify-between'>
      {isLoadingResolution ? (
        <Spin />
      ) : (
        <section className='flex flex-col h-full justify-start gap-1'>
          <div className='flex justify-between items-end'>
            <span className='text-xs'>Resolución activa:</span>
            <span className='text-green-1 font-bold truncate'>
              {dianResolutionData?.results[0].document_number}
            </span>
          </div>
          <div className='flex gap-1 justify-between items-end'>
            <span className='text-xs'># de factura:</span>

            <span className='text-green-1 font-bold truncate'>
              GUA-{dianResolutionData?.results[0].current_number}
            </span>
          </div>
          <div className='flex gap-1 justify-between items-end'>
            <span className='text-xs'>Fecha y Hora:</span>
            <span className='text-green-1 font-bold truncate'>
              <Clock />
            </span>
          </div>
        </section>
      )}
      <section>
        <span className='text-green-1 text-lg font-bold'>Datos del cliente</span>
        <div className='flex flex-col gap-1 items-start'>
          <div className='flex flex-col gap-1 justify-between'>
            <span className='text-xs font-semibold'>Nombre:</span>
            <span className='font-bold truncate'>{customer.name ? customer.name : 'N/A'}</span>
          </div>
          <div className='flex flex-col gap-1 justify-between'>
            <span className='text-xs font-semibold'>Documento:</span>
            <span className='font-bold truncate'>
              {customer.idNumber ? customer.idNumber : 'N/A'}
            </span>
          </div>
          <div className='flex flex-col gap-1 justify-between'>
            <span className='text-xs font-semibold'>Teléfono:</span>
            <span className='font-bold truncate'>{customer.phone ? customer.phone : 'N/A'}</span>
          </div>
          <div className='flex flex-col gap-1 justify-between'>
            <span className='text-xs font-semibold'>Dirección:</span>
            <span className='font-bold truncate'>
              {customer.address ? customer.address : 'N/A'}
            </span>
          </div>
          <div className='flex flex-col gap-1 justify-between'>
            <span className='text-xs font-semibold'>Correo:</span>
            <span className='font-bold truncate'>{customer.email ? customer.email : 'N/A'}</span>
          </div>
        </div>
      </section>
    </section>
  )
}
