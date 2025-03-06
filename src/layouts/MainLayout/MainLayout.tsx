import { FC, PropsWithChildren, useContext, useEffect, useState } from 'react'
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
import { IconLogout, IconAlertTriangleFilled } from '@tabler/icons-react'
import * as React from 'react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { logout } from '@/pages/Auth/helpers'
import { SideBarData, navigationMenu } from './data/data'
import { useLocation, useNavigate } from 'react-router-dom'
import { store } from '@/store'
import { formatDateTime } from '../helpers/helpers'
import { useRolePermissions } from '@/hooks/useRolespermissions'
import { useCart } from '@/store/useCartStoreZustand'
import { useCustomerData } from '@/store/useCustomerStoreZustand'
import { usePOSStep } from '@/store/usePOSSteps'
import { usePaymentMethodsData } from '@/store/usePaymentMethodsZustand'
import { Spin } from 'antd'
import { DownloadReports } from '@/components/DownloadReports/DownloadReports'
import { ModalStateEnum } from '@/types/ModalTypes'
import { UserRolesEnum } from '@/pages/Users/types/UserTypes'
import KiospotLogoHorizontal from '@/assets/logos/Kiospot-Horizontal-Logo-Color.webp'
import { AddGoals } from '@/components/Goals/AddGoals'
import { axiosRequest } from '@/api/api'
import { requestVerificationEmailURL } from '@/utils/network'
import { toast } from 'sonner'
import { ConfirmEmailVerification } from '@/components/ConfirmEmailVerification/ConfirmEmailVerify'
import { useCountDown } from '@/hooks/useCountDown'

