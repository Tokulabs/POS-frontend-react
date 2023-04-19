import { FC, useState } from 'react'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { DataPropsForm, IPaginationProps } from '../../types/GlobalTypes'
import AddUserForm from './components/AddUserForm'
import { columns } from './data/columsData'
import { IUserProps } from './types/UserTypes'
import { useGetUsers } from '../../hooks/useGetUsers'
import { getUsers } from '../../hooks/helper/functions'

const Users: FC = () => {
  const [modalState, setModalState] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [users, setUser] = useState<IPaginationProps<IUserProps>>()
  const [currentPage, setcurrentPage] = useState(1)

  useGetUsers(setUser, setFetching)

  const onCreateUSer = () => {
    setModalState(false)
    getUsers(setUser, setFetching)
    setcurrentPage(1)
  }

  const onChangePagination = (page: number) => {
    getUsers(setUser, setFetching, { page: page })
    setcurrentPage(page)
  }

  return (
    <>
      <ContentLayout
        pageTitle='Usuarios'
        buttonTitle='Agregar Usuario'
        setModalState={setModalState}
        dataSource={users?.results as unknown as DataPropsForm[]}
        columns={columns}
        totalItems={users?.count || 0}
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

export default Users
