import { FC, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { IconAlertTriangleFilled } from '@tabler/icons-react'
import NavigationMenuComponent from '@/components/MainLayout/NavigationMenu'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { store } from '@/store'
import { useCart } from '@/store/useCartStoreZustand'
import { useCustomerData } from '@/store/useCustomerStoreZustand'
import { usePOSStep } from '@/store/usePOSSteps'
import { usePaymentMethodsData } from '@/store/usePaymentMethodsZustand'
import { Spin } from 'antd'
import { DownloadReports } from '@/components/DownloadReports/DownloadReports'
import { ModalStateEnum } from '@/types/ModalTypes'
import KiospotLogoHorizontal from '@/assets/logos/Kiospot-Horizontal-Logo-Color.webp'
import { AddGoals } from '@/components/Goals/AddGoals'
import { axiosRequest } from '@/api/api'
import { requestVerificationEmailURL } from '@/utils/network'
import { toast } from 'sonner'
import { ConfirmEmailVerification } from '@/components/ConfirmEmailVerification/ConfirmEmailVerify'
import { useCountDown } from '@/hooks/useCountDown'
import { UserDropdownMenu } from '@/components/MainLayout/DropDownMenu'
import { MobileNavigationMenu } from '@/components/MainLayout/MobileMenu'
import { useCartOrders } from '@/store/useCartStoreOrdersZustand'
import { SideBarData } from './data/data'
import { useRolePermissions } from '@/hooks/useRolespermissions'

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
  const { clearCart: clearCartOrders } = useCartOrders()
  const { clearCustomerData } = useCustomerData()

  useEffect(() => {
    updateCurrentStep(0)
    clearCustomerData()
    clearCart()
    clearPaymentMethods()
    clearCartOrders()
  }, [location])

  const openDownloadModal = () => {
    setModalState(ModalStateEnum.addItem)
  }

  const openGoalsModal = () => {
    setModalStateGoals(ModalStateEnum.addItem)
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
      <nav className='w-full h-16 flex justify-between items-center py-0 px-5 absolute top-0 bg-white'>
        <MobileNavigationMenu
          openGoalsModal={openGoalsModal}
          openDownloadModal={openDownloadModal}
        />
        <div className='flex justify-start items-center w-full'>
          <img
            onClick={() => navigate('/')}
            className='h-16 cursor-pointer'
            src={KiospotLogoHorizontal}
            alt='Kiospot Logo Horizontal'
          />
          <div className='hidden md:block'>
            <NavigationMenuComponent
              openGoalsModal={openGoalsModal}
              openDownloadModal={openDownloadModal}
            />
          </div>
        </div>
        <UserDropdownMenu />
      </nav>
      <div className='w-100 h-screen pt-16 flex bg-background-main'>
        <div className='w-56 bg-white'>
          <ul className='list-none p-0 m-0 mt-12 ml-5'>
            {SideBarData.map((item, index) => {
              if (item.showInSideBar === false) return null
              const active = location.pathname === item.path
              if (item.allowedRoles) {
                const { hasPermission } = useRolePermissions({ allowedRoles: item.allowedRoles })

                if (!hasPermission) {
                  return null
                }
              }
              const Icon = item.icon
              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`flex items-center mb-7 cursor-pointer gap-3 no-underline ${
                      active ? 'text-green-1' : 'text-gray-1'
                    } `}
                  >
                    {Icon && <Icon />}
                    <span className='text-sm'>{item.title}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
        <div className='h-full w-full overflow-hidden p-5 flex flex-col gap-4'>
          {!state.user?.is_verified && (
            <div className='w-full z-1 p-5 flex justify-start items-center bg-red-300 text-white rounded-md gap-1'>
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
