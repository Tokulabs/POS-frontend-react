import { FC, useEffect, useState } from 'react'
import { axiosRequest } from '../../api/api'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { formatDateTime } from '../../layouts/helpers/helpers'
import { DataPropsForm } from '../../types/GlobalTypes'
import { activitiesURL } from '../../utils/network'
import { columns } from './data/columnsData'
import { IActivitiesProps } from './types/UserActivities'
import { IPaginationProps } from './../../types/GlobalTypes'

const UserActivities: FC = () => {
  const [fetching, setFetching] = useState(false)
  const [userActivities, setUserActivities] = useState<IPaginationProps<IActivitiesProps>>()
  const [currentPage, setcurrentPage] = useState(1)

  useEffect(() => {
    getUserActivities()
  }, [])

  const onChangePagination = (page: number) => {
    getUserActivities(page)
    setcurrentPage(page)
  }

  const getUserActivities = async (page = 1) => {
    try {
      setFetching(true)
      const finalURL = new URL(activitiesURL)
      finalURL.searchParams.append('page', String(page))
      const response = await axiosRequest<IPaginationProps<IActivitiesProps>>({
        url: finalURL,
        hasAuth: true,
        showError: false,
      })
      if (response) {
        const data = response.data.results.map((item) => ({
          ...item,
          key: item.id,
          created_at: formatDateTime(item.created_at),
        }))
        setUserActivities({ ...response.data, results: data })
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
        dataSource={userActivities?.results as unknown as DataPropsForm[]}
        columns={columns}
        fetching={fetching}
        disabledAddButton={true}
        currentPage={currentPage}
        totalItems={userActivities?.count || 0}
        onChangePage={(page) => onChangePagination(page)}
      />
    </>
  )
}
export default UserActivities
