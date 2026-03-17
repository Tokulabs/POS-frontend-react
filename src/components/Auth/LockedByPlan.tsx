import { FC } from 'react'
import { Link } from 'react-router-dom'

const LockedByPlan: FC = () => (
  <div className='flex flex-col items-center justify-center h-full gap-4 p-8'>
    <div className='text-5xl'>🔒</div>
    <h2 className='text-2xl font-bold text-foreground'>Función no disponible en tu plan</h2>
    <p className='text-muted-foreground text-center max-w-md'>
      Esta función no está incluida en tu plan actual. Actualiza tu plan para acceder.
    </p>
    <Link
      to='/settings'
      className='px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity'
    >
      Ver planes y suscripción
    </Link>
  </div>
)

export { LockedByPlan }
