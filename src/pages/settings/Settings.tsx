import { FC, ReactNode } from 'react'
// import { UserPassword } from '@/pages/Settings/Components/password'
// import Company from '@/pages/Settings/Components/company'
import { SettingsLayout } from '@/layouts/ContentLayout/SettingsLayout'
import ProfileSettings from './Components/ProfileSettings'

interface ProfileProps {
  children?: ReactNode
}

const Settings: FC<ProfileProps> = () => {
  // const [loading, setLoading] = useState(false)

  // const handlePasswordSubmit = async (values: { password: string }) => {
  //   setLoading(true)
  //   try {
  //     console.log('Contraseña enviada:', values.password)
  //     await new Promise((resolve) => setTimeout(resolve, 1500))
  //     return true
  //   } catch (error) {
  //     console.error('Error al enviar la contraseña:', error)
  //     return false
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const tabsData = [
    {
      title: 'Perfil',
      value: 'profile',
      content: <ProfileSettings />,
    },
    // {
    //   title: 'Contraseña',
    //   value: 'password',
    //   content: <UserPassword onSubmit={handlePasswordSubmit} loading={loading} />,
    // },
    // {
    //   title: 'Empresa',
    //   value: 'company',
    //   content: <Company />,
    // },
  ]

  return <SettingsLayout tabs={tabsData} />
}

export default Settings
