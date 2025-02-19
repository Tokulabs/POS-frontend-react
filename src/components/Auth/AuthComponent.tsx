import { FC, PropsWithChildren } from 'react'
import ImageCarousel from '@/components/Carrousel/Carrousel'
import KiospotLogoColor from '@/assets/logos/Kiospot-Horizontal-Logo-Color.webp'
interface IAuthComponentProps {
  titleText?: string
  isPassword?: boolean
  bottomText?: string
  linkText?: string
  linkPath?: string
  loading?: boolean
  isUpdatePassword?: boolean
}

const Authcomponent: FC<PropsWithChildren<IAuthComponentProps>> = ({ children }) => {
  return (
    <section className='flex min-h-screen'>
      
      {/* Lado izquierdo con el carrusel */}
      <div className='md:w-[50%] min-h-[100vh] bg-gray-200 md:flex items-center justify-center hidden'>
        <ImageCarousel />
      </div>

      {/* Lado derecho con el logo y el formulario */}
      <div className='w-[50%] min-h-[100vh] flex flex-col items-center justify-center relative'>
        <div className='w-96'>  
          <img
            src={KiospotLogoColor}
            alt='Kiospot Logo Color'
            className='object-cover w-full h-full scale-y-105'
          />
        </div>

        {children}

        {/* Texto centrado en la parte inferior derecha */}
        <p className='text-base text-right absolute bottom-7'>
          © 2024 Toku Softlabs S.A.S. Todos los derechos reservados
        </p>
      </div>
      
    </section>
  )
}

export default Authcomponent
