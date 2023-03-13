import { FC, useEffect, useState } from 'react'
import { axiosRequest } from '../../api/api'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { formatDateTime } from '../../layouts/helpers/helpers'
import { DataPropsForm } from '../../types/GlobalTypes'
import { usersURL } from '../../utils/network'
import AddUserForm from './components/AddUserForm'
import { columns } from './data/columsData'
import { IUserProps } from './types/UserTypes'

const Users: FC = () => {
  const [modalState, setModalState] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [users, setUser] = useState<IUserProps[]>()

  useEffect(() => {
    getUsers()
  }, [])

  const onCreateUSer = () => {
    setModalState(false)
    getUsers()
  }

  const getUsers = async () => {
    try {
      setFetching(true)
      const response = await axiosRequest<{ results: IUserProps[] }>({
        url: usersURL,
        hasAuth: true,
        showError: false,
      })
      if (response) {
        const data = response.data.results.map((item) => ({
          ...item,
          key: item.id,
          created_at: formatDateTime(item.created_at),
          is_active: item.is_active.toString(),
        }))
        setUser(data)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setFetching(false)
    }
  }

  return (
    <>
      <ContentLayout
        pageTitle='Usuarios'
        buttonTitle='Agregar Usuario'
        setModalState={setModalState}
        dataSource={users as unknown as DataPropsForm[]}
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

export default Users
