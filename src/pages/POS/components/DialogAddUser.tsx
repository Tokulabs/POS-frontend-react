import { useState } from 'react'
import { ToggleSwitch } from '@/components/ToggleSwitch/ToggleSwitch'
import { AddCustomerForm } from './Customers/AddCustomerForm'
import { SearchCustomer } from './Customers/SearchCustomer'
import { DialogContainer } from '@/components/DialogContainer/DialogContainer'

export const DialogAddUser = () => {
  const [open, setOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const options = [
    { label: 'Cliente existente', content: <SearchCustomer open={open} setOpen={setOpen} /> },
    { label: 'Cliente nuevo', content: <AddCustomerForm setOpen={setOpen} /> },
  ]

  return (
    <DialogContainer
      open={open}
      onOpenChange={(value) => setOpen(value)}
      title='Agregar cliente'
      triggerTitle='Agregar cliente'
      triggerClassName='border-[1px] w-full'
    >
      <ToggleSwitch options={options} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
    </DialogContainer>
  )
}
