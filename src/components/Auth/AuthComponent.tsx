import { FC, PropsWithChildren } from 'react'
import { Image } from 'antd'
import KiospotLogoLogin from '@/assets/logos/Kiospot_logo_vertical.webp'

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
  titleText = 'Ingresa',
  children,
}) => {
  return (
    <div className='w-100 min-h-[100vh] flex flex-col items-center justify-center'>
      <div className='w-96'>
        <Image
          style={{ width: '100%' }}
          preview={false}
          src={KiospotLogoLogin}
          alt='Kiospot Login Logo'
        />
      </div>
      <div className='min-w-[400px]'>
        <div className='flex justify-between items-center border-0 border-b-[1px] border-solid border-gray-200 pb-3 mb-4'>
          <h3 className='text-base'>{titleText}</h3>
          <h2 className='text-lg'>Kiospot POS</h2>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Authcomponent
