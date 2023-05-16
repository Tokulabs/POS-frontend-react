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

const storageDataFormated = (inventories: IInventoryProps[]) => {
  return inventories.map((item) => ({
    ...item,
    selling_price: formatNumberToColombianPesos(item.selling_price ?? 0),
    buying_price: formatNumberToColombianPesos(item.buying_price ?? 0),
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
        buttonTitle='+ Item'
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
