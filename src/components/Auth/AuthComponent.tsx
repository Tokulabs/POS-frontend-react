import { FC, PropsWithChildren } from 'react'
import ImageCarousel from '@/components/Carrousel/Carrousel'
import KiospotLogoColor from '@/assets/logos/Kiospot-Horizontal-Logo-Color.webp'
import KiospotLogoWhite from '@/assets/logos/Kiospot-Horizontal-Logo-white.webp'
import { useThemeStore } from '@/store/useThemeStore'

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
  const { resolvedTheme } = useThemeStore()
  const isDarkMode = resolvedTheme === 'dark'

  return (
    <section className='flex min-h-screen bg-background'>
      {/* Lado izquierdo con el carrusel */}
      <div className='md:w-[50%] min-h-screen bg-secondary md:flex items-center justify-center hidden'>
        <ImageCarousel />
      </div>

      <section className='w-full py-4 md:w-[50%] flex flex-col h-screen items-center justify-between px-4 sm:px-10 md:px-14 lg:px-28 xl:px-40 bg-card'>
        {/* Lado derecho con el logo y el formulario */}
        <div></div>
        <div className='flex w-full flex-col justify-between items-center '>
          <div className='w-96'>
            <img
              src={isDarkMode ? KiospotLogoWhite : KiospotLogoColor}
              alt='Kiospot Logo'
              className='object-cover w-full h-full'
            />
          </div>

          {children}
        </div>
        {/* Texto centrado en la parte inferior derecha */}
        <p className='text-base text-center m-0 text-muted-foreground'>
          © 2024 Toku Softlabs S.A.S. Todos los derechos reservados
        </p>
      </section>
    </section>
  )
}

export default Authcomponent
