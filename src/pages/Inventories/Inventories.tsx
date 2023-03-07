import { FC, useEffect, useState } from 'react'
import { useGetGroups } from '../../hooks/useGetGroups'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { DataPropsForm } from '../../types/AuthTypes'
import { IGroupsProps } from '../Groups/InventoryGroups'
import AddInventoryForm from './components/AddInventoryForm'
import { inventoryURL } from './../../utils/network'
import { axiosRequest } from '../../api/api'
import { Button } from 'antd'
import AddInventoryFormCSV from './components/AddInventoryFormCSV'

export interface IInventoryProps {
  id: number
  code: string
  name: string
  created_by: {
    email: string
  }
  group: {
    name: string
    id: number
  } | null
  created_at: string
  remainig: number
  price: number
  photo: string
}

enum ModalStateEnum {
  addItem,
  addItemsCSV,
  off,
}

const Inventories: FC = () => {
  const [modalState, setModalState] = useState<ModalStateEnum>(ModalStateEnum.off)
  const [fetching, setFetching] = useState(false)
  const [groups, setGroups] = useState<IGroupsProps[]>([])
  const [inventories, setInventories] = useState<IInventoryProps[]>([])

  useGetGroups(setGroups, () => null)

  const onCreateInventory = () => {
    setModalState(ModalStateEnum.off)
    getInventories()
  }

  const columns = [
    {
      title: 'Codigo',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Foto',
      dataIndex: 'photoInfo',
      key: 'photoInfo',
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Categoria',
      dataIndex: 'groupInfo',
      key: 'groupInfo',
    },
    {
      title: 'Precio',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Unidades restantes',
      dataIndex: 'remaining',
      key: 'remaining',
    },
    {
      title: 'Añadido el',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '',
      dataIndex: 'action',
      key: 'action',
    },
  ]

  const getInventories = async () => {
    try {
      setFetching(true)
      const response = await axiosRequest<{ results: IInventoryProps[] }>({
        url: inventoryURL,
        hasAuth: true,
        showError: false,
      })
      if (response) {
        const data = response.data.results.map((item) => ({
          ...item,
          groupInfo: item.group?.name,
          photoInfo: (
            <img
              className='w-16 h-16 object-contain overflow-hidden hover:scale-150 transition-all transform-gpu'
              src={item.photo}
            />
          ),
        }))
        setInventories(data)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    getInventories()
  }, [])

  return (
    <>
      <ContentLayout
        pageTitle='Administrador de Inventario'
        buttonTitle='+ Item'
        setModalState={() => setModalState(ModalStateEnum.addItem)}
        dataSource={inventories as unknown as DataPropsForm[]}
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
