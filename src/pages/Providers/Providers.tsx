import { FC, useState } from 'react'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { columns } from './data/columsData'
import AddProviderForm from './Components/addProviderForm'
import { useProviders } from '../../hooks/useProviders'
import { IProvider } from './types/ProviderTypes'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { Button, Popconfirm, notification } from 'antd'
import { ModalStateEnum } from '../../types/ModalTypes'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteProviders } from './helpers/services'

const Providers: FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [modalState, setModalState] = useState<ModalStateEnum>(ModalStateEnum.off)
  const { isLoading, providersData } = useProviders('paginatedProviders', {
    page: currentPage,
  })
  const [editData, setEditData] = useState<IProvider>({} as IProvider)

  const queryClient = useQueryClient()

  const editProviderData = (item: IProvider) => () => {
    setEditData(item)
    setModalState(ModalStateEnum.addItem)
  }

  const { mutate, isPending: isLoadingDelete } = useMutation({
    mutationFn: deleteProviders,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paginatedProviders'] })
      notification.success({
        message: 'Exito',
        description: 'Datafono eliminado!',
      })
    },
  })

  const confirmDelete = (id: number) => {
    if (isLoadingDelete) return
    mutate(id)
  }

  const formatEditAndDelete = (paymentTerminals: IProvider[]) => {
    return paymentTerminals.map((item) => ({
      ...item,
      action: (
        <div className='flex justify-center items-center gap-2'>
          <Button type='link' className='p-0' onClick={editProviderData(item)}>
            <IconEdit />
          </Button>
          <Popconfirm
            title='Eliminar Proveedor'
            description='¿Estas seguro de eliminar este proveedor?'
            onConfirm={() => confirmDelete(item.id)}
            okText='Si, Eliminar'
            cancelText='Cancelar'
          >
            <Button type='link' className='p-0'>
              <IconTrash className='text-red-1 hover:text-red-400' />
            </Button>{' '}
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

export default Providers
