import { FC, useState } from 'react'
import { getShops } from '../../hooks/helper/functions'
import { useGetShops } from '../../hooks/useGetShops'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { DataPropsForm } from '../../types/GlobalTypes'
import AddUserForm from './components/AddShopForm'
import { columns } from './data/columnsData'
import { IShopProps } from './types/ShopTypes'

const Shops: FC = () => {
  const [modalState, setModalState] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [shops, setShops] = useState<IShopProps[]>()

  const onCreateUSer = () => {
    setModalState(false)
    getShops(setShops, setFetching)
  }

  useGetShops(setShops, setFetching)

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
