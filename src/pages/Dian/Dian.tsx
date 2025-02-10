import { FC, useEffect, useState } from 'react'
import { useDianResolutions } from '@/hooks/useDianResolution'
import AddDianResolutionForm from './components/AddDianResolutionForm'
import {
  IconArticle,
  IconArticleOff,
  IconCirclePlus,
  IconDeviceFloppy,
  IconEdit,
} from '@tabler/icons-react'
import { Button, InputNumber, Spin, Switch } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { putDiaResolution, toggleDianResolution } from './helpers/services'
import { Reorder } from 'framer-motion'
import { UserRolesEnum } from '../Users/types/UserTypes'
import { useRolePermissions } from '@/hooks/useRolespermissions'
import { IDianResolutionProps } from './types/DianResolutionTypes'
import { toast } from 'sonner'
import { ToggleSwitch } from '@/components/ToggleSwitch/ToggleSwitch'

const Dian: FC = () => {
  const [modalState, setModalState] = useState(false)
  const [currentNumber, setCurrentNumber] = useState<number>(0)
  const [edit, setEdit] = useState(false)
  const allowedRolesOverride = [UserRolesEnum.admin, UserRolesEnum.posAdmin]
  const { hasPermission } = useRolePermissions({ allowedRoles: allowedRolesOverride })
  const [resolutionType, setResolutionType] = useState(0)

  const options = [{ label: 'Resoluciones POS' }, { label: 'Resoluciones F.E.' }]

  const { dianResolutionData, isPending } = useDianResolutions('allDianResolutions', {
    type: !resolutionType ? 'POS' : 'ElectronicInvoice',
  })

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

  useEffect(() => {
    setCurrentNumber(
      dianResolutionData?.results.filter((item) => item.active)[0]?.current_number ?? 0,
    )
  }, [dianResolutionData])

  const { mutate, isPending: isPendingToggle } = useMutation({
    mutationFn: toggleDianResolution,
    onSuccess: () => {
      toast.success('Resolución actualizada!')
      queryClient.invalidateQueries({ queryKey: ['allDianResolutions'] })
    },
  })

  const { mutate: mutatePut, isPending: isPendingPut } = useMutation({
    mutationFn: putDiaResolution,
    onSuccess: () => {
      toast.success('Último número actualizado!')
      queryClient.invalidateQueries({ queryKey: ['allDianResolutions'] })
    },
  })

  const toggleResolutionActive = (id: number) => async () => {
    mutate(id)
  }

  const updateCurrentNumber = (item: IDianResolutionProps) => {
    const infoDianToUpdate = {
      current_number: currentNumber,
      document_number: item.document_number,
      from_date: item.from_date,
      from_number: item.from_number,
      to_date: item.to_date,
      to_number: item.to_number,
    }
    mutatePut({ id: item.id, payload: infoDianToUpdate })
    setEdit(false)
  }

  return (
    <section className='h-full'>
      {isPending ? (
        <Spin size='large' />
      ) : (
        <div className='h-full bg-white rounded p-4 flex flex-col justify-between gap-3'>
          <div className='w-full flex justify-between items-end gap-4 mx-auto bg-white'>
            <div className='w-full flex gap-4 justify-center flex-col'>
              <h4 className='font-bold text-green-1 text-3xl m-0'>Resoluciones DIAN</h4>
              <span className='font-semibold text-xs text-gray-2'>
                Solo puedes tener una resolución activa a la vez por tipo
              </span>
              <div className='w-3/4 lg:w-1/2'>
                <ToggleSwitch
                  options={options}
                  selectedIndex={resolutionType}
                  onSelect={setResolutionType}
                />
              </div>
            </div>
            <Button
              className='flex justify-center items-center gap-1'
              type='primary'
              onClick={() => setModalState(true)}
            >
              <IconCirclePlus /> <span>Resolución de la DIAN</span>
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
                      <div className='flex gap-10 items-top'>
                        <div className='flex flex-col gap-2 justify-between'>
                          <span className='text-sm'>Fechas válidas</span>
                          <span className='font-bold'>{`${item.from_date} / ${item.to_date}`}</span>
                        </div>
                        <div className='flex flex-col gap-2 justify-between'>
                          <span className='text-sm'>Número habilitados</span>
                          <span className='font-bold'>{`${item.from_number} - ${item.to_number}`}</span>
                        </div>
                        <div className='flex flex-col gap-2 justify-between'>
                          <span className='text-sm'>Última factura registrada</span>
                          <div className='flex items-center gap-3 cursor-pointer'>
                            <span className='font-bold'>{item.current_number}</span>
                            {hasPermission &&
                              item.active &&
                              (edit ? (
                                <InputNumber
                                  style={{ width: '12rem' }}
                                  addonAfter={
                                    isPendingPut ? (
                                      <Spin size='small' />
                                    ) : (
                                      <span
                                        onClick={() => updateCurrentNumber(item)}
                                        className='text-green-1 cursor-pointer'
                                      >
                                        <IconDeviceFloppy size={24} />
                                      </span>
                                    )
                                  }
                                  onPressEnter={() => updateCurrentNumber(item)}
                                  value={currentNumber}
                                  onChange={(value) => setCurrentNumber(value as number)}
                                  disabled={isPendingPut}
                                />
                              ) : (
                                <span className='text-green-1'>
                                  <IconEdit onClick={() => setEdit(true)} size={20} />
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='flex flex-col items-center gap-4'>
                    <span
                      className={`font-bold ${item.active ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {item.active ? 'Desactivar' : 'Activar'}
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
