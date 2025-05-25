import { FC, useContext } from 'react'
import UserAvatar from '@/assets/icons/user-avatar.svg'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
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
        <Button
          variant='outline'
          className='text-transparent bg-transparent border-none shadow-none cursor-pointer hover:bg-transparent'
        >
          <img className='w-8 h-8' src={UserAvatar} alt='user-avatar' />
        </Button>
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

        <DropdownMenuGroup className='w-full cursor-pointer'>
          <DropdownMenuItem
            className='w-full flex items-center gap-2 pr-[73%]'
            onClick={() => navigate('/profile')}
          >
            <DropdownMenuShortcut>
              <IconUser size={15} color='Black' />
            </DropdownMenuShortcut>
            <span className='font-bold cursor-pointer'>Perfil</span>
          </DropdownMenuItem>
          {hasUserActivityPermission && (
            <DropdownMenuItem className='w-full flex items-center gap-2 pr-[35%]'>
              <DropdownMenuShortcut>
                <img
                  src='https://cdn-icons-png.flaticon.com/512/3524/3524659.png'
                  alt='settings-icon'
                  className='size-3'
                />
              </DropdownMenuShortcut>
              <span
                onClick={() => navigate('/user-activities')}
                className='font-bold text-black no-underline cursor-pointer'
              >
                Actividad de Usuario
              </span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            className='w-full flex items-center gap-2 pr-[52%]'
            onClick={logoutUser}
          >
            <DropdownMenuShortcut>
              <IconLogout size={15} color='Black' />
            </DropdownMenuShortcut>
            <span className='font-bold cursor-pointer'>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { UserDropdownMenu }
