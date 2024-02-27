import { FC, useState } from 'react'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { DataPropsForm } from '../../types/GlobalTypes'
import { columns } from './data/columnsData'
import { getUserActivitiesNew } from './helpers/services'
import { useQuery } from '@tanstack/react-query'

const UserActivities: FC = () => {
  const [currentPage, setcurrentPage] = useState(1)
  const { isLoading, data: userActivities } = useQuery(
    ['userActivities', currentPage],
    async () => getUserActivitiesNew({ page: currentPage }),
    {
      refetchOnWindowFocus: false,
    },
  )

  return (
    <>
      <ContentLayout
        pageTitle='Actividad de los usuarios'
        dataSource={userActivities?.results as unknown as DataPropsForm[]}
        columns={columns}
        fetching={isLoading}
        currentPage={currentPage}
        totalItems={userActivities?.count || 0}
        onChangePage={(page) => setcurrentPage(page)}
      />
    </>
  )
}
export default UserActivities
