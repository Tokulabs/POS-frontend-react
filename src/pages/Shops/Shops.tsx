import { FC, useState } from 'react'
import { getShops } from '../../hooks/helper/functions'
import { useGetShops } from '../../hooks/useGetShops'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { DataPropsForm, IPaginationProps } from '../../types/GlobalTypes'
import AddUserForm from './components/AddShopForm'
import { columns } from './data/columnsData'
import { IShopProps } from './types/ShopTypes'

const Shops: FC = () => {
  const [modalState, setModalState] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [shops, setShops] = useState<IPaginationProps<IShopProps>>()
  const [currentPage, setcurrentPage] = useState(1)

  useGetShops(setShops, setFetching)

  const onCreateUSer = () => {
    setModalState(false)
    getShops(setShops, setFetching)
    setcurrentPage(1)
  }

  const onChangePagination = (page: number) => {
    getShops(setShops, setFetching, page)
    setcurrentPage(page)
  }

  return (
    <>
      <ContentLayout
        pageTitle='Tiendas'
        buttonTitle='Agregar Tienda'
        setModalState={setModalState}
        dataSource={shops?.results as unknown as DataPropsForm[]}
        totalItems={shops?.count || 0}
        columns={columns}
        fetching={fetching}
        currentPage={currentPage}
        onChangePage={(page) => onChangePagination(page)}
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
