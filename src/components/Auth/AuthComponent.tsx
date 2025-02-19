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

      <section className='w-full md:w-[50%] flex flex-col h-screen items-center justify-between'>
        {/* Lado derecho con el logo y el formulario */}
        <div></div>
        <div className='flex flex-col justify-between items-center'>
          <div className='w-96'>
            <img
              src={KiospotLogoColor}
              alt='Kiospot Logo Color'
              className='object-cover w-full h-full'
            />
          </div>

          {children}
        </div>
        {/* Texto centrado en la parte inferior derecha */}
        <p className='text-base text-center'>
          © 2024 Toku Softlabs S.A.S. Todos los derechos reservados
        </p>
      </section>
    </section>
  )
}

export default Authcomponent
