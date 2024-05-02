// Components
import { POSStepper } from './components/StepperPOS'
import { AddCustomerModal } from './components/AddCustomerModal'
import { SideBarDataPOS } from './components/SideBarDataPOS'
// Store
import { useCustomerData } from '../../store/useCustomerStoreZustand'
import { usePOSStep } from '../../store/usePOSSteps'
// Hooks
import { useDianResolutions } from '../../hooks/useDianResolution'
// Third Party
import { IconFileSad } from '@tabler/icons-react'
import { Spin } from 'antd'

export const POS = () => {
  const { openModalAddCustomer } = useCustomerData()
  const { currentStep } = usePOSStep()

  const { dianResolutionData, isPending } = useDianResolutions('getActiveDianResolution', {
    active: 'True',
  })

  const existsResolution = dianResolutionData?.results.length ?? 0 > 0

  return (
    <section className='w-full h-[calc(100vh-6.50rem)] flex gap-6 justify-center items-center'>
      {isPending ? (
        <Spin size='large' />
      ) : (
        <section
          className={`${currentStep === 2 || !existsResolution ? 'w-full' : 'w-3/4'} h-full p-5 bg-white shadow-lg rounded-sm`}
        >
          {existsResolution ? (
            <POSStepper />
          ) : (
            <section className='flex flex-col gap-4 justify-center items-center w-full h-full text-green-1'>
              <IconFileSad size={120} />
              <div className='flex flex-col items-center'>
                <span className='font-bold text-2xl'>No hay resoluciones activas</span>
                <a href='/dian-resolution'>Crear o activar resolución</a>
              </div>
            </section>
          )}
        </section>
      )}
      {currentStep !== 2 && existsResolution ? <SideBarDataPOS /> : null}
      {openModalAddCustomer && <AddCustomerModal />}
    </section>
  )
}
