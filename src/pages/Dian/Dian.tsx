import { FC, useState } from 'react'
import { useDianResolutions } from '../../hooks/useDianResolution'
import AddDianResolutionForm from './components/AddDianResolutionForm'
import { IconArticle, IconArticleOff } from '@tabler/icons-react'
import { Button, Spin, Switch } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toggleDianResolution } from './helpers/services'
import { Reorder } from 'framer-motion'

const Dian: FC = () => {
  const [modalState, setModalState] = useState(false)

  const { dianResolutionData, isPending } = useDianResolutions('allDianResolutions', {})

  const sortedDianDataResolution = dianResolutionData?.results.sort((a, b) => {
    if (a.active && !b.active) {
      return -1
    }
    if (!a.active && b.active) {
      return 1
    }
    return 0
  })

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
    <section className='h-full'>
      {isPending ? (
        <Spin size='large' />
      ) : (
        <div className='h-full bg-white rounded p-4 flex flex-col justify-between gap-3'>
          <div className='w-full flex flex-col gap-4 mx-auto bg-white'>
            <div className='w-full flex gap-1 justify-center flex-col'>
              <h4 className='font-bold text-green-1 text-3xl m-0'>Resoluciones DIAN</h4>
              <span className='font-semibold text-sm'>
                (Tenga en cuenta que solo puede tener una resolucion de la DIAN activa a la vez)
              </span>
            </div>
            <Button className='w-full' type='primary' onClick={() => setModalState(true)}>
              Agregar Resolución de la DIAN
            </Button>
          </div>
          <div className='h-full overflow-hidden overflow-y-auto scrollbar-hide'>
            <Reorder.Group
              as='div'
              axis='y'
              values={sortedDianDataResolution ?? []}
              onReorder={() => null}
              className='flex flex-col gap-4 list-none'
            >
              {sortedDianDataResolution?.map((item) => (
                <Reorder.Item
                  key={item.document_number}
                  value={item}
                  as='div'
                  className={`flex justify-between items-center border-solid border-2 rounded-lg gap-5 p-5 bg-white ${
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
                      )}
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
                        <div className='flex flex-col'>
                          <span className='text-sm'>Última factura #</span>
                          <span className='font-bold'>{item.current_number}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='flex flex-col items-center gap-4'>
                    <span
                      className={`font-bold ${item.active ? 'text-green-500' : 'text-red-500'}`}
                    >
                      Activar / Desactivar resolución
                    </span>
                    <Switch
                      value={item.active}
                      loading={isPendingToggle}
                      onChange={toggleResolutionActive(item.id)}
                    />
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        </div>
      )}
      <AddDianResolutionForm
        onSuccessCallback={() => setModalState(false)}
        isVisible={modalState}
        onCancelCallback={() => setModalState(false)}
      />
    </section>
  )
}

export { Dian }
