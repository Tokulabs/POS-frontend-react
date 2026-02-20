import { FC } from 'react'
import { IconFileOff } from '@tabler/icons-react'

interface EmptyResolutionStateProps {
  onCreateClick: () => void
}

const EmptyResolutionState: FC<EmptyResolutionStateProps> = ({ onCreateClick }) => {
  return (
    <div className='flex flex-col items-center justify-center py-16 px-4'>
      <div className='w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6'>
        <IconFileOff size={40} className='text-muted-foreground' />
      </div>
      <h3 className='text-xl font-semibold text-foreground mb-2'>
        No hay resoluciones registradas
      </h3>
      <p className='text-sm text-muted-foreground text-center max-w-sm mb-6'>
        Crea tu primera resolución DIAN para empezar a gestionar la facturación de tu negocio.
      </p>
      <button
        onClick={onCreateClick}
        className='px-5 py-2.5 bg-green-1 text-white rounded-lg font-medium text-sm
          hover:bg-green-1/90 transition-colors duration-200
          focus:outline-hidden focus:ring-2 focus:ring-green-1/50 focus:ring-offset-2 focus:ring-offset-background'
      >
        + Crear resolución
      </button>
    </div>
  )
}

export { EmptyResolutionState }
