import { useMemo, useState } from 'react'
import { ToggleSwitch } from '@/components/ToggleSwitch/ToggleSwitch'
import { AddCustomerForm } from './Customers/AddCustomerForm'
import { SearchCustomer } from './Customers/SearchCustomer'
import { DialogContainer } from '@/components/DialogContainer/DialogContainer'
import { useHasPermission } from '@/hooks/useHasPermission'

export const DialogAddUser = () => {
  const [open, setOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const canCreateCustomer = useHasPermission('can_create_customer')

  const options = useMemo(() => {
    const base = [
      { label: 'Cliente existente', content: <SearchCustomer open={open} setOpen={setOpen} /> },
    ]
    if (canCreateCustomer) {
      base.push({ label: 'Cliente nuevo', content: <AddCustomerForm setOpen={setOpen} /> })
    }
    return base
  }, [open, canCreateCustomer])

  return (
    <DialogContainer
      open={open}
      onOpenChange={(value) => setOpen(value)}
      title='Agregar cliente'
      triggerTitle='Agregar cliente'
      triggerClassName='border w-full'
    >
      <ToggleSwitch options={options} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
    </DialogContainer>
  )
}
