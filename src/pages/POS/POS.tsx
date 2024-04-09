// Components
import { POSStepper } from './components/StepperPOS'
import { AddCustomerModal } from './components/AddCustomerModal'
import { SideBarDataPOS } from './components/SideBarDataPOS'

export const POS = () => {
  return (
    <section className='w-full h-[calc(100vh-6.50rem)] flex gap-6'>
      <section className='w-3/4 h-full p-5 bg-white shadow-lg rounded-sm'>
        <POSStepper />
      </section>
      <SideBarDataPOS />
      <AddCustomerModal />
    </section>
  )
}
