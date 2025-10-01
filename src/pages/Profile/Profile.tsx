import { FC, ReactNode } from 'react'
import { SettingsLayout } from '@/layouts/ContentLayout/SettingsLayout'
import { SettingsProfile } from './Components/SettingsProfile'
import { UpdatePasswordSettings } from './Components/UpdatePassword'
import Company from './Components/CompanySettings'

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
