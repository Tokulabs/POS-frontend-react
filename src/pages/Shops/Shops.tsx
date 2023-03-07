import { FC, useEffect, useState } from 'react'
import { axiosRequest } from '../../api/api'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { DataPropsForm } from '../../types/AuthTypes'
import { shopURL } from '../../utils/network'
import AddUserForm from './components/AddShopForm'

interface IShopProps {
  id: number
  created_at: string
  name: string
  created_by: DataPropsForm
  created_by_email?: string
}

const Shops: FC = () => {
  const [modalState, setModalState] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [shops, setShops] = useState<IShopProps[]>()

  useEffect(() => {
    getShops()
  }, [])

  const onCreateUSer = () => {
    setModalState(false)
    getShops()
  }

  const getShops = async () => {
    try {
      setFetching(true)
      const response = await axiosRequest<{ results: IShopProps[] }>({
        url: shopURL,
        hasAuth: true,
        showError: false,
      })
      if (response) {
        const data = response.data.results.map((item) => ({
          ...item,
          created_by_email: String(item.created_by.email),
        }))
        setShops(data)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setFetching(false)
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Creado Por',
      dataIndex: 'created_by_email',
      key: 'created_by_email',
    },
    {
      title: 'Fecha de creación',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '',
      dataIndex: 'actions',
      key: 'actions',
    },
  ]

  return (
    <>
      <ContentLayout
        pageTitle='Tiendas'
        buttonTitle='Agregar Tienda'
        setModalState={setModalState}
        dataSource={shops as unknown as DataPropsForm[]}
        columns={columns}
        fetching={fetching}
      >
        <AddUserForm
          onSuccessCallback={onCreateUSer}
          isVisible={modalState}
          onCancelCallback={() => setModalState(false)}
        />
      </ContentLayout>
    </>
  )
}
export default Shops
