import { FC, useState } from 'react'
import ContentLayout from '../../layouts/ContentLayout/ContentLayout'
import { DataPropsForm, IPaginationProps } from '../../types/GlobalTypes'
import AddGroupForm from './components/AddGroupForm'
import { useGetGroups } from './../../hooks/useGetGroups'
import { getGroups } from '../../hooks/helper/functions'
import { columns } from './data/columnData'
import { IGroupsProps } from './types/GroupTypes'

const Users: FC = () => {
  const [modalState, setModalState] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [groups, setGroups] = useState<IPaginationProps<IGroupsProps>>(
    {} as IPaginationProps<IGroupsProps>,
  )
  const [groupsForSelect, setGroupsForSelect] = useState<IPaginationProps<IGroupsProps>>(
    {} as IPaginationProps<IGroupsProps>,
  )
  const [currentPage, setcurrentPage] = useState(1)

  useGetGroups(setGroups, setFetching, 1)
  useGetGroups(setGroupsForSelect, setFetching, undefined, [groups.count])

  const onCreateGroup = () => {
    setModalState(false)
    getGroups(setGroups, setFetching, 1)
    setcurrentPage(1)
  }

  const onChangePagination = (page: number) => {
    getGroups(setGroups, setFetching, page)
    setcurrentPage(page)
  }

  return (
    <>
      <ContentLayout
        pageTitle='Categorias'
        buttonTitle='+ Categoria'
        setModalState={setModalState}
        dataSource={groups?.results as unknown as DataPropsForm[]}
        columns={columns}
        fetching={fetching}
        totalItems={groups?.count || 0}
        currentPage={currentPage}
        onChangePage={(page) => onChangePagination(page)}
      >
        <AddGroupForm
          onSuccessCallback={onCreateGroup}
          isVisible={modalState}
          onCancelCallback={() => setModalState(false)}
          groups={groupsForSelect?.results || []}
        />
      </ContentLayout>
    </>
  )
}

export default Users
