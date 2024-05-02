import { FC, useState } from 'react'
import { useDianResolutions } from '../../hooks/useDianResolution'
import AddDianResolutionForm from './components/AddDianResolutionForm'
import { IconArticle, IconArticleOff } from '@tabler/icons-react'
import { Button, Spin, Switch } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toggleDianResolution } from './helpers/services'

const Dian: FC = () => {
  const [modalState, setModalState] = useState(false)

  const { dianResolutionData, isPending } = useDianResolutions('allDianResolutions', {})

  const queryClient = useQueryClient()

  const { mutate, isPending: isPendingToggle } = useMutation({
    mutationFn: toggleDianResolution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDianResolutions'] })
    },
  })

  const toggleResolutionActive = (id: number) => async () => {
    mutate(id)
  }

  return (
    <>
      {isPending ? (
        <h1>Cargando...</h1>
      ) : (
        <div className='bg-white rounded p-4 flex flex-col gap-8'>
          <h4 className='font-bold'>Resoluciones DIAN</h4>
          <span>
            Tenga en cuenta que solo puede tener una resolucion de la DIAN activa a la vez
          </span>
          <Button type='primary' onClick={() => setModalState(true)}>
            Agregar Resolución de la DIAN
          </Button>
          {dianResolutionData?.results.map((item) => (
            <div
              key={item.document_number}
              className={`flex justify-between items-center border-solid border-2 rounded-lg gap-5 p-5 ${
                item.active ? 'border-green-500' : 'border-red-500 opacity-60'
              }`}
            >
              <div className='flex items-center gap-8'>
                <div>
                  {item.active ? (
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
                      item.active ? 'text-green-500' : 'text-red-500'
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

              <div className='flex flex-col items-center gap-4'>
                <span className={`font-bold ${item.active ? 'text-green-500' : 'text-red-500'}`}>
                  Activar / Desactivar resolución
                </span>
                <Switch
                  value={item.active}
                  loading={isPendingToggle}
                  onChange={toggleResolutionActive(item.id)}
                />
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
