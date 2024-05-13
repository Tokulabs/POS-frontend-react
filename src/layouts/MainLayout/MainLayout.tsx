import { FC, PropsWithChildren, useContext, useEffect, useState } from 'react'
import UserAvatar from '../../assets/icons/user-avatar.svg'
import { IconBookDownload, IconLogout } from '@tabler/icons-react'
import { logout } from '../../pages/Auth/helpers'
import { SideBarData } from './data/data'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { store } from '../../store'
import { formatDateTime } from '../helpers/helpers'
import { useRolePermissions } from '../../hooks/useRolespermissions'
import { useCart } from '../../store/useCartStoreZustand'
import { useCustomerData } from '../../store/useCustomerStoreZustand'
import { usePOSStep } from '../../store/usePOSSteps'
import { usePaymentMethodsData } from '../../store/usePaymentMethodsZustand'
import { Tooltip } from 'antd'
import { DownloadReports } from '../../components/DownloadReports/DownloadReports'
import { ModalStateEnum } from '../../types/ModalTypes'
import { UserRolesEnum } from '../../pages/Users/types/UserTypes'

const MainLayout: FC<PropsWithChildren> = ({ children }) => {
  const [modalState, setModalState] = useState<ModalStateEnum>(ModalStateEnum.off)

  const allowedRolesOverride = [
    UserRolesEnum.admin,
    UserRolesEnum.posAdmin,
    UserRolesEnum.shopAdmin,
    UserRolesEnum.sales,
  ]
  const { hasPermission: hasPermissionDownloads } = useRolePermissions(allowedRolesOverride)
  const { state } = useContext(store)
  const location = useLocation()
  const navigate = useNavigate()

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

  const logoutUser = () => {
    logout()
    navigate('/login')
  }

  return (
    <section className='h-screen max-h-screen w-full relative'>
      <nav className='bg-green-1 w-full h-16 flex justify-between items-center py-0 absolute top-0'>
        <h1 className='w-56 text-white m-0 px-5'>POS GUASA</h1>
        <div className='flex items-center justify-between flex-1 px-5'>
          <div className='flex items-center gap-2'>
            <img className='w-8 h-8' src={UserAvatar} alt='user-avatar' />
            <div className='flex flex-col'>
              <p className='m-0 text-sm text-white'>{state.user?.email}</p>
              <div className='flex gap-1 justify-center sm-0 text-[10px] text-white'>
                <span>Última conexión:</span>
                <span>{formatDateTime(state.user?.last_login)}</span>
              </div>
            </div>
          </div>
          <div className='flex items-center gap-6'>
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
                const { hasPermission } = useRolePermissions(item.allowedRoles)

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
        <div className='max-h-full w-full overflow-hidden p-5'>{children}</div>
      </div>
      <DownloadReports
        onSuccessCallback={() => setModalState(ModalStateEnum.off)}
        isVisible={modalState === ModalStateEnum.addItem}
        onCancelCallback={() => setModalState(ModalStateEnum.off)}
      />
    </section>
  )
}

export { MainLayout }