const MainLayout: FC<PropsWithChildren> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalStateEnum>(ModalStateEnum.off)
  const [modalStateGoals, setModalStateGoals] = useState<ModalStateEnum>(ModalStateEnum.off)
  const [modalVerifyEmail, setModalVerifyEmail] = useState(false)
  const [loadingVerifyRequest, setLoadingVerifyRequest] = useState(false)
  const [showClickVerify, setShowClickVerify] = useState(true)

  const { state } = useContext(store)
  const location = useLocation()
  const navigate = useNavigate()
  const { start, time } = useCountDown(3, () => setShowClickVerify(true))

  const { updateCurrentStep } = usePOSStep()
  const { clearPaymentMethods } = usePaymentMethodsData()
  const { clearCart } = useCart()
  const { clearCustomerData } = useCustomerData()

  useEffect(() => {
    updateCurrentStep(0)
    clearCustomerData()
    clearCart()
    clearPaymentMethods()
  }, [location])

  const openDownloadModal = () => {
    setModalState(ModalStateEnum.addItem)
  }

  const openGoalsModal = () => {
    setModalStateGoals(ModalStateEnum.addItem)
  }

  const logoutUser = () => {
    logout()
    navigate('/login')
  }

  const verifyEmailRequest = async () => {
    try {
      setLoadingVerifyRequest(true)
      start()
      setShowClickVerify(false)
      const response = await axiosRequest<{ message: string }>({
        method: 'post',
        url: requestVerificationEmailURL,
        errorObject: {
          message: 'Error al enviar correo de verificación',
        },
        hasAuth: true,
      })
      if (response?.status === 200) {
        toast.success(response.data.message)
        setModalVerifyEmail(true)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setLoadingVerifyRequest(false)
    }
  }

  return (
    <section className='h-screen max-h-screen w-full relative'>
      <nav className='w-full h-16 flex justify-between items-center py-0 absolute top-0 bg-white'>
        <div className='flex flex-col justify-center items-start w-56 h-16 object-cover mt-2'>
          <a href='/'>
            <img
              className='ml-10 w-100% h-20'
              src={KiospotLogoHorizontal}
              alt='Kiospot Logo Horizontal'
            />
          </a>
        </div>

        {/* Filtrar elementos del menú antes de renderizarlos */}
        <div className='mt-4 -ml-[56%] flex'>
          <NavigationMenu>
            <NavigationMenuList className='gap-2'>
              {navigationMenu
                .map((item) => {
                  if (item.allowedRoles) {
                    const { hasPermission } = useRolePermissions({
                      allowedRoles: item.allowedRoles,
                    })
                    if (!hasPermission) return null
                  }

                  // Filtrar los children según los permisos ANTES de calcular la longitud
                  const filteredChildren =
                    item.children?.filter((child) => {
                      if (child.allowedRoles) {
                        const { hasPermission } = useRolePermissions({
                          allowedRoles: child.allowedRoles,
                        })
                        return hasPermission
                      }
                      return true
                    }) ?? []

                  return (
                    <NavigationMenuItem key={item.label}>
                      <NavigationMenuTrigger className='border-none bg-transparent font-semibold'>
                        {item.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className='bg-white p-2 pt-4 cursor-pointer'>
                        <div className='max-h-[550px]'>
                          <ul
                            className={`flex flex-wrap w-full list-none p-0 gap-2 ${
                              filteredChildren.length > 1
                                ? 'min-w-[480px]'
                                : 'justify-center min-w-[250px]'
                            }`}
                          >
                            {filteredChildren.map((child) => (
                              <li key={child.label}>
                                {child.link ? (
                                  <NavigationMenuLink
                                    className={`${navigationMenuTriggerStyle()} no-underline text-black text-lg w-full h-full block`}
                                    href={child.link}
                                  >
                                    <div className='grid grid-cols-1 gap-0 w-full max-w-[200px]'>
                                      <span className='text-base'>{child.label}</span>
                                      <span className='text-gray-500 break-words whitespace-normal'>
                                        {child.Description}
                                      </span>
                                    </div>
                                  </NavigationMenuLink>
                                ) : (
                                  <span
                                    className={`${navigationMenuTriggerStyle()} no-underline text-black text-lg w-full h-full block cursor-pointer`}
                                    onClick={() => {
                                      if (child.action === 'openGoalsModal') openGoalsModal()
                                      if (child.action === 'openDownloadModal') openDownloadModal()
                                    }}
                                  >
                                    <div className='grid grid-cols-1 gap-0 w-full max-w-[200px]'>
                                      <span className='text-base'>{child.label}</span>
                                      <span className='text-gray-500 break-words whitespace-normal'>
                                        {child.Description}
                                      </span>
                                    </div>
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  )
                })
                .filter(Boolean)}

              <NavigationMenuItem>
                <NavigationMenuLink
                  className={`${navigationMenuTriggerStyle()} font-semibold no-underline text-black text-lg w-full h-full block bg-transparent`}
                  href='/pos'
                >
                  POS
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className='mr-10'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                className='border-none bg-transparent shadow-none text-transparent hover:bg-transparent cursor-pointer'
              >
                <img className='w-8 h-8' src={UserAvatar} alt='user-avatar' />
              </Button>
            </DropdownMenuTrigger>
            {(() => {
              const hasUserActivityPermission = useRolePermissions({
                allowedRoles:
                  SideBarData.find((item) => item.path === '/user-activities')?.allowedRoles || [],
              }).hasPermission

              const dropdownHeight = hasUserActivityPermission ? 'h-[185px]' : 'h-[150px]'

              return (
                <DropdownMenuContent
                  className={`w-[250px] ${dropdownHeight} justify-items-start mr-16 border-solid`}
                >
                  <DropdownMenuLabel>
                    <span className='text-lg text-black font-semibold'>{state.user?.fullname}</span>
                    <br />
                    <span className='text-xs font-normal text-black'>
                      (Rol - {UserRolesEnum[state.user?.role as keyof typeof UserRolesEnum]})
                    </span>
                    <br />
                    <span className='text-xs font-normal text-black'>
                      {state.user?.company.name}
                    </span>
                    <br />
                    <span className='text-xs font-normal text-black'>
                      <span>Última conexión:</span> {formatDateTime(state.user?.last_login)}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className='w-screen bg-gray-1' />

                  <DropdownMenuGroup className='w-full justify-items-start'>
                    {hasUserActivityPermission && (
                      <DropdownMenuItem className='w-full flex items-center gap-2 pr-[35%]'>
                        <DropdownMenuShortcut>
                          <img
                            src='https://cdn-icons-png.flaticon.com/512/3524/3524659.png'
                            alt='settings-icon'
                            className='size-3'
                          />
                        </DropdownMenuShortcut>
                        <a href='/user-activities' className='font-bold text-black no-underline'>
                          Actividad de Usuario
                        </a>
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
              )
            })()}
          </DropdownMenu>
        </div>
      </nav>

      <div className='w-100 h-screen pt-16 flex bg-white'>
        <div className='h-full w-full overflow-hidden p-5 flex flex-col gap-4'>
          {!state.user?.is_verified && (
            <div className='w-full z-50 p-5 flex justify-start items-center bg-red-300 text-white rounded-md gap-1'>
              {loadingVerifyRequest ? <Spin /> : <IconAlertTriangleFilled className='mr-2' />}
              {showClickVerify && (
                <>
                  Por favor, verifica tu correo electrónico, haciendo
                  <span
                    className='font-bold hover:cursor-pointer hover:underline hover:text-blue-400'
                    onClick={verifyEmailRequest}
                  >
                    click aquí
                  </span>
                </>
              )}
              {!showClickVerify && (
                <span className='font-bold'>Vuelve a intentarlo en: {time}</span>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
      {modalState === ModalStateEnum.addItem && (
        <DownloadReports
          onSuccessCallback={() => setModalState(ModalStateEnum.off)}
          isVisible={modalState === ModalStateEnum.addItem}
          onCancelCallback={() => setModalState(ModalStateEnum.off)}
        />
      )}
      {modalStateGoals === ModalStateEnum.addItem && (
        <AddGoals
          onSuccessCallback={() => setModalStateGoals(ModalStateEnum.off)}
          isVisible={modalStateGoals === ModalStateEnum.addItem}
          onCancelCallback={() => setModalStateGoals(ModalStateEnum.off)}
        />
      )}
      {modalVerifyEmail && (
        <ConfirmEmailVerification
          onSuccessCallback={() => setModalVerifyEmail(false)}
          isVisible={modalVerifyEmail}
          onCancelCallback={() => setModalVerifyEmail(false)}
        />
      )}
    </section>
  )
}

export { MainLayout }
