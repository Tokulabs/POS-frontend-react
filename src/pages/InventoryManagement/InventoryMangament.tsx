import {
  IconFileUpload,
  IconPencil,
  IconArrowRight,
  IconDownload,
  IconTablePlus,
  IconUpload,
  IconInfoCircle,
} from '@tabler/icons-react'
import { FC, useState } from 'react'
import ImportProducts from './components/ImportProducts'
import UpdateProducts from './components/UpdateProducts'

const InventoryManagement: FC = () => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null)

  const cards = [
    {
      id: 'import',
      title: 'Importar Productos',
      description: 'Cree nuevos productos de manera masiva utilizando un archivo CSV',
      icon: IconFileUpload,
    },
    {
      id: 'update',
      title: 'Actualizar Productos',
      description: 'Edite la información de múltiples productos utilizando un archivo CSV',
      icon: IconPencil,
    },
  ]

  const steps = [
    {
      step: '1',
      icon: IconDownload,
      title: 'Descargue la plantilla',
      description: 'Descargue el archivo CSV de plantilla con el formato correcto para sus productos.',
    },
    {
      step: '2',
      icon: IconTablePlus,
      title: 'Complete la información',
      description: 'Agregue los datos de sus productos en el archivo siguiendo el formato indicado.',
    },
    {
      step: '3',
      icon: IconUpload,
      title: 'Suba el archivo',
      description: 'Seleccione una de las opciones de arriba y cargue su archivo CSV completado.',
    },
  ]

  if (selectedCard === 'import') {
    return <ImportProducts onBack={() => setSelectedCard(null)} />
  }

  if (selectedCard === 'update') {
    return <UpdateProducts onBack={() => setSelectedCard(null)} />
  }

  return (
    <div className='bg-card h-full w-full p-8 md:p-10 overflow-y-auto'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100'>
          Gestión de Inventario
        </h1>
        <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
          Administre su inventario de manera eficiente
        </p>
      </div>

      {/* Action Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.id}
              className='group relative rounded-2xl border border-zinc-200 dark:border-zinc-700/60
                bg-white dark:bg-zinc-800/50 p-6 cursor-pointer
                shadow-sm hover:shadow-lg
                hover:border-green-1/40 dark:hover:border-green-1/50
                transition-all duration-200 ease-out hover:-translate-y-0.5'
              onClick={() => setSelectedCard(card.id)}
            >
              <div className='flex items-start gap-4'>
                {/* Icon circle */}
                <div className='flex-shrink-0 w-14 h-14 rounded-xl bg-green-50 dark:bg-green-900/20
                  flex items-center justify-center
                  group-hover:bg-green-1 transition-colors duration-200'>
                  <Icon
                    size={28}
                    strokeWidth={1.5}
                    className='text-green-1 group-hover:text-white transition-colors duration-200'
                  />
                </div>

                {/* Text content */}
                <div className='flex-1 min-w-0'>
                  <h2 className='text-base font-semibold text-zinc-900 dark:text-zinc-100
                    group-hover:text-green-1 dark:group-hover:text-green-400 transition-colors duration-200'>
                    {card.title}
                  </h2>
                  <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed'>
                    {card.description}
                  </p>
                </div>

                {/* Arrow */}
                <div className='flex-shrink-0 self-center'>
                  <IconArrowRight
                    size={20}
                    className='text-zinc-300 dark:text-zinc-600
                      group-hover:text-green-1 dark:group-hover:text-green-400
                      group-hover:translate-x-1
                      transition-all duration-200'
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Divider */}
      <div className='my-8 border-t border-zinc-100 dark:border-zinc-800' />

      {/* How it works */}
      <div>
        <h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-5'>
          ¿Cómo funciona?
        </h3>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-5'>
          {steps.map((step) => {
            const StepIcon = step.icon
            return (
              <div
                key={step.step}
                className='relative rounded-xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-700/40 p-5'
              >
                <div className='flex items-center gap-3 mb-3'>
                  <div className='w-8 h-8 rounded-lg bg-green-1/10 dark:bg-green-900/30 flex items-center justify-center'>
                    <StepIcon size={18} strokeWidth={1.5} className='text-green-1 dark:text-green-400' />
                  </div>
                  <span className='text-xs font-bold text-green-1 dark:text-green-400 uppercase tracking-wider'>
                    Paso {step.step}
                  </span>
                </div>
                <h4 className='text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1'>
                  {step.title}
                </h4>
                <p className='text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed'>
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tip */}
      <div className='mt-6 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 p-4 flex items-start gap-3'>
        <IconInfoCircle size={20} className='text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5' />
        <div>
          <p className='text-sm font-medium text-blue-800 dark:text-blue-300'>
            Consejo
          </p>
          <p className='text-xs text-blue-600 dark:text-blue-400 mt-0.5 leading-relaxed'>
            Asegúrese de que su archivo CSV esté codificado en UTF-8 y que las columnas coincidan con
            la plantilla proporcionada para evitar errores en la importación.
          </p>
        </div>
      </div>
    </div>
  )
}

export { InventoryManagement }
