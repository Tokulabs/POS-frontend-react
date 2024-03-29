import { FC, useState } from 'react'
import { useDianResolutions } from '../../hooks/useDianResolution'
import AddDianResolutionForm from './components/AddDianResolutionForm'
import { IconArticle, IconArticleOff } from '@tabler/icons-react'

const Dian: FC = () => {
  const [modalState, setModalState] = useState(false)

  const { dianResolutionData, isLoading } = useDianResolutions('allDianResolutions', {})

  return (
    <>
      {isLoading ? (
        <h1>Cargando...</h1>
      ) : (
        <div className='bg-white rounded p-4 flex flex-col gap-8'>
          <h4 className='font-bold'>Resoluciones DIAN</h4>
          <span>
            Tenga en cuenta que si crea una resolución nueva esta quedara activa y las demás no
          </span>
          <button onClick={() => setModalState(true)}>Agregar Resolución de la DIAN</button>
          {dianResolutionData?.results.map((item, index) => (
            <div
              key={item.document_number}
              className={`flex justify-start items-center border-solid border-2 rounded-lg gap-5 p-5 ${
                index === 0 ? 'border-green-500' : 'border-red-500 opacity-60'
              }`}
            >
              <div>
                {index === 0 ? (
                  <div className='flex flex-col items-center'>
                    <IconArticle size={100} color='#22c55e' />
                    <p className='font-bold text-green-500 text-lg m-0'>Activo</p>
                  </div>
                ) : (
                  <div className='flex flex-col items-center'>
                    <IconArticleOff size={100} color='#ef4444' />
                    <p className='font-bold text-red-500 text-lg m-0'>Inactivo</p>
                  </div>
                )}{' '}
              </div>
              <div className='flex flex-col'>
                <h1
                  className={`font-bold text-2xl ${
                    index === 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {item.document_number}
                </h1>
                <div className='flex gap-8 items-center'>
                  <div className='flex flex-col'>
                    <span className='text-sm'>Fechas válidas</span>
                    <span className='font-bold'>{`${item.from_date} / ${item.to_date}`}</span>
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-sm'>Número habilitados</span>
                    <span className='font-bold'>{`${item.from_number} - ${item.to_number}`}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <AddDianResolutionForm
            onSuccessCallback={() => setModalState(false)}
            isVisible={modalState}
            onCancelCallback={() => setModalState(false)}
          />
        </div>
      )}
    </>
  )
}

export default Dian
