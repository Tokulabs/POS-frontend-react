import { FC, useState } from 'react'
import { useGetGroups } from '../../hooks/useGetGroups'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { DataPropsForm } from '../../types/GlobalTypes'
import AddInventoryForm from './components/AddInventoryForm'
import { Button } from 'antd'
import AddInventoryFormCSV from './components/AddInventoryFormCSV'
import { useGetInventories } from '../../hooks/useGetInventories'
import { getInventories } from '../../hooks/helper/functions'
import { columns } from './data/columnsData'
import { IInventoryProps, ModalStateEnum } from './types/InventoryTypes'
import { IGroupsProps } from '../Groups/types/GroupTypes'

export const formatinventoryPhoto = (inventories: IInventoryProps[]) => {
  return inventories.map((item) => ({
    ...item,
    photoInfo: (
      <img
        className='w-16 h-16 object-contain overflow-hidden hover:scale-150 transition-all transform-gpu'
        src={item.photo}
      />
    ),
  }))
}

const Inventories: FC = () => {
  const [modalState, setModalState] = useState<ModalStateEnum>(ModalStateEnum.off)
  const [fetching, setFetching] = useState(false)
  const [groups, setGroups] = useState<IGroupsProps[]>([])
  const [inventories, setInventories] = useState<IInventoryProps[]>([])

  useGetGroups(setGroups, () => null)

  useGetInventories(setInventories, setFetching)

  const onCreateInventory = () => {
    setModalState(ModalStateEnum.off)
    getInventories(setInventories, setFetching)
  }

  return (
    <>
      <ContentLayout
        pageTitle='Administrador de Inventario'
        buttonTitle='+ Item'
        setModalState={() => setModalState(ModalStateEnum.addItem)}
        dataSource={formatinventoryPhoto(inventories) as unknown as DataPropsForm[]}
        columns={columns}
        fetching={fetching}
        extraButton={
          <Button
            onClick={() => setModalState(ModalStateEnum.addItemsCSV)}
            style={{ background: '#269962', borderColor: '#269962' }}
            type='primary'
          >
            + items .csv
          </Button>
        }
      >
        <AddInventoryForm
          onSuccessCallback={onCreateInventory}
          isVisible={modalState === ModalStateEnum.addItem}
          onCancelCallback={() => setModalState(ModalStateEnum.off)}
          groups={groups}
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
