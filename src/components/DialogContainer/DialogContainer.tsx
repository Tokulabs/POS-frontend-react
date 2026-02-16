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
  triggerComponent?: ReactNode
  open: boolean
  onOpenChange?: (value: boolean) => void
  triggerClassName?: string
}

export const DialogContainer: FC<PropsWithChildren<DialogContainerProps>> = ({
  children,
  onOpenChange,
  title,
  triggerTitle,
  triggerComponent,
  triggerClassName,
  open,
}) => {
  return (
    <Dialog open={open} onOpenChange={(value) => onOpenChange && onOpenChange(value)}>
      {triggerComponent ? (
        <DialogTrigger asChild>{triggerComponent}</DialogTrigger>
      ) : (
        <DialogTrigger
          className={`bg-green-1 flex p-3 text-white border-1 border-solid border-green-1 justify-center items-center rounded-md cursor-pointer hover:bg-card hover:text-green-1 focus-visible:ring-0 ${triggerClassName}`}
        >
          {triggerTitle}
        </DialogTrigger>
      )}
      <DialogPortal>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault()
          }}
          className='flex flex-col gap-6'
        >
          <DialogTitle className='flex flex-row justify-between m-0 text-2xl text-green-1'>
            {title}
          </DialogTitle>

          {children}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
