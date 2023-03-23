import { FC, useEffect, useState } from 'react'
import { axiosRequest } from '../../api/api'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { formatDateTime } from '../../layouts/helpers/helpers'
import { DataPropsForm, IPaginationProps } from '../../types/GlobalTypes'
import { usersURL } from '../../utils/network'
import AddUserForm from './components/AddUserForm'
import { columns } from './data/columsData'
import { IUserProps } from './types/UserTypes'

const Users: FC = () => {
  const [modalState, setModalState] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [users, setUser] = useState<IPaginationProps<IUserProps>>()
  const [currentPage, setcurrentPage] = useState(1)

  const mainPage = 1

  useEffect(() => {
    getUsers()
  }, [])

  const onCreateUSer = () => {
    setModalState(false)
    getUsers()
    setcurrentPage(mainPage)
  }

  const getUsers = async (page = mainPage) => {
    try {
      setFetching(true)
      const finalURL = new URL(usersURL)
      finalURL.searchParams.append('page', String(page))
      const response = await axiosRequest<IPaginationProps<IUserProps>>({
        url: finalURL,
        hasAuth: true,
        showError: false,
      })
      if (response) {
        const data = response.data.results.map((item) => ({
          ...item,
          key: item.id,
          created_at: formatDateTime(item.created_at),
          last_login: item.last_login ? formatDateTime(item.last_login) : 'N/A',
          is_active: item.is_active.toString(),
        }))
        setUser({ ...response.data, results: data })
      }
    } catch (e) {
      console.log(e)
    } finally {
      setFetching(false)
    }
  }

  const onChangePagination = (page: number) => {
    getUsers(page)
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
