import { FC, PropsWithChildren } from 'react'
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'

interface DialogContainerProps {
  onOpenChange: (value: boolean) => void
  title: string
  triggerTitle: string
  open: boolean
}

export const DialogContainer: FC<PropsWithChildren<DialogContainerProps>> = ({
  children,
  onOpenChange,
  title,
  triggerTitle,
  open,
}) => {
  return (
    <Dialog open={open} onOpenChange={(value) => onOpenChange(value)}>
      <DialogTrigger className='bg-green-1 flex w-full p-3 text-white border-1 border-solid border-green-1 justify-center items-center rounded-md cursor-pointer hover:bg-white hover:text-green-1 focus-visible:ring-0'>
        {triggerTitle}
      </DialogTrigger>
      <DialogPortal>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault()
          }}
          className='flex flex-col gap-6'
        >
          <DialogTitle className='text-2xl m-0 text-green-1 flex flex-row justify-between'>
            {title}
          </DialogTitle>

          {children}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
