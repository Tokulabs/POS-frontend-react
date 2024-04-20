// Components
import { POSStepper } from './components/StepperPOS'
import { AddCustomerModal } from './components/AddCustomerModal'
import { SideBarDataPOS } from './components/SideBarDataPOS'
import { useCustomerData } from '../../store/useCustomerStoreZustand'
import { useEffect } from 'react'

export const POS = () => {
  const { fetchDefaultCustomer, openModalAddCustomer } = useCustomerData()

  useEffect(() => {
    fetchDefaultCustomer()
  }, [fetchDefaultCustomer])

  return (
    <section className='w-full h-[calc(100vh-6.50rem)] flex gap-6'>
      <section className='w-3/4 h-full p-5 bg-white shadow-lg rounded-sm'>
        <POSStepper />
      </section>
      <SideBarDataPOS />
      {openModalAddCustomer && <AddCustomerModal />}
    </section>
  )
}
