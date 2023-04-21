import { FC, useState } from 'react'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { DataPropsForm } from '../../types/GlobalTypes'
import AddUserForm from './components/AddShopForm'
import { columns } from './data/columnsData'
import { useShops } from '../../hooks/useShops'

const Shops: FC = () => {
  const [currentPage, setcurrentPage] = useState(1)
  const [modalState, setModalState] = useState(false)
  const { isLoading, shopsData } = useShops('paginatedShops', { page: currentPage })

  return (
    <>
      <ContentLayout
        pageTitle='Tiendas'
        buttonTitle='Agregar Tienda'
        setModalState={setModalState}
        dataSource={shopsData?.results as unknown as DataPropsForm[]}
        totalItems={shopsData?.count || 0}
        columns={columns}
        fetching={isLoading}
        currentPage={currentPage}
        onChangePage={(page) => setcurrentPage(page)}
      >
        <AddUserForm
          onSuccessCallback={() => setModalState(false)}
          isVisible={modalState}
          onCancelCallback={() => setModalState(false)}
        />
      </ContentLayout>
    </>
  )
}
export default Shops
