import { FC, ReactNode } from 'react'
import { Button, ButtonProps } from '../ui/button'
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from '../ui/popover'

interface PopoverConfirmationProps {
  titleText: string
  triggerText: string | ReactNode
  confirmAction: () => void
  cancelAction?: () => void
  buttonVariant?: ButtonProps['variant']
  buttonClassName?: string
  buttonSize?: ButtonProps['size']
  approveText?: string
  cancelText?: string
}

export const PopoverConfirmation: FC<PopoverConfirmationProps> = ({
  titleText,
  triggerText,
  confirmAction,
  cancelAction,
  cancelText = 'Cancelar',
  approveText = 'Aprobar',
  buttonVariant = 'default',
  buttonClassName = '',
  buttonSize = 'default',
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={buttonVariant} className={buttonClassName} size={buttonSize}>
          {triggerText}
        </Button>
      </PopoverTrigger>
      <PopoverContent side='top' align='end' sideOffset={15}>
        <div className='flex flex-col gap-4 p-4'>
          <span className='text-center'>{titleText}</span>
          <div className='flex items-center justify-between gap-4'>
            <Button onClick={confirmAction}>{approveText}</Button>
            <PopoverClose asChild>
              <Button onClick={cancelAction} variant='ghost'>
                {cancelText}
              </Button>
            </PopoverClose>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
