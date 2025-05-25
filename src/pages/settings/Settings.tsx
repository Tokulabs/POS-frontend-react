import { FC, ReactNode, useState } from 'react'
import { UserPassword } from '@/components/MainLayout/profileComponents/password'
import ProfileView from '@/components/MainLayout/profileComponents/profileView'
import Company from '@/components/MainLayout/profileComponents/company'
import { SettingsLayout } from '@/layouts/ContentLayout/SettingsLayout'
interface ProfileProps {
  children?: ReactNode
}

const Profile: FC<ProfileProps> = () => {
  const [loading, setLoading] = useState(false)

  const handlePasswordSubmit = async (values: { password: string }) => {
    setLoading(true)
    try {
      console.log('Contraseña enviada:', values.password)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      return true
    } catch (error) {
      console.error('Error al enviar la contraseña:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const tabsData = [
    {
      title: 'Perfil',
      value: 'profile',
      content: <ProfileView />,
    },
    {
      title: 'Contraseña',
      value: 'password',
      content: <UserPassword onSubmit={handlePasswordSubmit} loading={loading} />,
    },
    {
      title: 'Empresa',
      value: 'company',
      content: <Company />,
    },
  ]

  return <SettingsLayout tabs={tabsData} />
}

export { Profile }
