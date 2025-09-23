import { IconFileUpload, IconPencil } from '@tabler/icons-react'
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
      icon: (
        <IconFileUpload
          size={150}
          strokeWidth={0.5}
          className='text-green-1 group-hover:text-white transition-colors'
        />
      ),
    },
    {
      id: 'update',
      title: 'Actualizar Productos',
      description: 'Edite la información de múltiples productos utilizando un archivo CSV',
      icon: (
        <IconPencil
          size={150}
          strokeWidth={0.5}
          className='text-green-1 group-hover:text-white transition-colors'
        />
      ),
    },
  ]

  if (selectedCard === 'import') {
    return <ImportProducts onBack={() => setSelectedCard(null)} />
  }

  if (selectedCard === 'update') {
    return <UpdateProducts onBack={() => setSelectedCard(null)} />
  }

  return (
    <div className='bg-white  h-full w-full p-10'>
      <h1 className='text-3xl font-semibold font-sans'>Gestión de Inventario</h1>
      <div className='flex justify-center gap-32 p-20 flex-wrap'>
        {cards.map((card) => (
          <div
            key={card.id}
            className='group rounded-xl py-20 px-10 flex flex-col items-center cursor-pointer 
              transition-all bg-white hover:bg-green-1 hover:text-white shadow-md max-w-[400px] hover:scale-105'
            onClick={() => setSelectedCard(card.id)}
          >
            <div className='mb-4'>{card.icon}</div>
            <h2 className='text-2xl font-semibold mb-2 text-green-1 group-hover:text-white text-center'>
              {card.title}
            </h2>
            <p className='text-center text-gray-500 group-hover:text-white'>{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export { InventoryManagement }
