import { FC, PropsWithChildren, useContext, useEffect, useState } from 'react'
import UserAvatar from '@/assets/icons/user-avatar.svg'
import {
  IconBookDownload,
  IconLogout,
  IconTargetArrow,
  IconAlertTriangleFilled,
} from '@tabler/icons-react'
import { logout } from '@/pages/Auth/helpers'
import { SideBarData } from './data/data'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { store } from '@/store'
import { formatDateTime } from '../helpers/helpers'
import { useRolePermissions } from '@/hooks/useRolespermissions'
import { useCart } from '@/store/useCartStoreZustand'
import { useCustomerData } from '@/store/useCustomerStoreZustand'
import { usePOSStep } from '@/store/usePOSSteps'
import { usePaymentMethodsData } from '@/store/usePaymentMethodsZustand'
import { Image, Spin, Tooltip } from 'antd'
import { DownloadReports } from '@/components/DownloadReports/DownloadReports'
import { ModalStateEnum } from '@/types/ModalTypes'
import { UserRolesEnum } from '@/pages/Users/types/UserTypes'
import KiospotLogoHorizontal from '@/assets/logos/Kiospot_logo_horizontal.webp'
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

  const notAllowedRolesDownload = [UserRolesEnum.supportSales]
  const { hasPermission: hasPermissionDownloads } = useRolePermissions({
    notAllowedRoles: notAllowedRolesDownload,
  })

  const allowedRolesGoals = [UserRolesEnum.admin, UserRolesEnum.posAdmin]
  const { hasPermission: hasPermissionGoals } = useRolePermissions({
    allowedRoles: allowedRolesGoals,
  })

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
      <nav className='bg-green-1 w-full h-16 flex justify-between items-center py-0 absolute top-0'>
        <div className='flex flex-col justify-center items-start w-48 h-16 object-cover'>
          <Image
            style={{ width: '100%', height: '100%' }}
            src={KiospotLogoHorizontal}
            alt='Kiospot Logo Horizontal'
            preview={false}
          />
        </div>
        <div className='flex items-center gap-6'>
          <div className='flex items-center gap-2'>
            <img className='w-8 h-8' src={UserAvatar} alt='user-avatar' />
            <div className='flex flex-col items-start'>
              <div className='flex gap-1'>
                <span className='m-0 text-sm text-white'>{state.user?.fullname}</span>
                <span className='font-bold text-white text-sm'>
                  (Rol - {UserRolesEnum[state.user?.role as keyof typeof UserRolesEnum]})
                </span>
              </div>
              <div className='flex gap-1 justify-center sm-0 text-[10px] text-white'>
                <span>Última conexión:</span>
                <span>{formatDateTime(state.user?.last_login)}</span>
              </div>
              <div className='flex gap-1 justify-center sm-0 text-[10px] text-white'>
                <span>{state.user?.company.name}</span>
              </div>
            </div>
          </div>
          <div className='flex items-center justify-between flex-1 px-5 gap-5'>
            {hasPermissionDownloads && (
              <Tooltip title='Descargar Reportes'>
                <span
                  className='text-white hover:text-gray-100 cursor-pointer flex flex-col items-center'
                  onClick={openDownloadModal}
                >
                  <IconBookDownload size={30} />
                </span>
              </Tooltip>
            )}
            {hasPermissionGoals && (
              <Tooltip title='Metas Generales'>
                <span
                  className='text-white hover:text-gray-100 cursor-pointer flex flex-col items-center'
                  onClick={openGoalsModal}
                >
                  <IconTargetArrow size={30} />
                </span>
              </Tooltip>
            )}
            <button
              onClick={logoutUser}
              className='flex items-center gap-1 border-solid border-[1px] border-white py-2 px-4 rounded-lg bg-[#ffffff20] cursor-pointer'
            >
              <p className='text-white m-0 text-sm'>Cerrar Sesión</p>
              <IconLogout size={15} color='#FFF' />
            </button>
          </div>
        </div>
      </nav>
      <div className='w-100 h-screen pt-16 flex bg-background-main'>
        <div className='w-56 bg-white'>
          <ul className='list-none p-0 m-0 mt-12 ml-5'>
            {SideBarData.map((item, index) => {
              const Icon = item.icon
              const active = location.pathname === item.path
              if (item.allowedRoles) {
                const { hasPermission } = useRolePermissions({ allowedRoles: item.allowedRoles })

                if (!hasPermission) {
                  return null
                }
              }
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`flex items-center mb-7 cursor-pointer gap-3 no-underline ${
                      active ? 'text-green-1' : 'text-gray-1'
                    } `}
                  >
                    <Icon />
                    <span className='text-sm'>{item.title}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
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
