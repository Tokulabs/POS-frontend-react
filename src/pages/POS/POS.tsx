import { FC } from 'react'
// Components
import { POSStepper } from './components/StepperPOS'
import { SideBarDataPOS } from './components/SideBarDataPOS'
// Store
import { usePOSStep } from '@/store/usePOSSteps'
// Hooks
import { useDianResolutions } from '@/hooks/useDianResolution'
// Third Party
import { IconFileSad } from '@tabler/icons-react'
import { Spin } from 'antd'
import { useNavigate } from 'react-router-dom'

const POS: FC = () => {
  const { currentStep } = usePOSStep()
  const navigate = useNavigate()

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
          className={`${currentStep === 2 || !existsResolution ? 'w-full' : 'w-3/4'} h-full p-5 bg-card shadow-lg rounded-sm`}
        >
          {existsResolution ? (
            <POSStepper />
          ) : (
            <section className='flex flex-col gap-4 justify-center items-center w-full h-full text-green-1'>
              <IconFileSad size={120} />
              <div className='flex flex-col items-center'>
                <span className='font-bold text-2xl'>No hay resoluciones activas</span>
                <span
                  className='cursor-pointer text-blue-500 underline'
                  onClick={() => {
                    navigate('/dian-resolution')
                  }}
                >
                  Crear o activar resolución
                </span>
              </div>
            </section>
          )}
        </section>
      )}
      {currentStep !== 2 && existsResolution ? <SideBarDataPOS /> : null}
    </section>
  )
}

export { POS }
