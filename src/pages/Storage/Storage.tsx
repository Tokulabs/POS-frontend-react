import { FC, useState } from 'react'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import AddInventoryForm from './components/AddInventoryForm'
import { Button } from 'antd'
import AddInventoryFormCSV from './components/AddInventoryFormCSV'
import { columns } from './data/columnsData'
import { formatNumberToColombianPesos } from '../../utils/helpers'
import { useGroups } from '../../hooks/useGroups'
import { useInventories } from '../../hooks/useInventories'
import { IInventoryProps, ModalStateEnum } from '../Inventories/types/InventoryTypes'
import { IconEdit, IconTrash } from '@tabler/icons-react'

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

const editInventoryItem = (item: IInventoryProps) => () => {
  console.log(item)
}

const removeInventoryItem = (id: number) => () => {
  console.log(id)
}

const storageDataFormated = (inventories: IInventoryProps[]) => {
  return inventories.map((item) => ({
    ...item,
    selling_price: formatNumberToColombianPesos(item.selling_price ?? 0),
    buying_price: formatNumberToColombianPesos(item.buying_price ?? 0),
    action: (
      <div className='flex justify-center items-center gap-2'>
        <Button type='link' className='p-0' onClick={editInventoryItem(item)}>
          <IconEdit />
        </Button>
        <Button type='link' className='p-0' onClick={removeInventoryItem(item.id)}>
          <IconTrash className='text-red-1 hover:text-red-400' />
        </Button>
      </div>
    ),
  }))
}

const Storage: FC = () => {
  const [modalState, setModalState] = useState<ModalStateEnum>(ModalStateEnum.off)
  const [currentPage, setcurrentPage] = useState(1)

  const { isLoading, inventoriesData } = useInventories('paginatedInventories', {
    page: currentPage,
  })
  const { groupsData } = useGroups('allGroups', {})

  return (
    <>
      <ContentLayout
        pageTitle='Administrador de Inventario'
        buttonTitle='Agregar productos'
        setModalState={() => setModalState(ModalStateEnum.addItem)}
        dataSource={storageDataFormated(formatinventoryPhoto(inventoriesData?.results || []))}
        columns={columns}
        fetching={isLoading}
        totalItems={inventoriesData?.count || 0}
        currentPage={currentPage}
        onChangePage={(page) => setcurrentPage(page)}
      >
        <AddInventoryForm
          onSuccessCallback={() => setModalState(ModalStateEnum.off)}
          isVisible={modalState === ModalStateEnum.addItem}
          onCancelCallback={() => setModalState(ModalStateEnum.off)}
          groups={groupsData?.results ?? []}
        />
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
