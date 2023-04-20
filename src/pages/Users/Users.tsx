import { FC, useState } from 'react'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { DataPropsForm } from '../../types/GlobalTypes'
import AddUserForm from './components/AddUserForm'
import { columns } from './data/columsData'
import { useUsers } from '../../hooks/useUsers'

const Users: FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [modalState, setModalState] = useState(false)
  const { isLoading, usersData } = useUsers('paginatedUsers', { page: currentPage })

  return (
    <>
      <ContentLayout
        pageTitle='Usuarios'
        buttonTitle='Agregar Usuario'
        setModalState={setModalState}
        dataSource={usersData?.results as unknown as DataPropsForm[]}
        columns={columns}
        totalItems={usersData?.count ?? 0}
        fetching={isLoading}
        currentPage={currentPage}
        onChangePage={(page) => setCurrentPage(page)}
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

export default Users
