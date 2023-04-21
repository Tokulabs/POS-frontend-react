import { FC, useState } from 'react'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { DataPropsForm } from '../../types/GlobalTypes'
import AddGroupForm from './components/AddGroupForm'
import { columns } from './data/columnData'
import { useGroups } from '../../hooks/useGroups'

const Users: FC = () => {
  const [currentPage, setcurrentPage] = useState(1)
  const [modalState, setModalState] = useState(false)
  const { groupsData, isLoading } = useGroups('paginatedGroups', { page: currentPage })

  return (
    <>
      <ContentLayout
        pageTitle='Categorias'
        buttonTitle='+ Categoria'
        setModalState={setModalState}
        dataSource={groupsData?.results as unknown as DataPropsForm[]}
        columns={columns}
        fetching={isLoading}
        totalItems={groupsData?.count || 0}
        currentPage={currentPage}
        onChangePage={(page) => setcurrentPage(page)}
      >
        {modalState && (
          <AddGroupForm
            onSuccessCallback={() => setModalState(false)}
            isVisible={modalState}
            onCancelCallback={() => setModalState(false)}
          />
        )}
      </ContentLayout>
    </>
  )
}

export default Users
