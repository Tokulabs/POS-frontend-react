import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'
import { ToggleSwitch } from '@/components/ToggleSwitch/ToggleSwitch'
import { AddCustomerForm } from './Customers/AddCustomerForm'
import { SearchCustomer } from './Customers/SearchCustomer'

export const DialogAddUser = () => {
  const [open, setOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const options = [
    { label: 'Cliente existente', content: <SearchCustomer open={open} setOpen={setOpen} /> },
    { label: 'Cliente nuevo', content: <AddCustomerForm setOpen={setOpen} /> },
  ]

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(!open)
        setSelectedIndex(0)
      }}
    >
      <DialogTrigger className='bg-green-1 flex w-full p-3 text-white border-1 border-solid border-green-1 justify-center items-center rounded-md cursor-pointer hover:bg-white hover:text-green-1 focus-visible:ring-0'>
        Agregar cliente
      </DialogTrigger>
      <DialogPortal>
        <DialogContent
          aria-describedby='create-client'
          onInteractOutside={(e) => {
            e.preventDefault()
          }}
          className='flex flex-col gap-6'
        >
          <DialogTitle className='text-2xl m-0 text-green-1 flex flex-row justify-between'>
            Crear cliente
          </DialogTitle>

          <ToggleSwitch
            options={options}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
          />
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
