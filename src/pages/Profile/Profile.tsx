import { FC, ReactNode } from 'react'
import { SettingsLayout } from '@/layouts/ContentLayout/SettingsLayout'
import { SettingsProfile } from './Components/SettingsProfile'
import { UpdatePasswordSettings } from './Components/UpdatePassword'
import Company from './Components/CompanySettings'
import { RolesSettings } from './Components/RolesSettings'

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
      requiredPermission: 'can_manage_company',
    },
    {
      title: 'Roles y Permisos',
      value: 'roles',
      content: <RolesSettings />,
      requiredPermission: 'can_manage_roles',
    },
  ]

  return <SettingsLayout tabs={tabsData} />
}

export { Profile }
