import { FC, useState } from 'react'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { columns } from './data/columsData'
import AddProviderForm from './Components/addProviderForm'
import { useProviders } from '../../hooks/useProviders'
import { IProvider } from './types/ProviderTypes'
import {
  IconCircleCheck,
  IconCircleX,
  IconEdit,
  IconSquareCheck,
  IconTrash,
} from '@tabler/icons-react'
import { Button, Popconfirm, Switch, notification } from 'antd'
import { ModalStateEnum } from '../../types/ModalTypes'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toggleActiveProvider } from './helpers/services'

const Providers: FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [modalState, setModalState] = useState<ModalStateEnum>(ModalStateEnum.off)
  const [showActive, setShowActive] = useState(true)
  const [editData, setEditData] = useState<IProvider>({} as IProvider)

  const { isLoading, providersData } = useProviders('paginatedProviders', {
    page: currentPage,
    active: showActive ? 'True' : undefined,
  })

  const queryClient = useQueryClient()

  const editProviderData = (item: IProvider) => () => {
    setEditData(item)
    setModalState(ModalStateEnum.addItem)
  }

  const { mutate, isPending: isLoadingDelete } = useMutation({
    mutationFn: toggleActiveProvider,
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ['paginatedProviders'] })
      notification.success({
        message: 'Exito',
        description: `Proveedor ${item?.data.active ? 'Activado' : 'Desactivado'}`,
      })
    },
  })

  const toggleActive = (id: number) => {
    if (isLoadingDelete) return
    mutate(id)
  }

  const formatEditAndDelete = (paymentTerminals: IProvider[]) => {
    return paymentTerminals.map((item) => ({
      ...item,
      active: item.active ? (
        <IconCircleCheck className='text-green-1' />
      ) : (
        <IconCircleX className='text-red-1' />
      ),
      action: (
        <div className='flex justify-center items-center gap-2'>
          <Button type='link' className='p-0' onClick={editProviderData(item)}>
            <IconEdit />
          </Button>
          <Popconfirm
            title={`${item.active ? 'Desactivar' : 'Activar'} Proveedor`}
            description={`¿Estas seguro de ${item.active ? 'desactivar' : 'activar'} este proveedor?`}
            onConfirm={() => toggleActive(item.id)}
            okText={`Si ${item.active ? 'Desactivar' : 'Activar'}`}
            cancelText='Cancelar'
          >
            <Button type='link' className='p-0'>
              {item.active ? (
                <IconTrash className='text-red-1 hover:text-red-400' />
              ) : (
                <IconSquareCheck className='text-green-1 hover:text-green-400' />
              )}
            </Button>
          </Popconfirm>
        </div>
      ),
    }))
  }

  return (
    <>
      <ContentLayout
        pageTitle='Provedores'
        buttonTitle='Crear proveedor'
        extraButton={
          <div className='flex flex-col items-center gap-2'>
            <span className='font-bold text-green-1'>Activos</span>
            <Switch
              value={showActive}
              loading={isLoading}
              onChange={() => setShowActive(!showActive)}
            />
          </div>
        }
        setModalState={() => {
          setEditData({} as IProvider)
          setModalState(ModalStateEnum.addItem)
        }}
        dataSource={formatEditAndDelete(providersData?.results || [])}
        columns={columns}
        totalItems={providersData?.count ?? 0}
        fetching={isLoading}
        currentPage={currentPage}
        onChangePage={(page) => setCurrentPage(page)}
      >
        {modalState === ModalStateEnum.addItem && (
          <AddProviderForm
            initialData={editData}
            onSuccessCallback={() => setModalState(ModalStateEnum.off)}
            isVisible={modalState === ModalStateEnum.addItem}
            onCancelCallback={() => setModalState(ModalStateEnum.off)}
          />
        )}
      </ContentLayout>
    </>
  )
}

export { Providers }
