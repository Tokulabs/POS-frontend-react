import { FC, PropsWithChildren } from 'react'
import { cn } from '@/lib/utils'


interface IAuthComponentProps {
  titleText?: string
  isPassword?: boolean
  bottomText?: string
  linkText?: string
  linkPath?: string
  loading?: boolean
  isUpdatePassword?: boolean
}

const Authcomponent: FC<PropsWithChildren<IAuthComponentProps>> = ({
  children,
}) => {
  return (
    <div className={cn('w-full min-h-screen flex flex-col items-center justify-center')}>
      <div className={cn('w-96')}>
      <img
        src="src\assets\logos\Kiospot-Horizontal-Logo-Color.webp"
        alt="Imagen 1"
       className="object-cover w-full h-full scale-y-105"
      />
      </div>
          <div className='flex justify-between items-center border-b border-gray-200 pb-3 mb-4'>
          </div>
            {children}
          </div>
  )
}

export default Authcomponent
