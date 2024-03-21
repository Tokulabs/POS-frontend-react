import { FC, useState } from 'react'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import AddInventoryForm from './components/AddInventoryForm'
import { Button, Popconfirm, notification } from 'antd'
import AddInventoryFormCSV from './components/AddInventoryFormCSV'
import { columns } from './data/columnsData'
import { formatNumberToColombianPesos } from '../../utils/helpers'
import { useGroups } from '../../hooks/useGroups'
import { useInventories } from '../../hooks/useInventories'
import { IInventoryProps } from '../Inventories/types/InventoryTypes'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { deleteInventories } from '../Inventories/helpers/services'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ModalStateEnum } from '../../types/ModalTypes'

export const formatinventoryPhoto = (inventories: IInventoryProps[]) => {
  return inventories.map((item) => ({
    ...item,
    photoInfo: item.photo ? (
      <img
        className='w-16 h-16 object-contain overflow-hidden hover:scale-150 transition-all transform-gpu'
        src={item.photo}
      />
    ) : (
      'N/A'
    ),
  }))
}

const Storage: FC = () => {
  const [modalState, setModalState] = useState<ModalStateEnum>(ModalStateEnum.off)
  const [currentPage, setcurrentPage] = useState(1)
  const [editData, setEditData] = useState<IInventoryProps>({} as IInventoryProps)

  const { isLoading, inventoriesData } = useInventories('paginatedInventories', {
    page: currentPage,
  })
  const { groupsData } = useGroups('allGroups', {})

  const queryClient = useQueryClient()

  const { mutate, isLoading: isLoadingDelete } = useMutation({
    mutationFn: deleteInventories,
    onSuccess: () => {
      queryClient.invalidateQueries(['paginatedInventories'])
      notification.success({
        message: 'Exito',
        description: 'Item eliminado!',
      })
    },
  })

  const confirm = (id: number) => {
    if (isLoadingDelete) return
    mutate(id)
  }

  const formatEditAndDelete = (inventories: IInventoryProps[]) => {
    const showCurrency = true
    return inventories.map((item) => ({
      ...item,
      selling_price: formatNumberToColombianPesos(item.selling_price ?? 0, showCurrency),
      buying_price: formatNumberToColombianPesos(item.buying_price ?? 0, showCurrency),
      action: (
        <div className='flex justify-center items-center gap-2'>
          <Button type='link' className='p-0' onClick={editInventoryItem(item)}>
            <IconEdit />
          </Button>
          <Popconfirm
            title='Eliminar Producto'
            description='¿Estas seguro de eliminar este producto?'
            onConfirm={() => confirm(item.id)}
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

  const editInventoryItem = (item: IInventoryProps) => () => {
    setEditData(item)
    setModalState(ModalStateEnum.addItem)
  }

  return (
    <>
      <ContentLayout
        pageTitle='Administrador de Inventario'
        buttonTitle='Agregar productos'
        setModalState={() => {
          setEditData({} as IInventoryProps)
          setModalState(ModalStateEnum.addItem)
        }}
        dataSource={formatEditAndDelete(formatinventoryPhoto(inventoriesData?.results || []))}
        columns={columns}
        fetching={isLoading}
        totalItems={inventoriesData?.count || 0}
        currentPage={currentPage}
        onChangePage={(page) => setcurrentPage(page)}
      >
        {modalState === ModalStateEnum.addItem && (
          <AddInventoryForm
            initialData={editData}
            onSuccessCallback={() => setModalState(ModalStateEnum.off)}
            isVisible={modalState === ModalStateEnum.addItem}
            onCancelCallback={() => setModalState(ModalStateEnum.off)}
            groups={groupsData?.results ?? []}
          />
        )}
        <AddInventoryFormCSV
          onSuccessCallback={() => setModalState(ModalStateEnum.off)}
          isVisible={modalState === ModalStateEnum.addItemsCSV}
          onCancelCallback={() => setModalState(ModalStateEnum.off)}
        />
      </ContentLayout>
    </>
  )
}

export default Storage
