import { FC, useState } from 'react'
import { useGetGroups } from '../../hooks/useGetGroups'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { IPaginationProps } from '../../types/GlobalTypes'
import AddInventoryForm from './components/AddInventoryForm'
import { Button } from 'antd'
import AddInventoryFormCSV from './components/AddInventoryFormCSV'
import { useGetInventories } from '../../hooks/useGetInventories'
import { getInventories } from '../../hooks/helper/functions'
import { columns } from './data/columnsData'
import { IInventoryProps, ModalStateEnum } from './types/InventoryTypes'
import { IGroupsProps } from '../Groups/types/GroupTypes'
import { formatNumberToColombianPesos, formatToUsd } from '../../utils/helpers'

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
  const [fetching, setFetching] = useState(false)
  const [groups, setGroups] = useState<IPaginationProps<IGroupsProps>>(
    {} as IPaginationProps<IGroupsProps>,
  )
  const [inventories, setInventories] = useState<IPaginationProps<IInventoryProps>>()
  const [currentPage, setcurrentPage] = useState(1)

  useGetGroups(setGroups, () => null)

  useGetInventories(setInventories, setFetching)

  const onCreateInventory = () => {
    setModalState(ModalStateEnum.off)
    getInventories(setInventories, setFetching)
    setcurrentPage(1)
  }

  const onChangePagination = (page: number) => {
    getInventories(setInventories, setFetching, page)
    setcurrentPage(page)
  }

  return (
    <>
      <ContentLayout
        pageTitle='Administrador de Inventario'
        buttonTitle='+ Item'
        setModalState={() => setModalState(ModalStateEnum.addItem)}
        dataSource={inventoriesDataFormated(formatinventoryPhoto(inventories?.results || []))}
        columns={columns}
        fetching={fetching}
        totalItems={inventories?.count || 0}
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
        onChangePage={(page) => onChangePagination(page)}
      >
        <AddInventoryForm
          onSuccessCallback={onCreateInventory}
          isVisible={modalState === ModalStateEnum.addItem}
          onCancelCallback={() => setModalState(ModalStateEnum.off)}
          groups={groups.results || []}
        />
        <AddInventoryFormCSV
          onSuccessCallback={onCreateInventory}
          isVisible={modalState === ModalStateEnum.addItemsCSV}
          onCancelCallback={() => setModalState(ModalStateEnum.off)}
        />
      </ContentLayout>
    </>
  )
}

export default Inventories
