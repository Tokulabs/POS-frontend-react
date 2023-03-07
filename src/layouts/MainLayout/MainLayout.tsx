import { FC, PropsWithChildren, useContext } from 'react'
import UserAvatar from '../../assets/icons/user-avatar.svg'
import { LogOut } from 'react-feather'
import { logout } from '../../pages/Auth/helpers'
import { SideBarData } from './data/data'
import { Link, useLocation } from 'react-router-dom'
import { store } from '../../store'
import { formatDateTime } from '../helpers/helpers'

const MainLayout: FC<PropsWithChildren> = ({ children }) => {
  const { state } = useContext(store)
  const location = useLocation()

  return (
    <section className='h-screen max-h-screen w-full relative'>
      <nav className='bg-green-1 w-full h-16 flex justify-between items-center py-0 absolute top-0'>
        <h1 className='w-56 text-white m-0 px-5'>INVENTORY SYSTEM</h1>
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
          <button
            onClick={() => logout()}
            className='flex items-center gap-1 border-solid border-[1px] border-white py-2 px-4 rounded-lg bg-[#ffffff20] cursor-pointer'
          >
            <p className='text-white m-0 text-sm'>Cerrar Sesión</p>
            <LogOut size={15} color='#FFF' />
          </button>
        </div>
      </nav>
      <div className='w-100 h-screen pt-16 flex bg-background-main'>
        <div className='w-56 bg-white'>
          <ul className='list-none p-0 m-0 mt-12 ml-5'>
            {SideBarData.map((item, index) => {
              const Icon = item.icon
              const active = location.pathname === item.path
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
        <div className='max-h-screen overflow-hidden overflow-y-auto flex-1 p-5'>
          <div>{children}</div>
        </div>
      </div>
    </section>
  )
}

export default MainLayout
