import { FC, useEffect, useState } from 'react'
import { axiosRequest } from '../../api/api'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { DataPropsForm } from '../../types/AuthTypes'
import { usersURL } from '../../utils/network'
import AddUserForm from './components/AddUserForm'

interface IUserProps {
  created_at: string
  email: string
  fullname: string
  is_active: string
  last_login: string
  role: string
  id: number
  key?: number
}

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

  const columns = [
    {
      title: 'ID',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Nombre',
      dataIndex: 'fullname',
      key: 'fullname',
    },
    {
      title: 'Activo',
      dataIndex: 'is_active',
      key: 'is_active',
    },
    {
      title: 'Última conexión',
      dataIndex: 'last_login',
      key: 'last_login',
    },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Fecha de creación',
      dataIndex: 'created_at',
      key: 'created_at',
    },
  ]

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
