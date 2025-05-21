import { FC, ReactNode, useState } from 'react'
import { Button } from '../../ui/button'
import { UserPassword } from '@/components/MainLayout/profileComponents/password'
import ProfileView from './profileView'
import Company from './company'
interface ProfileProps {
  children?: ReactNode
}

const Profile: FC<ProfileProps> = () => {
  const [activeSection, setActiveSection] = useState<'perfil' | 'contraseña' | 'empresa'>('perfil')
  const [loading, setLoading] = useState(false)

  const handlePasswordSubmit = async (values: { password: string }) => {
    setLoading(true)
    try {
      console.log('Contraseña enviada:', values.password)
      await new Promise((resolve) => setTimeout(resolve, 1500))
    } catch (error) {
      console.error('Error al enviar la contraseña:', error)
    } finally {
      setLoading(false)
    }
  }

  const getButtonClass = (section: 'perfil' | 'contraseña' | 'empresa') => {
    return `
      cursor-pointer 
      bg-transparent 
      text-black 
      shadow-none 
      hover:bg-zinc-300 
      ${activeSection === section ? 'bg-zinc-200' : ''}
      text-left 
      justify-start
    `
  }

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'perfil':
        return (
          <ProfileView />
        )
      case 'contraseña':
        return (
          <UserPassword onSubmit={handlePasswordSubmit} loading={loading} />
        )
      case 'empresa':
        return (
          <Company />
        )
      default:
        return null
    }
  }

  return (
    <div className='font-[Inter] bg-white p-10'>
      <header className='border-b-gray-300 border-b-[1px] flex-col flex gap-1 pb-5'>
        <span className='font-semibold text-2xl font-sans'>Configuración de la cuenta</span>
        <span className='font-normal text-sm text-gray-500'>
          Gestione la información de su cuenta y empresa
        </span>
      </header>

      <div className='flex h-screen'>
        <div className='flex flex-col w-[15%] gap-4 pt-5 border-r-[1px] border-r-gray-300 pr-5'>
          <Button className={getButtonClass('perfil')} onClick={() => setActiveSection('perfil')}>
            Perfil
          </Button>
          <Button
            className={getButtonClass('contraseña')}
            onClick={() => setActiveSection('contraseña')}
          >
            Contraseña
          </Button>
          <Button className={getButtonClass('empresa')} onClick={() => setActiveSection('empresa')}>
            Empresa
          </Button>
        </div>

        <div className='flex-1 p-6'>{renderSectionContent()}</div>
      </div>
    </div>
  )
}

export { Profile }
