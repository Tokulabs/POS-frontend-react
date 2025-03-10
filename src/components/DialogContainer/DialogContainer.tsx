import { FC, PropsWithChildren, ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'

interface DialogContainerProps {
  title: string
  triggerTitle: ReactNode
  open: boolean
  onOpenChange?: (value: boolean) => void
  triggerClassName?: string
}

export const DialogContainer: FC<PropsWithChildren<DialogContainerProps>> = ({
  children,
  onOpenChange,
  title,
  triggerTitle,
  triggerClassName,
  open,
}) => {
  return (
    <Dialog open={open} onOpenChange={(value) => onOpenChange && onOpenChange(value)}>
      <DialogTrigger
        className={`bg-green-1 flex p-3 text-white border-1 border-solid border-green-1 justify-center items-center rounded-md cursor-pointer hover:bg-white hover:text-green-1 focus-visible:ring-0 ${triggerClassName}`}
      >
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
