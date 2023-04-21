import { FC, useState } from 'react'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import AddInventoryForm from './components/AddInventoryForm'
import { Button } from 'antd'
import AddInventoryFormCSV from './components/AddInventoryFormCSV'
import { columns } from './data/columnsData'
import { IInventoryProps, ModalStateEnum } from './types/InventoryTypes'
import { formatNumberToColombianPesos, formatToUsd } from '../../utils/helpers'
import { useGroups } from '../../hooks/useGroups'
import { useInventories } from '../../hooks/useInventories'

export const formatinventoryPhoto = (inventories: IInventoryProps[]) => {
  return inventories.map((item) => ({
    ...item,
    price: item.price,
    photoInfo: (
      <img
        className='w-16 h-16 object-contain overflow-hidden hover:scale-150 transition-all transform-gpu'
        src={item.photo}
      />
    ),
  }))
}

const inventoriesDataFormated = (inventories: IInventoryProps[]) => {
  return inventories.map((item) => ({
    ...item,
    price: formatNumberToColombianPesos(item.price),
    usd_price: formatToUsd(item.usd_price),
  }))
}

const Inventories: FC = () => {
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
        dataSource={inventoriesDataFormated(formatinventoryPhoto(inventoriesData?.results || []))}
        columns={columns}
        fetching={isLoading}
        totalItems={inventoriesData?.count || 0}
        currentPage={currentPage}
        extraButton={
          <Button
            onClick={() => setModalState(ModalStateEnum.addItemsCSV)}
            style={{ background: '#269962', borderColor: '#269962' }}
            type='primary'
          >
            + items .csv
          </Button>
        }
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

export default Inventories
