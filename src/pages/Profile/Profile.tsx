import { FC, ReactNode } from 'react'
import { SettingsLayout } from '@/layouts/ContentLayout/SettingsLayout'
import { SettingsProfile } from './components/SettingsProfile'
import { UpdatePasswordSettings } from './components/UpdatePassword'
import Company from './components/Company'

interface ProfileProps {
  children?: ReactNode
}

const Profile: FC<ProfileProps> = () => {
  const tabsData = [
    {
      title: 'Perfil',
      value: 'profile',
      content: <SettingsProfile />,
    },
    {
      title: 'Contraseña',
      value: 'password',
      content: <UpdatePasswordSettings />,
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
