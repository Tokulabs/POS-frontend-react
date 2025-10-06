import { FC, ReactNode } from 'react'
import { SettingsLayout } from '@/layouts/ContentLayout/SettingsLayout'
import { SettingsProfile } from './Components/SettingsProfile'
import { UpdatePasswordSettings } from './Components/UpdatePassword'
import Company from './Components/CompanySettings'
import { UserRolesEnum } from '@/pages/Users/types/UserTypes'

interface ProfileProps {
  children?: ReactNode
}

const Profile: FC<ProfileProps> = () => {
  const tabsData = [
    {
      title: 'Perfil',
      value: 'profile',
      content: <SettingsProfile />,
      // No allowedRoles means all users can access this tab
    },
    {
      title: 'Contraseña',
      value: 'password',
      content: <UpdatePasswordSettings />,
      // No allowedRoles means all users can access this tab
    },
    {
      title: 'Empresa',
      value: 'company',
      content: <Company />,
      allowedRoles: [UserRolesEnum.admin, UserRolesEnum.posAdmin], // Only admin and posAdmin can access this tab
    },
  ]

  return <SettingsLayout tabs={tabsData} />
}

export { Profile }
