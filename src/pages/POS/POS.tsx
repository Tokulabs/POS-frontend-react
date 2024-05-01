// Components
import { POSStepper } from './components/StepperPOS'
import { AddCustomerModal } from './components/AddCustomerModal'
import { SideBarDataPOS } from './components/SideBarDataPOS'
// Store
import { useCustomerData } from '../../store/useCustomerStoreZustand'
import { usePOSStep } from '../../store/usePOSSteps'

export const POS = () => {
  const { openModalAddCustomer } = useCustomerData()
  const { currentStep } = usePOSStep()

  return (
    <section className='w-full h-[calc(100vh-6.50rem)] flex gap-6'>
      <section
        className={`${currentStep === 2 ? 'w-full' : 'w-3/4'} h-full p-5 bg-white shadow-lg rounded-sm`}
      >
        <POSStepper />
      </section>
      {currentStep !== 2 && <SideBarDataPOS />}
      {openModalAddCustomer && <AddCustomerModal />}
    </section>
  )
}
