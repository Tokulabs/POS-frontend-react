import { FC, useEffect, useState } from 'react'
import { axiosRequest } from '../../api/api'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { DataPropsForm } from '../../types/AuthTypes'
import { activitiesURL } from '../../utils/network'

interface IActivitiesProps {
  id: number
  created_at: string
  fullname: string
  email: DataPropsForm
  action: string
}

const UserActivities: FC = () => {
  const [fetching, setFetching] = useState(false)
  const [userActivities, setUserActivities] = useState<IActivitiesProps[]>()

  useEffect(() => {
    getUserActivities()
  }, [])

  const getUserActivities = async () => {
    try {
      setFetching(true)
      const response = await axiosRequest<{ results: IActivitiesProps[] }>({
        url: activitiesURL,
        hasAuth: true,
        showError: false,
      })
      if (response) {
        const data = response.data.results
        setUserActivities(data)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setFetching(false)
    }
  }

  const columns = [
    {
      title: 'Usuario',
      dataIndex: 'fullname',
      key: 'fullname',
    },
    {
      title: 'Correo',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Accion realizada',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Fecha',
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
        pageTitle='Actividad de los usuarios'
        dataSource={userActivities as unknown as DataPropsForm[]}
        columns={columns}
        fetching={fetching}
        disabledAddButton={true}
      />
    </>
  )
}
export default UserActivities
