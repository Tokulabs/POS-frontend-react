import { FC, useEffect, useState } from 'react'
import { axiosRequest } from '../../api/api'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { formatDateTime } from '../../layouts/helpers/helpers'
import { DataPropsForm } from '../../types/GlobalTypes'
import { activitiesURL } from '../../utils/network'
import { columns } from './data/columnsData'
import { IActivitiesProps } from './types/UserActivities'

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
        const data = response.data.results.map((item) => ({
          ...item,
          created_at: formatDateTime(item.created_at),
          key: item.id,
        }))
        setUserActivities(data)
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
