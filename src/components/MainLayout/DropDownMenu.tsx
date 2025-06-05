import { FC, useContext } from 'react'
import UserAvatar from '@/assets/icons/user-avatar.svg'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconLogout, IconSettings, IconUser } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { store } from '@/store'
import { formatDateTime } from '@/layouts/helpers/helpers'
import { UserRolesEnum } from '@/pages/Users/types/UserTypes'
import { logout } from '@/pages/Auth/helpers'
import { useRolePermissions } from '@/hooks/useRolespermissions'

const UserDropdownMenu: FC = () => {
  const { state } = useContext(store)
  const navigate = useNavigate()
  const { hasPermission: hasUserActivityPermission } = useRolePermissions({
    allowedRoles: [UserRolesEnum.admin],
  })

  const logoutUser = () => {
    logout()
    navigate('/login')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className='w-8 h-8 cursor-pointer hover:bg-transparent'>
          <img
            className='object-cover w-full h-full rounded-full'
            src={state.user?.photo ?? UserAvatar}
            alt='user-avatar'
          />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className='w-[250px] justify-items-start mr-[2vw] border-solid'>
        <DropdownMenuLabel>
          <span className='text-lg font-semibold text-black'>{state.user?.fullname}</span>
          <br />
          <span className='text-xs font-normal text-black'>
            (Rol - {UserRolesEnum[state.user?.role as keyof typeof UserRolesEnum]})
          </span>
          <br />
          <span className='text-xs font-normal text-black'>{state.user?.company.name}</span>
          <br />
          <span className='text-xs font-normal text-black'>
            <span>Última conexión:</span> {formatDateTime(state.user?.last_login)}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className='w-screen bg-gray-1' />

        <DropdownMenuGroup className='w-full'>
          <DropdownMenuItem
            className='flex items-center self-start w-full gap-2 cursor-pointer'
            onClick={() => navigate('/settings')}
          >
            <IconUser size={15} color='Black' className='m-0' />
            <span className='font-bold'>Perfil</span>
          </DropdownMenuItem>
          {hasUserActivityPermission && (
            <DropdownMenuItem
              className='flex items-center self-start w-full gap-2 cursor-pointer'
              onClick={() => navigate('/user-activities')}
            >
              <IconSettings size={15} color='Black' />
              <span className='font-bold text-black no-underline'>Actividad de Usuario</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            className='flex items-center self-start w-full gap-2 cursor-pointer'
            onClick={logoutUser}
          >
            <IconLogout size={15} color='Black' />
            <span className='font-bold'>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { UserDropdownMenu }
