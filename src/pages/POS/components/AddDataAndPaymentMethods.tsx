import { useDianResolutions } from '../../../hooks/useDianResolution'
import { Spin } from 'antd'
import Clock from '../../../components/Clock/Clock'
import { IconPlus } from '@tabler/icons-react'
import { AddCustomerModal } from './AddCustomerModal'
import { useState } from 'react'

export const AddDataAndPaymentMethods = () => {
  const [isVisible, setIsVisible] = useState(false)
  const { dianResolutionData, isLoading: isLoadingResolution } = useDianResolutions(
    'allDianResolutions',
    {},
  )

  const AddClientData = () => {
    setIsVisible(true)
  }

  return (
    <section className='flex flex-col gap-3 h-full justify-between'>
      {isLoadingResolution ? (
        <Spin />
      ) : (
        <section className='flex flex-col h-full justify-start gap-1'>
          <div className='flex justify-between items-end'>
            <span className='text-xs font-light'>Resolución activa:</span>
            <span className='text-white font-bold truncate'>
              {dianResolutionData?.results[0].document_number}
            </span>
          </div>
          <div className='flex gap-1 justify-between items-end'>
            <span className='text-xs font-light'># de factura:</span>

            <span className='text-white font-bold'>
              GUA-{dianResolutionData?.results[0].current_number}
            </span>
          </div>
          <div className='flex gap-1 justify-between items-end'>
            <span className='text-xs font-light'>Fecha y Hora:</span>
            <span className='text-white font-bold'>
              <Clock />
            </span>
          </div>
        </section>
      )}
      <section className=''>
        <span
          className='group text-white transition-all duration-300 ease-in-out decoration-transparent cursor-pointer flex items-center gap-2'
          onClick={() => AddClientData()}
        >
          <AddCustomerModal
            isVisible={isVisible}
            onCancelCallback={() => setIsVisible(false)}
            onSuccessCallback={() => setIsVisible(false)}
          />
          <IconPlus className='w-5 h-5' />
          <span className='bg-left-bottom bg-gradient-to-r from-green-1 to-white bg-[length:0%_1px] bg-no-repeat group-hover:bg-[length:100%_1px] transition-all duration-500 ease-out'>
            Agregar datos del cliente
          </span>
        </span>
      </section>
    </section>
  )
}
