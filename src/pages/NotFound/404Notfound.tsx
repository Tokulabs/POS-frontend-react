import { IconHome } from '@tabler/icons-react'
import { Button } from 'antd'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'

const Notfound: FC<{ fullscreen?: boolean }> = ({ fullscreen = false }) => {
  const navigate = useNavigate()
  const goToHome = () => {
    navigate('/')
  }
  return (
    <section
      className={`w-full ${fullscreen ? 'h-screen' : 'h-full'} flex flex-col justify-center items-center`}
    >
      <h2 className='text-9xl font-bold text-green-1 m-0'>404</h2>
      <p className='text-sm font-semibold text-gray-600'>
        No pudimos encontrar la página que buscas ...
      </p>
      <Button type='primary' size='large' onClick={goToHome}>
        <div className='mx-6 flex justify-center items-center gap-2'>
          <IconHome size={26} />
          <span>Ir a Inicio</span>
        </div>
      </Button>
    </section>
  )
}

export default Notfound
