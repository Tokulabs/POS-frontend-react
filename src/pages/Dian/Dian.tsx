import { FC } from 'react'
import { useDianResolutions } from '../../hooks/useDianResolution'

const Dian: FC = () => {
  const { dianResolutionData, isLoading } = useDianResolutions('allDianResolutions', {})

  return (
    <>
      {isLoading ? (
        <h1>Cargando...</h1>
      ) : (
        <div className='bg-white rounded p-4 flex flex-col gap-8'>
          {dianResolutionData?.data.map((item) => (
            <div key={item.document_number} className=''>
              <p>Resolución: {item.document_number}</p>
              <p>Fecha de inicio: {item.from_date}</p>
              <p>Fecha de finalización: {item.to_date}</p>
              <p>Valido desde: {item.from_number}</p>
              <p>Valido hasta: {item.to_number}</p>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default Dian
